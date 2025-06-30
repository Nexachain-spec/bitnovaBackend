// services/walletMonitor.js
import { ethers, Wallet } from "ethers";
import UserModel from "../models/UserModel.js";
import { decrypt } from "../utils/walletUtils.js";

const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
const ADMIN_WALLET = process.env.ADMIN_WALLET;

export const monitorWallets = async () => {
  const users = await UserModel.find({});

  users.forEach((user) => {
    provider.on(user.walletAddress, async () => {
      const balanceEth = await provider.getBalance(user.walletAddress);

      if (balanceEth.gt(ethers.parseEther("0.001"))) {
        // console.log(`💰 Deposit detected for ${user.email}`);
        await transferToAdmin(user, balanceEth);
      }
    });
  });
};

const transferToAdmin = async (user, amount) => {
  const decryptedKey = decrypt(user.encryptedPrivateKey);
  const userWallet = new Wallet(decryptedKey, provider);

  const gasPrice = await provider.getGasPrice();
  const gasLimit = 21000n;

  const txAmount = amount - gasPrice * gasLimit;
  if (txAmount <= 0) {
    // console.log("❌ Insufficient amount after gas deduction");
    return;
  }

  const tx = await userWallet.sendTransaction({
    to: ADMIN_WALLET,
    value: txAmount,
    gasLimit,
    gasPrice,
  });

  // console.log(`✅ Transferred ${ethers.formatEther(txAmount)} ETH from ${user.walletAddress} to admin`);
};
