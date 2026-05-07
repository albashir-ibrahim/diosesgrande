import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean up existing data if necessary (optional)
  // await prisma.review.deleteMany()
  // await prisma.cartItem.deleteMany()
  // await prisma.cart.deleteMany()
  // await prisma.orderItem.deleteMany()
  // await prisma.order.deleteMany()
  // await prisma.product.deleteMany()
  // await prisma.category.deleteMany()
  // await prisma.vendor.deleteMany()
  // await prisma.user.deleteMany()

  const bcrypt = require('bcryptjs');
  const hashedAdminPassword = await bcrypt.hash('admin', 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@admin.com',
      name: 'Site Admin',
      password: hashedAdminPassword,
      role: 'ADMIN',
    },
  })

  const hashedUserPassword = await bcrypt.hash('password', 10);

  // Create vendor user
  const vendorUser = await prisma.user.create({
    data: {
      email: 'vendor@example.com',
      name: 'Vendor User',
      password: hashedUserPassword,
      role: 'VENDOR',
    },
  })

  // Create vendor profile
  const vendor = await prisma.vendor.create({
    data: {
      name: 'Awesome Electronics',
      description: 'The best electronics store',
      userId: vendorUser.id,
    },
  })

  // Create a customer
  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      name: 'Customer User',
      password: hashedUserPassword,
      role: 'CUSTOMER',
    },
  })

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Electronics', description: 'Electronic devices and gadgets' } }),
    prisma.category.create({ data: { name: 'Fashion', description: 'Clothing, shoes, and accessories' } }),
    prisma.category.create({ data: { name: 'Beauty & Health', description: 'Skincare, makeup, and health products' } }),
    prisma.category.create({ data: { name: 'Home & Living', description: 'Furniture, decor, and kitchenware' } }),
    prisma.category.create({ data: { name: 'Phones & Tablets', description: 'Mobile phones and tablets' } }),
    prisma.category.create({ data: { name: 'Computers', description: 'Laptops, desktops, and components' } }),
    prisma.category.create({ data: { name: 'Baby & Kids', description: 'Toys, clothing, and baby gear' } }),
    prisma.category.create({ data: { name: 'Sports & Outdoors', description: 'Fitness equipment and outdoor gear' } }),
    prisma.category.create({ data: { name: 'Automotive', description: 'Car parts and accessories' } }),
    prisma.category.create({ data: { name: 'Groceries', description: 'Food, drinks, and household items' } }),
  ]);

  const electronics = categories[0];

  // Create a product
  const product = await prisma.product.create({
    data: {
      name: 'Smartphone X',
      description: 'The latest smartphone model',
      price: 999.99,
      stock: 50,
      vendorId: vendor.id,
      categoryId: electronics.id,
      images: [],
    },
  })

  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
