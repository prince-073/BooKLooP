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

async function sendOtpEmail(email, otp, subject = 'Your Campus Book Exchange OTP', customHtml = null) {
  if (env.OTP_DEV_RETURN === 'true' || env.OTP_DEV_RETURN === true) return;

  if (!env.SMTP_PASS) {
    throw new ApiError(500, 'Email configuration is missing. Set SMTP_PASS or OTP_DEV_RETURN=true.');
  }

  const htmlContent = customHtml || `<html><body><p>Hello!</p><h2>Your OTP code is: <b style="color: #4F46E5;">${otp}</b></h2><p>It expires in ${env.OTP_EXPIRES_MINUTES} minutes.</p></body></html>`;

  // Auto-detect Brevo API Key (starts with xsmtpsib- or host is brevo)
  const isBrevo = (env.SMTP_PASS && env.SMTP_PASS.startsWith('xsmtpsib-')) || (env.SMTP_HOST && env.SMTP_HOST.includes('brevo'));

  if (isBrevo) {
    // Use HTTP REST API (Port 443) - Never blocked by cloud hosting firewalls (Render/Vercel)
    let senderEmail = 'oji193084@gmail.com';
    if (env.SMTP_FROM && env.SMTP_FROM.includes('<')) {
      const match = env.SMTP_FROM.match(/<([^>]+)>/);
      if (match) senderEmail = match[1];
    } else if (env.SMTP_USER && env.SMTP_USER.includes('@') && !env.SMTP_USER.includes('smtp-brevo.com')) {
      senderEmail = env.SMTP_USER;
    }

    const payload = {
      sender: { name: 'Campus Book Exchange', email: senderEmail },
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
        throw new Error(`Brevo HTTP rejected (${response.status}): ${errorText}`);
      }
      console.log(`Email sent via Brevo HTTP API to ${email}`);
      return;
    } catch (err) {
      const msg = err?.message || String(err);
      console.error('Brevo Dispatch Error:', msg);
      throw new ApiError(500, `Could not send OTP email via Brevo HTTP API: ${msg}`);
    }
  }

  // Fallback to Nodemailer for Gmail / Standard SMTP
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(env.SMTP_PORT) || 587,
    secure: env.SMTP_SECURE === 'true' || Number(env.SMTP_PORT) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    connectionTimeout: 8000, // 8s timeout to prevent hanging on blocked cloud ports
    socketTimeout: 8000,
  });

  const fromAddress = env.SMTP_FROM || `"Campus Book Exchange" <${env.SMTP_USER}>`;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: subject,
      html: htmlContent,
    });
    console.log(`Email sent via SMTP: ${info.messageId}`);
  } catch (err) {
    const msg = err?.message || String(err);
    console.error('SMTP Dispatch Error:', msg);
    throw new ApiError(500, `Could not send OTP email. Provider error: ${msg}`);
  }
}

module.exports = { isValidEmailFormat, emailMatchesAllowedDomains, sendOtpEmail };
