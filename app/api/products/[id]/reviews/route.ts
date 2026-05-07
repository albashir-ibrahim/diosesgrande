import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { rating, comment } = await req.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  try {
    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: id,
        userId: session.user.id,
      }
    });

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 });
    }

    // Check if user has purchased the product
    const purchase = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
        orderItems: {
          some: {
            productId: id
          }
        }
      }
    });

    if (!purchase) {
      return NextResponse.json({ error: "You can only review products you have purchased" }, { status: 403 });
    }

    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        productId: id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(review, { status: 201 });

  } catch (error: any) {
    console.error("Review Error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
