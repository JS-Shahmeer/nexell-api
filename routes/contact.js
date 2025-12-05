import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { db } from "../db.js";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    // Save to Database -----------------------------------------------
    await db.execute(
      "INSERT INTO inquiries (name, email, phone, service, message) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, service, message]
    );

    // Send Email via Hostinger SMTP ----------------------------------
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.hostinger.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send email to admin with form submission details
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      subject: "New Contact Form Submission",
      html: `
        <h3>New Inquiry Submitted</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    // Send confirmation email to the user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank You for Contacting Us - We'll Be In Touch Soon!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Thank You, ${name}!</h2>
          <p>We have successfully received your inquiry and appreciate you reaching out to us.</p>
          <p><strong>Your submitted details:</strong></p>
          <ul style="line-height: 1.8;">
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone}</li>
            <li><strong>Service:</strong> ${service}</li>
            <li><strong>Message:</strong> ${message}</li>
          </ul>
          <p>Our team will review your inquiry and contact you shortly. We typically respond within 24-48 hours.</p>
          <p>If you have any urgent questions, please feel free to reach out to us directly.</p>
          <br>
          <p>Best regards,<br>
          <strong>Nexell Book Writing Team</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            This is an automated confirmation email. Please do not reply to this message.
          </p>
        </div>
      `,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("CONTACT API ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
