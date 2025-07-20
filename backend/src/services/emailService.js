import nodemailer from "nodemailer";
import "dotenv/config";

/**
 * Email service for sending emails
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send an email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - Email HTML content
   * @param {string} options.text - Email text content (fallback)
   * @returns {Promise} - Nodemailer response
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL,
        to,
        subject,
        html,
        text,
      };

      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Email sending failed:", error);
      throw error;
    }
  }

  /**
   * Send a verification email
   * @param {string} to - Recipient email
   * @param {string} token - Verification token
   * @param {string} companyName - Company name
   * @returns {Promise} - Nodemailer response
   */
  async sendVerificationEmail(to, token, companyName) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f5f0e9; padding: 20px; text-align: center;">
          <h1 style="color: #e86c30;">ChatsPeCharcha</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
          <h2>Verify Your Email Address</h2>
          <p>Hello,</p>
          <p>Thank you for registering ${companyName} with ChatsPeCharcha CRM. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #e86c30; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p>Or copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you did not sign up for ChatsPeCharcha, please ignore this email.</p>
          <p>Thanks,<br>The ChatsPeCharcha Team</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ChatsPeCharcha. All rights reserved.</p>
        </div>
      </div>
    `;

    const text = `
      Verify Your Email Address
      
      Hello,
      
      Thank you for registering ${companyName} with ChatsPeCharcha CRM. Please verify your email address by visiting the link below:
      
      ${verificationUrl}
      
      This verification link will expire in 24 hours.
      
      If you did not sign up for ChatsPeCharcha, please ignore this email.
      
      Thanks,
      The ChatsPeCharcha Team
    `;

    return this.sendEmail({
      to,
      subject: "Verify Your ChatsPeCharcha Email Address",
      html,
      text,
    });
  }
}

export default new EmailService();
