import { Wallet } from "ethers";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV = process.env.IV;

export const encrypt = (text) => {
    const cipher = crypto.createCipheriv("aes-256-ctr", Buffer.from(ENCRYPTION_KEY), Buffer.from(IV));
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return encrypted.toString("hex");
};

export const decrypt = (text) => {
    const decipher = crypto.createDecipheriv("aes-256-ctr", Buffer.from(ENCRYPTION_KEY), Buffer.from(IV));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(text, "hex")), decipher.final()]);
    return decrypted.toString();
};

export const generateWallet = () => {
    const wallet = Wallet.createRandom();
    const encryptedPrivateKey = encrypt(wallet.privateKey);
    return { address: wallet.address, encryptedPrivateKey };
};
