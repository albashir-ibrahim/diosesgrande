import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        vendor: { select: { id: true, name: true, logo: true, slug: true, description: true } },
        category: { select: { id: true, name: true } },
        reviews: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch related products from same category
    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: id } },
      take: 4,
      include: {
        vendor: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    return NextResponse.json({ product, related });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
