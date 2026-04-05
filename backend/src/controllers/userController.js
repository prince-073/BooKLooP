const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      booksListed: {
        select: { id: true, title: true, image: true, available: true, subject: true, condition: true }
      },
      booksBorrowed: {
        select: { id: true, title: true, image: true, available: true }
      },
    }
  });
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    id: user.id,
    name: user.name,
    course: user.course,
    year: user.year,
    role: user.role,
    avatarUrl: user.avatarUrl,
    phone: user.phoneVisible ? user.phone : null,
    phoneVisible: user.phoneVisible,
    bio: user.bio,
    createdAt: user.createdAt,
    booksOwned: user.booksListed || [],
    booksBorrowed: user.booksBorrowed || [],
  });
});

const recordVisit = asyncHandler(async (req, res) => {
  const visitorId = req.user.id;
  const visitedId = req.params.id;

  if (visitorId === visitedId) {
    return res.status(204).send(); // Don't track self visits
  }

  // To prevent spamming, check if there's a visit in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentVisit = await prisma.profileVisit.findFirst({
    where: {
      visitorId,
      visitedId,
      createdAt: { gte: oneHourAgo }
    }
  });

  if (!recentVisit) {
    await prisma.profileVisit.create({
      data: {
        visitorId,
        visitedId
      }
    });
  }

  res.status(204).send();
});

const getMyVisitors = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Retrieve the latest 50 distinct visitors (if we want distinct, we can group or just fetch latest)
  // For simplicity, fetch the 50 latest visits
  const visits = await prisma.profileVisit.findMany({
    where: { visitedId: userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      visitor: {
        select: {
          id: true,
          name: true,
          course: true,
          year: true,
          avatarUrl: true,
          role: true
        }
      }
    }
  });

  res.json(visits);
});

module.exports = { getUserById, recordVisit, getMyVisitors };
