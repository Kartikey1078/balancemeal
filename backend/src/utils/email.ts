import { Resend } from 'resend';
import { frontendOrigin } from '../config/env.js';

const getFromEmail = () =>
  process.env.RESEND_FROM || 'BalancedMeal <onboarding@resend.dev>';

export const buildResetLink = (token: string, email: string) => {
  const base = (frontendOrigin || 'http://localhost:3005').replace(/\/$/, '');
  const encodedEmail = encodeURIComponent(email);
  return `${base}/reset-password?token=${token}&email=${encodedEmail}`;
};

export const buildVerifyLink = (token: string, email: string) => {
  const base = (frontendOrigin || 'http://localhost:3005').replace(/\/$/, '');
  const encodedEmail = encodeURIComponent(email);
  return `${base}/verify-email?token=${token}&email=${encodedEmail}`;
};

const sendViaResend = async (to: string, subject: string, html: string, text: string) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: getFromEmail(),
    to: [to],
    subject,
    html,
    text,
  });
  if (error) {
    console.warn('Resend send failed', error);
    return false;
  }
  return true;
};

export const sendRecoveryEmail = async (to: string, link: string) => {
  const subject = 'Reset your password – BalancedMeal';
  const text = `Reset your password using this link: ${link}`;
  const html = `
    <p>You requested a password reset.</p>
    <p><a href="${link}">Click here to reset your password</a></p>
    <p>If you did not request this, you can ignore this email.</p>
    <p>This link expires in 1 hour.</p>
  `;

  if (await sendViaResend(to, subject, html, text)) return;

  if (process.env.EMAIL_WEBHOOK_URL) {
    await fetch(process.env.EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, text, html }),
    });
    return;
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || 'false') === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
      });
      return;
    } catch (err) {
      console.warn('SMTP email failed, falling back to log', err);
    }
  }

  console.info('Password reset link:', link);
};

export const sendVerificationEmail = async (to: string, link: string) => {
  const subject = 'Verify your email – BalancedMeal';
  const text = `Verify your email using this link: ${link}`;
  const html = `
    <p>Thanks for signing up.</p>
    <p><a href="${link}">Click here to verify your email</a></p>
    <p>If you did not create an account, you can ignore this email.</p>
    <p>This link expires in 24 hours.</p>
  `;
  if (await sendViaResend(to, subject, html, text)) return;
  if (process.env.EMAIL_WEBHOOK_URL) {
    await fetch(process.env.EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, text, html }),
    });
    return;
  }
  console.info('Verification link:', link);
};
