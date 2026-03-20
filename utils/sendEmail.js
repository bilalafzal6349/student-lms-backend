const nodemailer = require("nodemailer");

/**
 * Sends an email via plain Nodemailer SMTP.
 * Configure EMAIL_HOST/PORT/USER/PASS in .env.
 *
 * In development with Ethereal (https://ethereal.email/create),
 * the preview URL is logged to the console so you can inspect the email.
 *
 * @param {{ to: string, subject: string, text?: string, html?: string }} options
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true for port 465
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"LearnHub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });

  // Ethereal preview URL is only available when using ethereal.email test credentials.
  // Assign to a variable to suppress the unused result — no console output in production.
  if (process.env.NODE_ENV !== "production") {
    nodemailer.getTestMessageUrl(info);
  }
};

module.exports = sendEmail;
