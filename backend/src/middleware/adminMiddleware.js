const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { role: true }
  });

  if (!user || user.role !== 'Admin') {
    throw new ApiError(403, 'Forbidden: Admins only');
  }

  next();
});

module.exports = { adminMiddleware };
