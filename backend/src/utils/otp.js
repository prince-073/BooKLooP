const crypto = require('crypto');

function generateOtp(length = 6) {
  const digits = Math.max(4, Math.min(8, Number(length) || 6));
  // Ensures leading zeros are allowed (e.g. "000123").
  const max = 10 ** digits;
  const value = crypto.randomInt(0, max);
  return String(value).padStart(digits, '0');
}

function sha256(input) {
  return crypto.createHash('sha256').update(String(input)).digest('hex');
}

module.exports = { generateOtp, sha256 };

