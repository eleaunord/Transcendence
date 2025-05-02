
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export async function sendEmail(to: string, subject: string, text: string) {
  console.log('[sendEmail] Preparing to send email...');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Transcendence Team" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('[sendEmail] Message sent:', info.messageId);
}
