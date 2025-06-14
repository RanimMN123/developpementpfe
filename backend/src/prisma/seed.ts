import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.admin.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
    },
  });

  console.log('Admin created');
}

main();
