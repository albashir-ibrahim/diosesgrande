import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const results: Record<string, any> = {};

  try {
    results.User = await prisma.user.findFirst();
    results.Vendor = await prisma.vendor.findFirst();
    results.Category = await prisma.category.findFirst();
    results.Product = await prisma.product.findFirst({
      include: {
        vendor: true, // Test relationship
        category: true,
      }
    });
    results.Order = await prisma.order.findFirst();
    results.OrderItem = await prisma.orderItem.findFirst();
    results.Cart = await prisma.cart.findFirst();
    results.CartItem = await prisma.cartItem.findFirst();
    results.Review = await prisma.review.findFirst({
        include: {
            user: true,
            product: true
        }
    });

    console.log(JSON.stringify({ status: "SUCCESS", data: results }, null, 2));
  } catch (error: any) {
    console.error(JSON.stringify({ status: "ERROR", message: error.message }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main();
