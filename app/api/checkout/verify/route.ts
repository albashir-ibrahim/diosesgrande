import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");
  const trxref = searchParams.get("trxref"); // Paystack sometimes sends this too

  const ref = reference || trxref;

  if (!ref) {
    return NextResponse.redirect(new URL("/checkout?error=No reference provided", req.url));
  }

  try {
    // Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${ref}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.status || verifyData.data.status !== "success") {
      console.error("Paystack Verification Failed:", verifyData);
      return NextResponse.redirect(new URL(`/checkout?error=Payment failed or was cancelled&ref=${ref}`, req.url));
    }

    // Success! Update all orders with this reference to PAID
    await prisma.order.updateMany({
      where: { paystackReference: ref },
      data: { status: "PAID" },
    });

    // Optional: Send confirmation email, notify vendors, etc.

    return NextResponse.redirect(new URL(`/checkout/success?ref=${ref}`, req.url));

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.redirect(new URL("/checkout?error=Internal server error during verification", req.url));
  }
}
