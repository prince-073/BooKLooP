const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

function pravatar(emailOrId) {
  const label = emailOrId ? String(emailOrId) : 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=111827&color=ffffff&bold=true&format=png&rounded=true&size=128`;
}

function normalizeBookImage(image, req) {
  const raw = image ? String(image).trim() : '';
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw;
  }
  if (raw.startsWith('/uploads/')) return `${req.protocol}://${req.get('host')}${raw}`;
  if (raw.startsWith('uploads/')) return `${req.protocol}://${req.get('host')}/${raw}`;
  return raw;
}

function toFrontendBook(bookDoc, ownerDoc, req) {
  return {
    id: bookDoc.id,
    type: bookDoc.type || 'Novel',
    title: bookDoc.title,
    author: bookDoc.author,
    subject: bookDoc.subject,
    courseCode: bookDoc.course,
    pickupPoint: bookDoc.pickupPoint || 'Main Campus',
    condition: bookDoc.condition,
    language: bookDoc.language || 'English',
    cover: normalizeBookImage(bookDoc.image, req),
    coverBack: normalizeBookImage(bookDoc.imageBack, req),
    edition: bookDoc.edition || '',
    abstract: bookDoc.abstract || '',
    status: bookDoc.available ? 'available' : 'borrowed',
    listedAt: bookDoc.createdAt ? bookDoc.createdAt.toISOString() : null,
    owner: {
      name: ownerDoc?.name || 'Unknown',
      avatar: ownerDoc?.avatarUrl
        ? normalizeBookImage(ownerDoc.avatarUrl, req)
        : pravatar(ownerDoc?.email || ownerDoc?.id),
    },
    ownerId: ownerDoc?.id || bookDoc.ownerId || null,
    available: bookDoc.available,
    currentBorrower: bookDoc.currentBorrowerId || null,
  };
}

const addBook = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const {
    title,
    author,
    type,
    subject,
    course,
    pickupPoint,
    condition,
    language,
    image,
    imageBack,
    available = true,
    edition,
    abstract,
  } = req.body || {};

  if (!title || !author || !subject || !condition) {
    throw new ApiError(400, 'title, author, subject, and condition are required');
  }

  const uploadedFile = req.files && req.files['imageFile'] ? req.files['imageFile'][0] : null;
  const uploadedImageUrl = uploadedFile ? uploadedFile.path : '';

  const uploadedBackFile = req.files && req.files['imageBackFile'] ? req.files['imageBackFile'][0] : null;
  const uploadedImageBackUrl = uploadedBackFile ? uploadedBackFile.path : '';

  const book = await prisma.book.create({
    data: {
      title: String(title).trim(),
      author: String(author).trim(),
      type: type ? String(type).trim() : 'Novel',
      subject: String(subject).trim(),
      course: course ? String(course).trim() : '',
      pickupPoint: pickupPoint ? String(pickupPoint).trim() : 'Main Campus',
      condition: String(condition).trim(),
      language: language ? String(language).trim() : 'English',
      image: uploadedImageUrl || (image ? String(image).trim() : ''),
      imageBack: uploadedImageBackUrl || (imageBack ? String(imageBack).trim() : ''),
      available: Boolean(available),
      ownerId,
      edition: edition ? String(edition).trim() : '',
      abstract: abstract ? String(abstract).trim() : '',
      currentBorrowerId: null,
    },
    include: { owner: true },
  });

  res.status(201).json(toFrontendBook(book, book.owner, req));
});

const getBooks = asyncHandler(async (req, res) => {
  const { search, subject, availability, condition, ownerId } = req.query || {};

  const where = {};
  if (subject) where.subject = { contains: String(subject) };
  if (condition) where.condition = { contains: String(condition) };
  if (ownerId) where.ownerId = String(ownerId);
  if (availability === 'available') where.available = true;
  if (availability === 'borrowed') where.available = false;
  if (search) {
    where.OR = [
      { title: { contains: String(search) } },
      { author: { contains: String(search) } },
      { subject: { contains: String(search) } },
      { course: { contains: String(search) } },
    ];
  }

  const books = await prisma.book.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { owner: true },
  });

  res.json(books.map((b) => toFrontendBook(b, b.owner, req)));
});

const getBookById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const book = await prisma.book.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!book) throw new ApiError(404, 'Book not found');
  res.json(toFrontendBook(book, book.owner, req));
});

const updateBook = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const { id } = req.params;

  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw new ApiError(404, 'Book not found');
  if (book.ownerId !== ownerId) throw new ApiError(403, 'Only the book owner can update it');

  const allowed = ['title', 'author', 'type', 'subject', 'course', 'pickupPoint', 'condition', 'language', 'image', 'imageBack', 'available', 'edition', 'abstract'];
  const updates = {};
  for (const key of allowed) {
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
      updates[key] = req.body[key];
    }
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'available') && updates.available === true) {
    updates.currentBorrowerId = null;
  }

  const updated = await prisma.book.update({
    where: { id },
    data: {
      ...updates,
      title: updates.title !== undefined ? String(updates.title).trim() : undefined,
      author: updates.author !== undefined ? String(updates.author).trim() : undefined,
      type: updates.type !== undefined ? String(updates.type).trim() : undefined,
      subject: updates.subject !== undefined ? String(updates.subject).trim() : undefined,
      course: updates.course !== undefined ? String(updates.course).trim() : undefined,
      pickupPoint: updates.pickupPoint !== undefined ? String(updates.pickupPoint).trim() : undefined,
      condition: updates.condition !== undefined ? String(updates.condition).trim() : undefined,
      language: updates.language !== undefined ? String(updates.language).trim() : undefined,
      image: updates.image !== undefined ? String(updates.image).trim() : undefined,
      imageBack: updates.imageBack !== undefined ? String(updates.imageBack).trim() : undefined,
      edition: updates.edition !== undefined ? String(updates.edition).trim() : undefined,
      abstract: updates.abstract !== undefined ? String(updates.abstract).trim() : undefined,
    },
    include: { owner: true },
  });

  res.json(toFrontendBook(updated, updated.owner, req));
});

const deleteBook = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const { id } = req.params;

  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw new ApiError(404, 'Book not found');
  if (book.ownerId !== ownerId) throw new ApiError(403, 'Only the book owner can delete it');

  await prisma.book.delete({ where: { id } });
  res.status(204).send();
});

const joinWaitlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const book = await prisma.book.findUnique({
    where: { id },
    include: { owner: true },
  });
  if (!book) throw new ApiError(404, 'Book not found');

  if (book.ownerId === userId) throw new ApiError(400, 'You cannot join the waitlist for your own book');
  if (book.available) throw new ApiError(400, 'Book is already available; send a request instead');
  if (book.currentBorrowerId && book.currentBorrowerId === userId) {
    throw new ApiError(400, 'You already have this book assigned');
  }

  const existing = await prisma.waitlistEntry.findUnique({
    where: { bookId_userId: { bookId: book.id, userId } },
  });
  if (existing) throw new ApiError(409, 'You are already on the waitlist');

  await prisma.waitlistEntry.create({ data: { bookId: book.id, userId } });
  const waitlistCount = await prisma.waitlistEntry.count({ where: { bookId: book.id } });

  res.json({ ok: true, waitlistCount });
});

const getGlobalActivity = asyncHandler(async (req, res) => {
  const books = await prisma.book.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { owner: { select: { name: true, avatarUrl: true } } }
  });

  const activities = books.map(b => ({
    id: `add_book_${b.id}`,
    type: 'add',
    userName: b.owner?.name || 'Unknown',
    userAvatar: b.owner?.avatarUrl || '',
    bookTitle: b.title,
    timestamp: b.createdAt.toISOString()
  }));

  const requests = await prisma.request.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { borrower: { select: { name: true, avatarUrl: true } }, book: { select: { title: true } } }
  });

  const reqActivities = requests.map(r => ({
    id: `req_${r.id}`,
    type: r.status === 'completed' ? 'return' : 'borrow',
    userName: r.borrower?.name || 'Unknown',
    userAvatar: r.borrower?.avatarUrl || '',
    bookTitle: r.book?.title || 'Unknown Book',
    timestamp: r.createdAt.toISOString()
  }));

  const all = [...activities, ...reqActivities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json(all.slice(0, 20));
});

const saveBook = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw new ApiError(404, 'Book not found');

  const existing = await prisma.savedBook.findUnique({
    where: { userId_bookId: { userId, bookId: id } }
  });

  if (!existing) {
    await prisma.savedBook.create({
      data: { userId, bookId: id }
    });
  }

  res.status(200).json({ saved: true });
});

const unsaveBook = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const existing = await prisma.savedBook.findUnique({
    where: { userId_bookId: { userId, bookId: id } }
  });

  if (existing) {
    await prisma.savedBook.delete({
      where: { userId_bookId: { userId, bookId: id } }
    });
  }

  res.status(200).json({ saved: false });
});

const getSavedBooks = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const saved = await prisma.savedBook.findMany({
    where: { userId },
    include: { book: { include: { owner: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const formatted = saved.map(s => toFrontendBook(s.book, s.book.owner, req));
  res.json(formatted);
});

const getStats = asyncHandler(async (req, res) => {
  const booksCount = await prisma.book.count();
  const usersCount = await prisma.user.count();
  const exchangesCount = await prisma.request.count({ where: { status: 'completed' } });
  res.json({ books: booksCount, users: usersCount, exchanges: exchangesCount });
});

module.exports = { addBook, getBooks, getBookById, updateBook, deleteBook, joinWaitlist, getGlobalActivity, toFrontendBook, saveBook, unsaveBook, getSavedBooks, getStats };
