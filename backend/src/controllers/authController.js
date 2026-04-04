const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { env } = require('../config/env');
const { isValidEmailFormat, emailMatchesAllowedDomains } = require('../utils/email');
const nodemailer = require('nodemailer');
const { generateOtp, sha256 } = require('../utils/otp');

function safeUser(userDoc) {
  return {
    id: userDoc.id,
    name: userDoc.name,
    email: userDoc.email,
    course: userDoc.course,
    year: userDoc.year,
    role: userDoc.role || 'Student',
    phone: userDoc.phone || '',
    phoneVisible: userDoc.phoneVisible ?? true,
    avatarUrl: userDoc.avatarUrl || '',
    bio: userDoc.bio || '',
  };
}

async function sendOtpEmail(email, otp) {
  if (env.OTP_DEV_RETURN) return;

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new ApiError(500, 'SMTP is not configured. Set SMTP_HOST/SMTP_USER/SMTP_PASS or enable OTP_DEV_RETURN.');
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    requireTLS: env.SMTP_PORT === 587,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: 'Your Campus Book Exchange OTP',
      text: `Your OTP code is: ${otp}\n\nIt expires in ${env.OTP_EXPIRES_MINUTES} minutes.`,
    });
  } catch (err) {
    const msg = err?.response || err?.message || String(err);
    console.error('SMTP error:', msg);
    throw new ApiError(500, `Email send failed. Check SMTP settings. (${msg})`);
  }
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, course, year, phone, phoneVisible, role } = req.body || {};

  if (!name || !email || !password || !course || !year) {
    throw new ApiError(400, 'name, email, password, course, and year are required');
  }
  if (!isValidEmailFormat(email)) {
    throw new ApiError(400, 'Invalid email format');
  }
  if (!emailMatchesAllowedDomains(email, env.UNIVERSITY_EMAIL_DOMAINS)) {
    throw new ApiError(400, 'Email domain is not allowed');
  }
  if (String(password).length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  const existing = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const saltRounds = env.BCRYPT_SALT_ROUNDS;
  const hashed = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.create({
    data: {
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash: hashed,
      course: String(course).trim(),
      year: String(year).trim(),
      role: role ? String(role).trim() : 'Student',
      phone: phone ? String(phone).trim() : '',
      phoneVisible: phoneVisible !== undefined ? Boolean(phoneVisible) : true,
    },
  });

  const token = jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    token,
    user: safeUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new ApiError(400, 'email and password are required');
  }

  const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.passwordHash) {
    throw new ApiError(401, 'This account uses email OTP login only.');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  res.json({
    token,
    user: safeUser(user),
  });
});

const requestOtp = asyncHandler(async (req, res) => {
  const { email } = req.body || {};

  if (!email) throw new ApiError(400, 'email is required');
  if (!isValidEmailFormat(email)) throw new ApiError(400, 'Invalid email format');
  if (!emailMatchesAllowedDomains(email, env.UNIVERSITY_EMAIL_DOMAINS)) {
    throw new ApiError(400, 'Email domain is not allowed');
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const now = new Date();
  const windowStart = new Date(now.getTime() - env.OTP_REQUEST_WINDOW_SECONDS * 1000);

  // Rate limit: count OTP requests in a rolling window.
  const recentCount = await prisma.otpCode.count({
    where: {
      email: normalizedEmail,
      createdAt: { gte: windowStart },
    },
  });

  if (recentCount >= env.OTP_RATE_LIMIT_MAX) {
    throw new ApiError(429, 'Too many OTP requests. Please try again later.');
  }

  const otp = generateOtp(6);
  const codeHash = sha256(otp);

  const expiresAt = new Date(now.getTime() + env.OTP_EXPIRES_MINUTES * 60 * 1000);
  await prisma.otpCode.create({
    data: {
      email: normalizedEmail,
      codeHash,
      expiresAt,
    },
  });

  await sendOtpEmail(normalizedEmail, otp);

  const response = {
    ok: true,
    expiresInSeconds: env.OTP_EXPIRES_MINUTES * 60,
  };
  if (env.OTP_DEV_RETURN) response.otp = otp;

  res.json(response);
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code, name, course, year, phone, phoneVisible, role } = req.body || {};

  if (!email || !code) throw new ApiError(400, 'email and code are required');
  const normalizedEmail = String(email).toLowerCase().trim();

  if (!isValidEmailFormat(normalizedEmail)) throw new ApiError(400, 'Invalid email format');
  if (!emailMatchesAllowedDomains(normalizedEmail, env.UNIVERSITY_EMAIL_DOMAINS)) {
    throw new ApiError(400, 'Email domain is not allowed');
  }

  const now = new Date();
  const otpRow = await prisma.otpCode.findFirst({
    where: {
      email: normalizedEmail,
      usedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRow) throw new ApiError(401, 'OTP expired or not found');

  const incomingHash = sha256(code);
  if (incomingHash !== otpRow.codeHash) {
    throw new ApiError(401, 'Invalid OTP code');
  }

  await prisma.otpCode.update({
    where: { id: otpRow.id },
    data: { usedAt: now },
  });

  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    if (!name || !course || !year) {
      throw new ApiError(404, 'Account not found. Please register first.');
    }
    user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        passwordHash: null,
        course: String(course).trim(),
        year: String(year).trim(),
        role: role ? String(role).trim() : 'Student',
        phone: phone ? String(phone).trim() : '',
        phoneVisible: phoneVisible !== undefined ? Boolean(phoneVisible) : true,
      },
    });
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  res.json({
    token,
    user: safeUser(user),
  });
});

// JWT logout is client-side: user removes the token from localStorage/session.
// This endpoint is kept for UI completeness.
const logout = asyncHandler(async (_req, res) => {
  res.json({ ok: true });
});

const updateMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, course, year, role, phone, phoneVisible, bio } = req.body || {};

  const data = {};
  if (name !== undefined && name !== '') data.name = String(name).trim();
  if (course !== undefined && course !== '') data.course = String(course).trim();
  if (year !== undefined && year !== '') data.year = String(year).trim();
  if (role !== undefined && role !== '') data.role = String(role).trim();
  if (phone !== undefined) data.phone = String(phone).trim();
  if (phoneVisible !== undefined) data.phoneVisible = Boolean(phoneVisible);
  if (bio !== undefined) data.bio = String(bio).trim();

  if (Object.keys(data).length === 0) {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw new ApiError(404, 'User not found');
    return res.json(safeUser(existing));
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  res.json(safeUser(user));
});

const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'avatar image is required');

  const userId = req.user.id;
  const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
  });

  res.json(safeUser(user));
});

module.exports = { register, login, requestOtp, verifyOtp, logout, updateMe, updateAvatar };

