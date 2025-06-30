import nodemailer from "nodemailer";

export const sendLevelNotification = async (email, subject, message) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: `"Level Upgrade" <${process.env.EMAIL}>`,
        to: email,
        subject: subject,
        html: message
    };

    await transporter.sendMail(mailOptions);
};
