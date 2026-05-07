import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** GET /api/cart — fetch the current user's cart with all items */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      cartItems: {
        include: {
          product: {
            include: {
              vendor: { select: { id: true, name: true } },
              category: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });

  return NextResponse.json({ cart: cart ?? { cartItems: [] } });
}

/** POST /api/cart — add a product to cart (or increment qty if already present) */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productId, quantity = 1 } = body as { productId: string; quantity?: number };

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }
  if (quantity < 1) {
    return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 });
  }

  // Validate product exists and has stock
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (product.stock < 1) {
    return NextResponse.json({ error: "Product is out of stock" }, { status: 400 });
  }

  // Upsert cart for user
  const cart = await prisma.cart.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  // Check if item already exists in cart
  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  let cartItem;
  if (existing) {
    cartItem = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
      include: { product: { include: { vendor: { select: { name: true } } } } },
    });
  } else {
    cartItem = await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
      include: { product: { include: { vendor: { select: { name: true } } } } },
    });
  }

  return NextResponse.json({ cartItem }, { status: 201 });
}
