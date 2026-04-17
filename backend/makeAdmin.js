const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin(email) {
  try {
    const user = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { role: 'Admin' }
    });
    console.log(`Successfully made ${user.name} (${user.email}) an Admin.`);
  } catch (err) {
    if (err.code === 'P2025') {
      console.error(`User with email ${email} not found.`);
    } else {
      console.error(err);
    }
  } finally {
    await prisma.$disconnect();
  }
}

const targetEmail = process.argv[2];
if (!targetEmail) {
  console.log("Usage: node makeAdmin.js <user-email>");
  process.exit(1);
}

makeAdmin(targetEmail);
