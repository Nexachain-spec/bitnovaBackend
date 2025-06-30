import nodemailer from "nodemailer";
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (email, otp, username) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: `"Zentor" <${process.env.EMAIL}>`,
      to: email,
      subject: "🔐 Your OTP  ",
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
      },
      subject: "Your One-Time Password (OTP)",
      html: `
          <div style="max-width: 400px; margin: auto; padding: 20px; text-align: center; font-family: Arial, sans-serif;
                    border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); background: #fff;">
          
          <h2 style="color: #007bff; margin-bottom: 10px;">🔐 Secure OTP</h2>
          <p style="font-size: 16px; font-weight: bold;">Dear ${username || "User"
        },</p>
          <p style="color: #333; font-size: 14px;">Your One-Time Password (OTP) is:</p>
          <div style="background: #f3f3f3; padding: 12px 24px; font-size: 22px; font-weight: bold;
                      display: inline-block; border-radius: 8px; letter-spacing: 2px; margin: 10px 0;
                      user-select: all;">
              ${otp}
          </div>

          <p style="font-size: 12px; color: #888; margin-top: 5px;">Tap & Hold to Copy</p>

          <p style="font-size: 12px; color: gray; margin-top: 10px;">Your OTP will expire in 10 minutes.</p>
          
          <p style="font-size: 14px;">For any queries, contact us at 
              <a href="mailto:support@worldtrade.com" style="color: #007bff; text-decoration: none;">support@worldtrade.com</a>
          </p>

          <p style="font-weight: bold; color: #007bff; margin-top: 15px;">- The Zentor Trade Team</p>
        </div>
        `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};
