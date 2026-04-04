require('dotenv').config();

function parseDomains(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

const env = {
  PORT: Number(process.env.PORT || 5000),
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  UNIVERSITY_EMAIL_DOMAINS: parseDomains(process.env.UNIVERSITY_EMAIL_DOMAINS || ''),
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS || 10),

  OTP_DEV_RETURN: ['true', '1', 'yes'].includes(String(process.env.OTP_DEV_RETURN || '').toLowerCase().trim()),
  OTP_EXPIRES_MINUTES: Number(process.env.OTP_EXPIRES_MINUTES || 10),
  OTP_REQUEST_WINDOW_SECONDS: Number(process.env.OTP_REQUEST_WINDOW_SECONDS || 60),
  OTP_RATE_LIMIT_MAX: Number(process.env.OTP_RATE_LIMIT_MAX || 5),

  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'Campus Book Exchange <no-reply@example.com>',
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
};

module.exports = { env };

