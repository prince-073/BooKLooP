const dotenv = require('dotenv');
const { createApp } = require('./src/app');
const { env } = require('./src/config/env');
const { prisma } = require('./src/config/prisma');

dotenv.config();

async function main() {
  await prisma.$connect();

  const app = createApp();
  app.listen(env.PORT, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on port ${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start backend:', err);
  process.exit(1);
});

