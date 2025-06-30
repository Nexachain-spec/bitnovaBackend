
import nodemailer from "nodemailer";

export const sendWithdrawalConfirmationEmail = async (email, name, amount, netAmount, walletAddress, date) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Zentor" <${process.env.EMAIL}>`,
    to: email,
    subject: "✅ Withdrawal Request Sent Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #4CAF50;">Hello ${name},</h2>
        <p>Your withdrawal request will be processed within 3 hours.</p>

        <h3>🔁 Transaction Details:</h3>
        <ul>
          <li><strong>Amount Requested:</strong> $${amount}</li>
          <li><strong>Net Amount Sent:</strong> $${netAmount}</li>
          <li><strong>Wallet Address:</strong> ${walletAddress}</li>
          <li><strong>Date:</strong> ${new Date(date).toLocaleString()}</li>
        </ul>

        <p>💡 <i>If you did not initiate this request, please contact our support team immediately.</i></p>

        <p>Thank you for trusting us.</p>
        <p style="margin-top: 20px;">Best regards,<br/>Team Zentor</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendWithdrawalApproveEmail = async (email, name, amount, netAmount, walletAddress, date) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Zentor" <${process.env.EMAIL}>`,
    to: email,
    subject: "✅ Withdrawal Approved Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #4CAF50;">Hello ${name},</h2>
        <p>Your withdrawal Approved Successfully and Sent to Your Wallet Address.</p>

        <h3>🔁 Transaction Details:</h3>
        <ul>
          <li><strong>Amount Requested:</strong> $${amount}</li>
          <li><strong>Net Amount Sent:</strong> $${netAmount}</li>
          <li><strong>Wallet Address:</strong> ${walletAddress}</li>
          <li><strong>Date:</strong> ${new Date(date).toLocaleString()}</li>
        </ul>

        <p>💡 <i>If you did not initiate this request, please contact our support team immediately.</i></p>

        <p>Thank you for trusting us.</p>
        <p style="margin-top: 20px;">Best regards,<br/>Team Zentor</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
