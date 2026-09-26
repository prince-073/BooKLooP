const { env } = require('../config/env');
const { ApiError } = require('./ApiError');
const nodemailer = require('nodemailer');

function isValidEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function emailMatchesAllowedDomains(email, allowedDomains) {
  if (!allowedDomains || allowedDomains.length === 0) return true;
  const value = String(email || '').trim().toLowerCase();
  return allowedDomains.some((domain) => value.endsWith(`@${domain}`));
}

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: env.SMTP_PORT || 587,
  secure: env.SMTP_SECURE === 'true' || env.SMTP_PORT === 465, 
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

async function sendOtpEmail(email, otp, subject = 'Your Campus Book Exchange OTP', customHtml = null) {
  if (env.OTP_DEV_RETURN === 'true' || env.OTP_DEV_RETURN === true) return;

  if (!env.SMTP_PASS || !env.SMTP_USER) {
    throw new ApiError(500, 'Email SMTP configuration is missing. Set SMTP_USER and SMTP_PASS.');
  }

  const htmlContent = customHtml || `<html><body><p>Hello!</p><h2>Your OTP code is: <b style="color: #4F46E5;">${otp}</b></h2><p>It expires in ${env.OTP_EXPIRES_MINUTES} minutes.</p></body></html>`;
  
  const fromAddress = env.SMTP_FROM || `"Campus Book Exchange" <${env.SMTP_USER}>`;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: subject,
      html: htmlContent,
    });
    console.log(`Email sent: ${info.messageId}`);
  } catch (err) {
    const msg = err?.message || String(err);
    console.error('Email Dispatch Error:', msg);
    throw new ApiError(500, `Could not send OTP email. Provider error: ${msg}`);
  }
}

module.exports = { isValidEmailFormat, emailMatchesAllowedDomains, sendOtpEmail };

