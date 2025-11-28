// lib_email.js
// helper to send email via Resend API or SMTP (nodemailer)
import nodemailer from 'nodemailer';
import fetch from 'node-fetch'; // form-data dependency installed with package.json

export async function sendNotificationEmail({ to, subject, html, text }) {
  const mode = (process.env.EMAIL_MODE || 'none').toLowerCase();
  const from = process.env.FROM_EMAIL || 'no-reply@lsfinova.com';

  if (mode === 'none') {
    console.log('EMAIL_MODE=none, skipping email send');
    return { ok: true, info: 'skipped' };
  }

  if (mode === 'resend') {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('Missing RESEND_API_KEY');
    const payload = {
      from,
      to,
      subject,
      html
    };
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const textRes = await res.text();
      throw new Error(`Resend API error: ${res.status} ${textRes}`);
    }
    return { ok: true, provider: 'resend' };
  }

  if (mode === 'smtp') {
    // use nodemailer
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = (process.env.SMTP_SECURE || 'false') === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) throw new Error('Missing SMTP configuration');

    const transporter = nodemailer.createTransport({
      host, port, secure,
      auth: { user, pass }
    });

    const info = await transporter.sendMail({ from, to, subject, text, html });
    return { ok: true, provider: 'smtp', info };
  }

  throw new Error(`Unknown EMAIL_MODE: ${mode}`);
}
