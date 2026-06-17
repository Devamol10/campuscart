import nodemailer from "nodemailer";
import dns from "dns/promises";

/**
 * Enterprise Email Service using Nodemailer (Gmail SMTP)
 * Replaces unreliable Brevo API and adds robust timeout handling
 */
export const sendEmail = async ({ to, subject, html }) => {
  // Explicitly lookup the IPv4 address to avoid ENETUNREACH on IPv6-only/broken-IPv6 networks
  const hostName = process.env.MAIL_HOST || "smtp.gmail.com";
  const { address } = await dns.lookup(hostName, { family: 4 });

  const transporter = nodemailer.createTransport({
    host: address,
    port: 465, // Force 465 (implicit TLS) to avoid STARTTLS bugs with IPs
    secure: true,
    auth: {
      user: process.env.EMAIL_USER, // viralshortsking2323@gmail.com
      pass: process.env.EMAIL_PASS, // App Password
    },
    tls: {
      servername: hostName, // Match TLS certificate with the actual hostname
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
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
