import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { shippingAddress, contactPhone } = await req.json();

    if (!shippingAddress || !contactPhone) {
      return NextResponse.json({ error: "Shipping address and phone are required" }, { status: 400 });
    }

    // Fetch cart with items and product info
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        cartItems: {
          include: {
            product: {
              include: { vendor: true }
            }
          }
        }
      }
    });

    if (!cart || cart.cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Group items by vendor
    const itemsByVendor: Record<string, typeof cart.cartItems> = {};
    cart.cartItems.forEach(item => {
      const vId = item.product.vendorId;
      if (!itemsByVendor[vId]) itemsByVendor[vId] = [];
      itemsByVendor[vId].push(item);
    });

    // Generate a unique Paystack reference for this entire checkout session
    const paystackReference = `DG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let grandTotal = 0;
    const vendorOrdersData: any[] = [];

    for (const [vendorId, items] of Object.entries(itemsByVendor)) {
      const vendorSubtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const shippingFee = vendorSubtotal >= 20000 ? 0 : 2000;
      const vendorTotal = vendorSubtotal + shippingFee;
      
      grandTotal += vendorTotal;
      
      vendorOrdersData.push({
        vendorId,
        total: vendorTotal,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        }))
      });
    }

    // Initialize Paystack Payment
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: session.user.email,
        amount: Math.round(grandTotal * 100), // Paystack amount is in kobo
        reference: paystackReference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/checkout/verify`,
        metadata: {
          userId: session.user.id,
          cartId: cart.id,
        }
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      console.error("Paystack Init Error:", paystackData);
      return NextResponse.json({ error: "Payment initialization failed", details: paystackData.message }, { status: 500 });
    }

    // Create orders and clear cart in a transaction
    await prisma.$transaction(async (tx) => {
      for (const orderData of vendorOrdersData) {
        await tx.order.create({
          data: {
            userId: session.user.id,
            vendorId: orderData.vendorId,
            total: orderData.total,
            status: "PENDING",
            shippingAddress,
            contactPhone,
            paystackReference: paystackReference, // All orders in this session share the same reference
            orderItems: {
              create: orderData.items
            }
          }
        });
      }

      // Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    });

    return NextResponse.json({ 
      authorization_url: paystackData.data.authorization_url,
      reference: paystackReference 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Checkout failed", details: error.message }, { status: 500 });
  }
}
