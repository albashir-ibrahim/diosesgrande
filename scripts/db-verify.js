const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Prisma Database Verification ---');
  
  try {
    // 1. Connection check
    await prisma.$connect();
    console.log('✅ Connected to database successfully.');

    // 2. Model Checks
    const models = [
      { name: 'User', query: () => prisma.user.findFirst() },
      { name: 'Vendor', query: () => prisma.vendor.findFirst() },
      { name: 'Category', query: () => prisma.category.findFirst() },
      { name: 'Product', query: () => prisma.product.findFirst() },
      { name: 'Order', query: () => prisma.order.findFirst() },
      { name: 'OrderItem', query: () => prisma.orderItem.findFirst() },
      { name: 'Cart', query: () => prisma.cart.findFirst() },
      { name: 'CartItem', query: () => prisma.cartItem.findFirst() },
      { name: 'Review', query: () => prisma.review.findFirst() },
    ];

    for (const model of models) {
      try {
        await model.query();
        console.log(`✅ Model ${model.name}: exists and queryable.`);
      } catch (err) {
        console.error(`❌ Model ${model.name}: failed to query.`, err.message);
      }
    }

    // 3. Relation check: Product belongs to Vendor
    console.log('\n--- Relation Verification ---');
    const productWithVendor = await prisma.product.findFirst({
      include: { vendor: true, category: true }
    });

    if (productWithVendor) {
      console.log(`✅ Relation Check: Product "${productWithVendor.name}" belongs to Vendor "${productWithVendor.vendor.name}" (Slug: ${productWithVendor.vendor.slug})`);
      console.log(`✅ Relation Check: Product "${productWithVendor.name}" belongs to Category "${productWithVendor.category.name}"`);
    } else {
      console.log('ℹ️ No products found to verify relations.');
    }

    // 4. Order -> Vendor relation
    const orderWithVendor = await prisma.order.findFirst({
      include: { vendor: true, user: true }
    });

    if (orderWithVendor) {
      console.log(`✅ Relation Check: Order #${orderWithVendor.id} belongs to Vendor "${orderWithVendor.vendor.name}" and User "${orderWithVendor.user.name}"`);
    }

    // 5. User -> Vendor (One-to-One)
    const vendorWithUser = await prisma.vendor.findFirst({
      include: { user: true }
    });
    if (vendorWithUser) {
      console.log(`✅ Relation Check: Vendor "${vendorWithUser.name}" is linked to User "${vendorWithUser.user.email}"`);
    }

  } catch (error) {
    console.error('❌ Critical Error during database verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
