const { env } = require('../config/env');
const { ApiError } = require('./ApiError');

function isValidEmailFormat(email) {
  // Simple RFC-ish check; for production consider a robust validator.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function emailMatchesAllowedDomains(email, allowedDomains) {
  if (!allowedDomains || allowedDomains.length === 0) return true; // optional validation
  const value = String(email || '').trim().toLowerCase();
  return allowedDomains.some((domain) => value.endsWith(`@${domain}`));
}

async function sendOtpEmail(email, otp, subject = 'Your Campus Book Exchange OTP', customHtml = null) {
  if (env.OTP_DEV_RETURN === 'true' || env.OTP_DEV_RETURN === true) return;

  if (!env.SMTP_PASS) {
    throw new ApiError(500, 'Email API key is not configured. Set SMTP_PASS or enable OTP_DEV_RETURN.');
  }

  const htmlContent = customHtml || `<html><body><p>Hello!</p><h2>Your OTP code is: <b style="color: #4F46E5;">${otp}</b></h2><p>It expires in ${env.OTP_EXPIRES_MINUTES} minutes.</p></body></html>`;

  const payload = {
    sender: { name: 'Campus Book Exchange', email: 'oji193084@gmail.com' },
    to: [{ email: String(email) }],
    subject: subject,
    htmlContent: htmlContent
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': env.SMTP_PASS
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brevo API error:', errorText);
      throw new Error(`Email provider rejected request: ${response.status}`);
    }
  } catch (err) {
    const msg = err?.message || String(err);
    console.error('Email Dispatch Error:', msg);
    throw new ApiError(500, `Could not send OTP email. Provider error: ${msg}`);
  }
}

module.exports = { isValidEmailFormat, emailMatchesAllowedDomains, sendOtpEmail };

