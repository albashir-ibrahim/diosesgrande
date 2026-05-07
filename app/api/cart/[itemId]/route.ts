import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ itemId: string }> };

/** PATCH /api/cart/[itemId] — update quantity of a cart item */
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;
  const { quantity } = (await req.json()) as { quantity: number };

  if (!quantity || quantity < 1) {
    return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 });
  }

  // Verify the item belongs to this user's cart
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== session.user.id) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  const updated = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: {
      product: {
        include: { vendor: { select: { name: true } } },
      },
    },
  });

  return NextResponse.json({ cartItem: updated });
}

/** DELETE /api/cart/[itemId] — remove an item from the cart */
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== session.user.id) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  return NextResponse.json({ success: true });
}
