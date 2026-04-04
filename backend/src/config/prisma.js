const { PrismaClient } = require('@prisma/client');

// Export a singleton to avoid exhausting connections in dev reloads.
const prisma = new PrismaClient();

module.exports = { prisma };

