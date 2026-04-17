const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRole() {
  const user = await prisma.user.findUnique({
    where: { email: 'princee0391@gmail.com' },
    select: { name: true, email: true, role: true }
  });
  console.log(user);
  await prisma.$disconnect();
}

checkRole();
