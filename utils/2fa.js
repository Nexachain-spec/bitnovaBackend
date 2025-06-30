import speakeasy from "speakeasy";
import qrcode from "qrcode";
import UserModel from "../models/user.model.js";

export const generate2FA = async (email, force = false) => {
    const user = await UserModel.findOne({ email });

    if (!user) {
        return {
            message: "User not found",
            qrCode: null,
            secret: null,
        };
    }

    if (!force && user.twoFASecret) {
        return {
            message: "2FA is already enabled for this wallet.",
            qrCode: null,
            secret: null,
        };
    }

    const secret = speakeasy.generateSecret({
        name: `1Trade (${email})`,
    });

    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    user.twoFASecret = secret.base32;
    await user.save();

    return {
        secret: secret.base32,
        qrCode,
    };
};

export const verify2FA = async (email, otp) => {
    const user = await UserModel.findOne({ email });
    if (!user || !user.twoFASecret) {
        return false;
    }
    const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: "base32",
        token: otp,
        window: 1,
    });
    return verified;
};