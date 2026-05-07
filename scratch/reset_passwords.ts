
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  
  const emails = ['admin@example.com', 'vendor@example.com', 'customer@example.com'];
  
  for (const email of emails) {
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    console.log(`Updated password for ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
