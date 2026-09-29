const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

// Direct issue a book to any user without them having to request it
const adminDirectIssue = asyncHandler(async (req, res) => {
  const { bookId, borrowerId, daysRequested = 7 } = req.body;
  
  if (!bookId || !borrowerId) throw new ApiError(400, 'bookId and borrowerId are required');

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new ApiError(404, 'Book not found');
  if (!book.available) throw new ApiError(400, 'Book is not available to be issued');

  const now = new Date();
  const dueDate = new Date(now.getTime() + daysRequested * 24 * 60 * 60 * 1000);

  const request = await prisma.$transaction(async (tx) => {
    // Delete any pending requests from this borrower for this book to avoid conflicts
    await tx.request.deleteMany({
      where: { bookId, borrowerId, status: 'pending' }
    });

    // Create a new request and mark it as accepted directly
    const newReq = await tx.request.create({
      data: {
        bookId,
        borrowerId,
        ownerId: book.ownerId,
        status: 'accepted',
        daysRequested: Number(daysRequested),
        acceptedAt: now,
        dueDate
      }
    });

    // Mark the book as unavailable and assign it to the borrower
    await tx.book.update({
      where: { id: bookId },
      data: { available: false, currentBorrowerId: borrowerId },
    });

    // Create a record in borrowedBook for tracking
    await tx.borrowedBook.upsert({
      where: { userId_bookId: { userId: borrowerId, bookId } },
      update: {},
      create: { userId: borrowerId, bookId },
    });

    return newReq;
  });

  res.json({ id: request.id, status: request.status, message: 'Book successfully issued by Admin.' });
});

// Force handover of an existing request without OTP
const adminForceHandover = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await prisma.request.findUnique({ where: { id } });
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.status !== 'accepted') throw new ApiError(400, 'Request must be accepted first');

  await prisma.$transaction(async (tx) => {
    await tx.book.update({
      where: { id: request.bookId },
      data: { available: false, currentBorrowerId: request.borrowerId },
    });

    await tx.borrowedBook.upsert({
      where: { userId_bookId: { userId: request.borrowerId, bookId: request.bookId } },
      update: {},
      create: { userId: request.borrowerId, bookId: request.bookId },
    });
  });

  res.json({ id: request.id, status: 'accepted', message: 'Admin Force Handover complete. OTP bypassed.' });
});

// Update any user's role (Make Admin / Revoke Admin)
const adminUpdateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['Admin', 'Student'].includes(role)) {
    throw new ApiError(400, 'Invalid role. Role must be "Admin" or "Student"');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(404, 'User not found');

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true }
  });

  res.json({ success: true, message: `User role updated to ${role}`, user: updated });
});

module.exports = {
  adminDirectIssue,
  adminForceHandover,
  adminUpdateUserRole
};
