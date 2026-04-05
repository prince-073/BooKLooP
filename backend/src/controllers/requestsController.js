const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

function buildUserRequestListItem(reqDoc, currentUserId) {
  const book = reqDoc.book;
  const owner = reqDoc.owner;
  const borrower = reqDoc.borrower;

  const isOutgoing = reqDoc.borrowerId === currentUserId;
  const uiStatus = reqDoc.status === 'pending' && isOutgoing ? 'pending_out' : reqDoc.status;

  return {
    id: reqDoc.id,
    title: book.title,
    user: isOutgoing ? owner.name : borrower.name,
    status: uiStatus,
    image: book.image || '',
    isOutgoing,
    ownerId: reqDoc.ownerId,
    borrowerId: reqDoc.borrowerId,
    daysRequested: reqDoc.daysRequested,
    dueDate: reqDoc.dueDate,
    hasRating: !!reqDoc.rating,
    ownerRequestedReturn: reqDoc.ownerRequestedReturn,
    isHandedOver: book.currentBorrowerId === reqDoc.borrowerId,
  };
}

const sendRequest = asyncHandler(async (req, res) => {
  const borrowerId = req.user.id;
  const { bookId, daysRequested = 7 } = req.body || {};

  if (!bookId) throw new ApiError(400, 'bookId is required');

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new ApiError(404, 'Book not found');
  if (book.ownerId === borrowerId) throw new ApiError(400, 'You cannot request your own book');
  if (!book.available) throw new ApiError(400, 'Book is not available; join the waitlist instead');

  const existing = await prisma.request.findFirst({
    where: { bookId, borrowerId, status: 'pending' },
  });
  if (existing) throw new ApiError(409, 'You already have a pending request for this book');

  const request = await prisma.request.create({
    data: { bookId, borrowerId, ownerId: book.ownerId, status: 'pending', daysRequested: Number(daysRequested) },
    select: { id: true, status: true },
  });

  res.status(201).json({ id: request.id, status: request.status });
});

const getUserRequests = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const requests = await prisma.request.findMany({
    where: { OR: [{ borrowerId: userId }, { ownerId: userId }] },
    orderBy: { createdAt: 'desc' },
    include: {
      book: { select: { id: true, title: true, image: true, available: true, currentBorrowerId: true } },
      owner: { select: { id: true, name: true } },
      borrower: { select: { id: true, name: true } },
      rating: true,
    },
  });

  res.json(requests.map((r) => buildUserRequestListItem(r, userId)));
});

const modifyRequest = asyncHandler(async (req, res) => {
  const ownerViewerId = req.user.id;
  const { id } = req.params;
  const { daysRequested } = req.body || {};

  const request = await prisma.request.findUnique({ where: { id } });
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.ownerId !== ownerViewerId) throw new ApiError(403, 'Only the book owner can modify requests');
  if (request.status !== 'pending') throw new ApiError(400, `Cannot modify request in status: ${request.status}`);

  const updated = await prisma.request.update({
    where: { id },
    data: { daysRequested: Number(daysRequested) || request.daysRequested },
  });

  res.json({ id: updated.id, status: updated.status, daysRequested: updated.daysRequested });
});

const acceptRequest = asyncHandler(async (req, res) => {
  const ownerViewerId = req.user.id;
  const { id } = req.params;

  const request = await prisma.request.findUnique({
    where: { id },
    include: { book: true },
  });
  if (!request) throw new ApiError(404, 'Request not found');

  if (request.ownerId !== ownerViewerId) throw new ApiError(403, 'Only the book owner can accept requests');
  if (request.status === 'accepted') {
    return res.json({ id: request.id, status: request.status });
  }
  if (request.status !== 'pending') throw new ApiError(400, `Cannot accept request in status: ${request.status}`);

  if (request.book.available !== true) {
    if (request.book.currentBorrowerId === request.borrowerId) {
      return res.json({ id: request.id, status: 'accepted' });
    }
    throw new ApiError(409, 'Book is no longer available');
  }
  if (request.book.ownerId !== request.ownerId) throw new ApiError(409, 'Request owner does not match the book owner');

  const borrowerId = request.borrowerId;
  const now = new Date();
  const dueDate = new Date(now.getTime() + request.daysRequested * 24 * 60 * 60 * 1000);

  const accepted = await prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.request.update({
      where: { id },
      data: { status: 'accepted', acceptedAt: now, dueDate },
      select: { id: true, status: true, borrowerId: true, bookId: true },
    });

    // If the borrower was on the waitlist, remove them since they are now assigned.
    await tx.waitlistEntry.deleteMany({ where: { bookId: request.bookId, userId: borrowerId } });

    return updatedRequest;
  });

  res.json({ id: accepted.id, status: accepted.status });
});

const rejectRequest = asyncHandler(async (req, res) => {
  const ownerViewerId = req.user.id;
  const { id } = req.params;

  const request = await prisma.request.findUnique({ where: { id } });
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.ownerId !== ownerViewerId) throw new ApiError(403, 'Only the book owner can reject requests');
  if (request.status === 'rejected') return res.json({ id: request.id, status: 'rejected' });
  if (request.status !== 'pending') throw new ApiError(400, `Cannot reject request in status: ${request.status}`);

  await prisma.request.update({
    where: { id },
    data: { status: 'rejected', rejectedAt: new Date() },
  });

  res.json({ id: request.id, status: 'rejected' });
});

const cancelRequest = asyncHandler(async (req, res) => {
  const borrowerViewerId = req.user.id;
  const { id } = req.params;

  const request = await prisma.request.findUnique({ where: { id } });
  if (!request) return res.status(204).send();
  if (request.borrowerId !== borrowerViewerId) throw new ApiError(403, 'Only requester can cancel this request');
  if (request.status !== 'pending') return res.status(204).send();

  await prisma.request.delete({ where: { id } });
  res.status(204).send();
});

const { generateOtp, sha256 } = require('../utils/otp');
const { env } = require('../config/env');
const { sendOtpEmail } = require('../utils/email');

const requestHandoverOtp = asyncHandler(async (req, res) => {
  const viewerId = req.user.id;
  const { id } = req.params;

  const request = await prisma.request.findUnique({
    where: { id },
    include: { borrower: true }
  });
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.status !== 'accepted') throw new ApiError(400, 'Request must be accepted first');
  if (request.ownerId !== viewerId) throw new ApiError(403, 'Only owner can initiate handover');

  const otp = generateOtp(6);
  const otpHash = sha256(otp);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + env.OTP_EXPIRES_MINUTES * 60 * 1000);

  await prisma.request.update({
    where: { id },
    data: { handoverOtpHash: otpHash, handoverOtpExpiresAt: expiresAt }
  });

  await sendOtpEmail(request.borrower.email, otp, 'OTP to Receive Your Book', `<html><body><p>Hello ${request.borrower.name},</p><h2>Provide this code to the owner to verify handover: <b style="color: #4F46E5;">${otp}</b></h2></body></html>`);

  res.json({ ok: true, message: 'OTP sent to borrower' });
});

const verifyHandoverOtp = asyncHandler(async (req, res) => {
  const viewerId = req.user.id;
  const { id } = req.params;
  const { otp } = req.body;

  if (!otp) throw new ApiError(400, 'otp is required');

  const request = await prisma.request.findUnique({ where: { id } });
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.status !== 'accepted') throw new ApiError(400, 'Request is not accepted');
  if (request.ownerId !== viewerId) throw new ApiError(403, 'Only owner can verify handover OTP');

  if (!request.handoverOtpHash || !request.handoverOtpExpiresAt) {
    throw new ApiError(400, 'No handover OTP has been requested');
  }

  if (new Date() > request.handoverOtpExpiresAt) {
    throw new ApiError(400, 'Handover OTP has expired');
  }

  const incomingHash = sha256(otp);
  if (incomingHash !== request.handoverOtpHash) {
    throw new ApiError(401, 'Invalid OTP code');
  }

  // Handover verified! Mark book as taken.
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

  res.json({ id: request.id, status: 'accepted', message: 'Handover complete. Book tracking started.' });
});

const requestReturnOtp = asyncHandler(async (req, res) => {
  const viewerId = req.user.id;
  const { id } = req.params;

  const request = await prisma.request.findUnique({
    where: { id },
    include: { owner: true }
  });
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.status !== 'accepted') throw new ApiError(400, 'Request is not accepted yet');
  if (request.borrowerId !== viewerId) throw new ApiError(403, 'Only borrower can request return OTP');

  const otp = generateOtp(6);
  const otpHash = sha256(otp);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + env.OTP_EXPIRES_MINUTES * 60 * 1000);

  await prisma.request.update({
    where: { id },
    data: { returnOtpHash: otpHash, returnOtpExpiresAt: expiresAt }
  });

  await sendOtpEmail(request.owner.email, otp, 'OTP to Receive Your Returned Book', `<html><body><p>Hello ${request.owner.name},</p><h2>Provide this code to the borrower to confirm return: <b style="color: #4F46E5;">${otp}</b></h2></body></html>`);

  res.json({ ok: true, message: 'OTP generated and sent to owner' });
});

const verifyReturnOtp = asyncHandler(async (req, res) => {
  const viewerId = req.user.id;
  const { id } = req.params;
  const { otp } = req.body;

  if (!otp) throw new ApiError(400, 'otp is required');

  const request = await prisma.request.findUnique({ where: { id } });
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.status !== 'accepted') throw new ApiError(400, 'Request is not accepted yet');
  if (request.borrowerId !== viewerId) throw new ApiError(403, 'Only borrower can submit return OTP');

  if (!request.returnOtpHash || !request.returnOtpExpiresAt) {
    throw new ApiError(400, 'No return OTP has been requested');
  }

  if (new Date() > request.returnOtpExpiresAt) {
    throw new ApiError(400, 'Return OTP has expired');
  }

  const incomingHash = sha256(otp);
  if (incomingHash !== request.returnOtpHash) {
    throw new ApiError(401, 'Invalid OTP code');
  }

  // OTP matches! Mark as completed
  req.params.id = id;
  return completeRequest(req, res);
});

const nudgeReturn = asyncHandler(async (req, res) => {
  const viewerId = req.user.id;
  const { id } = req.params;

  const request = await prisma.request.findUnique({ where: { id } });
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.ownerId !== viewerId) throw new ApiError(403, 'Only owner can request return nudge');
  if (request.status !== 'accepted') throw new ApiError(400, 'Book is not actively borrowed');

  await prisma.request.update({
    where: { id },
    data: { ownerRequestedReturn: true }
  });

  res.json({ id: request.id, ownerRequestedReturn: true, message: 'Return Nudge sent to borrower.' });
});

// Not in your listed API table, but required to support "When book returned".
const completeRequest = asyncHandler(async (req, res) => {
  const viewerId = req.user.id;
  const { id } = req.params;

  const request = await prisma.request.findUnique({ where: { id } });
  if (!request) throw new ApiError(404, 'Request not found');
  if (request.status === 'completed') {
    return res.json({ id: request.id, status: 'completed', nextAcceptedRequestId: null });
  }
  if (request.status !== 'accepted') throw new ApiError(400, `Cannot complete request in status: ${request.status}`);

  const isAllowed = request.ownerId === viewerId || request.borrowerId === viewerId;
  if (!isAllowed) throw new ApiError(403, 'Not allowed to complete this request');

  const book = await prisma.book.findUnique({ where: { id: request.bookId } });
  if (!book) throw new ApiError(404, 'Book not found');
  if (book.currentBorrowerId && book.currentBorrowerId !== request.borrowerId) {
    throw new ApiError(409, 'This request does not match the book current borrower');
  }

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    await tx.request.update({
      where: { id },
      data: { status: 'completed', completedAt: now, returnedAt: now },
    });

    // Return the book.
    await tx.book.update({
      where: { id: request.bookId },
      data: { available: true, currentBorrowerId: null },
    });

    // If someone is waiting, immediately accept them (FIFO).
    const nextWaiter = await tx.waitlistEntry.findFirst({
      where: { bookId: request.bookId },
      orderBy: { createdAt: 'asc' },
    });

    if (!nextWaiter) return { nextAcceptedRequestId: null };

    // Remove the waitlist entry we just took.
    await tx.waitlistEntry.delete({ where: { id: nextWaiter.id } });

    const nextAcceptedRequest = await tx.request.create({
      data: {
        bookId: request.bookId,
        borrowerId: nextWaiter.userId,
        ownerId: request.ownerId,
        status: 'accepted',
        acceptedAt: now,
      },
      select: { id: true },
    });

    await tx.book.update({
      where: { id: request.bookId },
      data: { available: false, currentBorrowerId: nextWaiter.userId },
    });

    await tx.borrowedBook.upsert({
      where: { userId_bookId: { userId: nextWaiter.userId, bookId: request.bookId } },
      update: {},
      create: { userId: nextWaiter.userId, bookId: request.bookId },
    });

    return { nextAcceptedRequestId: nextAcceptedRequest.id };
  });

  res.json({
    id: request.id,
    status: 'completed',
    nextAcceptedRequestId: result.nextAcceptedRequestId,
  });
});

module.exports = {
  sendRequest,
  getUserRequests,
  modifyRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  completeRequest,
  requestHandoverOtp,
  verifyHandoverOtp,
  requestReturnOtp,
  verifyReturnOtp,
  nudgeReturn,
};

