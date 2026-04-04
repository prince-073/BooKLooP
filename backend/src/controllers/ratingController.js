const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

const submitRating = asyncHandler(async (req, res) => {
  const raterId = req.user.id;
  const { requestId, score, comment, type = 'borrower_return' } = req.body;

  if (!requestId || score === undefined) {
    throw new ApiError(400, 'requestId and score are required');
  }

  const numericScore = Number(score);
  if (numericScore < 1 || numericScore > 5) {
    throw new ApiError(400, 'score must be between 1 and 5');
  }

  const request = await prisma.request.findUnique({
    where: { id: requestId },
  });

  if (!request) throw new ApiError(404, 'Request not found');
  if (request.status !== 'completed') throw new ApiError(400, 'Cannot rate until request is completed');
  
  if (request.ownerId !== raterId) {
    throw new ApiError(403, 'Presently, only the owner can rate the borrower');
  }

  const rateeId = request.borrowerId;

  // Check if rating already exists
  const existing = await prisma.rating.findUnique({
    where: { requestId },
  });

  if (existing) {
    throw new ApiError(409, 'You have already rated this request');
  }

  const rating = await prisma.rating.create({
    data: {
      raterId,
      rateeId,
      bookId: request.bookId,
      requestId,
      score: numericScore,
      comment: comment ? String(comment).trim() : null,
      type,
    },
  });

  res.status(201).json(rating);
});

module.exports = { submitRating };
