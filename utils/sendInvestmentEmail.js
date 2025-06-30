// utils/sendInvestmentEmail.js
import nodemailer from "nodemailer";

export const sendInvestmentConfirmationEmail = async (email, name, amount, date) => {
    console.log(email, name, amount, date)
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const formattedDate = new Date(date).toLocaleString("en-US", {
        dateStyle: "long",
        timeStyle: "short",
    });

    const mailOptions = {
        from: `"Zentor" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "✅ Investment Confirmation - Thank You!",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Hello ${name},</h2>
        <p style="font-size: 16px; color: #555;">We're excited to let you know that your investment has been successfully received.</p>

        <div style="background-color: #fff; padding: 16px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); margin: 20px 0;">
          <h3 style="color: #222;">📄 Investment Summary</h3>
          <ul style="list-style: none; padding-left: 0; color: #333;">
            <li><strong>Investor Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Amount Invested:</strong> <span style="color: green;">$${amount}</span></li>
            <li><strong>Date:</strong> ${formattedDate}</li>
          </ul>
        </div>

        <p style="font-size: 15px; color: #444;">
          Thank you for trusting <strong>Zentor</strong>. We're committed to helping you grow your investment. You can view your portfolio and progress anytime from your dashboard.
        </p>

        <div style="margin-top: 30px;">
          <a href="https://zentor.us/dashboard" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">📊 Go to Dashboard</a>
        </div>

        <p style="margin-top: 40px; font-size: 14px; color: #777;">If you have any questions, feel free to contact us at <a href="mailto:support@yourcompany.com">support@yourcompany.com</a>.</p>

        <p style="margin-top: 20px; font-size: 14px; color: #555;">Warm regards,<br/><strong>Your Company Team</strong></p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};
