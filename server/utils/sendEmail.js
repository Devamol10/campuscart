import nodemailer from "nodemailer";
import dns from "dns/promises";

/**
 * Enterprise Email Service
 * Uses Brevo REST API (HTTPS port 443) to bypass Render's strict SMTP port blocking (465/587).
 * Falls back to Gmail SMTP (Nodemailer) for local development if Brevo API key is not present.
 */
export const sendEmail = async ({ to, subject, html }) => {
  // 1. Try Brevo HTTP API (Bypasses Render SMTP Firewall)
  if (process.env.BrevoApiKey) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": process.env.BrevoApiKey,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          sender: { 
            email: process.env.EMAIL_USER || "noreply@campuscart.com", 
            name: "CampusCart" 
          },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Brevo HTTP Error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      if (process.env.NODE_ENV !== "production") {
        console.log("Email sent successfully via Brevo HTTP API:", data.messageId);
      }
      return data;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Brevo API failed, falling back to Nodemailer...", error.message);
      }
      // Continue to Nodemailer fallback
    }
  }

  // 2. Fallback to Gmail SMTP via Nodemailer (Blocked on Render Free Tier)
  const hostName = process.env.MAIL_HOST || "smtp.gmail.com";
  const { address } = await dns.lookup(hostName, { family: 4 }).catch(() => ({ address: hostName }));

  const transporter = nodemailer.createTransport({
    host: address,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      servername: hostName,
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
      console.log("Email sent successfully via Gmail SMTP:", info.messageId);
    }
    return info;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Nodemailer error:", error.message);
    }
    throw error;
  }
};
