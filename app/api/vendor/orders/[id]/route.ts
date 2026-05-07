import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: session.user.id }
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        orderItems: {
          include: { product: { select: { id: true, name: true, images: true } } },
        },
      },
    });

    if (!order || order.vendorId !== vendor.id) {
      return NextResponse.json({ error: "Order not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({ order });

  } catch (error: any) {
    console.error("Order Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
