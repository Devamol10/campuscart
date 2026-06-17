import nodemailer from "nodemailer";
import dns from "dns";

// Force IPv4 resolution globally for this module to fix ENETUNREACH on IPv6 networks
dns.setDefaultResultOrder("ipv4first");

/**
 * Enterprise Email Service using Nodemailer (Gmail SMTP)
 * Replaces unreliable Brevo API and adds robust timeout handling
 */
export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: process.env.MAIL_PORT || 465,
    secure: process.env.MAIL_PORT == 465 ? true : false,
    auth: {
      user: process.env.EMAIL_USER, // viralshortsking2323@gmail.com
      pass: process.env.EMAIL_PASS, // App Password
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10s timeout
    greetingTimeout: 10000,
  });

  try {
    const info = await transporter.sendMail({
      from: `"CampusCart" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("Email sent successfully:", info.messageId);
    }
    return info;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Nodemailer error:", error.message);
    }
    throw error;
  }
};
