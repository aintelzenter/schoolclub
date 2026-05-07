import nodemailer from 'nodemailer';

// Create reusable transporter
// Supports multiple free SMTP providers:
// 1. Gmail: Use app password (enable 2FA first)
// 2. Ethereal: Free testing service (perfect for development)
// 3. Mailtrap: Free tier available
// 4. SendGrid: Has free tier with SMTP support
// 5. Self-hosted: Any SMTP server

const getTransporter = () => {
  const smtpHost = process.env.SMTP_HOST || 'localhost';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: smtpUser && smtpPass ? {
      user: smtpUser,
      pass: smtpPass,
    } : undefined,
  });
};

export interface EmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP_HOST not configured. Email sending disabled. Configure SMTP for production.');
    return { success: true, id: 'mock-' + Date.now() };
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log('Email sent:', info.response);
    return { success: true, id: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

// Helper to send to multiple recipients
export const sendEmailToMultiple = async (options: Omit<EmailOptions, 'to'> & { to: string[] }) => {
  return sendEmail(options);
};
