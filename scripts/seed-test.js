const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);
  
  // Create Admin
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password,
      role: 'ADMIN'
    }
  });

  // Create Vendor User
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@example.com' },
    update: {},
    create: {
      email: 'vendor@example.com',
      name: 'Vendor User',
      password,
      role: 'VENDOR'
    }
  });

  // Create Vendor Profile
  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      name: 'Awesome Electronics',
      slug: 'awesome-electronics',
      userId: vendorUser.id,
      isActive: true
    }
  });

  // Create Category
  const category = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: {
      name: 'Electronics',
      description: 'Gadgets and gear'
    }
  });

  // Create Product
  await prisma.product.create({
    data: {
      name: 'Smartphone X',
      description: 'Latest flagship smartphone',
      price: 999.99,
      stock: 10,
      categoryId: category.id,
      vendorId: vendor.id,
      images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800']
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
