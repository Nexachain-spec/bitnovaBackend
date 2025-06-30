import UserModel from "../models/user.model.js";

export const getTree = async (userId) => {
  try {
    const root = await UserModel.findById(userId);
    if (!root) {
      return { success: false, message: "User not found" };
    }

    const dfs = async (nodeId, result) => {
      if (!nodeId) return;

      const user = await UserModel.findById(nodeId);
      if (!user) return;

      result.push({
        _id: user._id,
        username: user.username,
        referralCode: user.referralCode,
        left: user.left,
        right: user.right,
        totalEarnings: user.totalEarnings.toFixed(2),
      });

      await dfs(user.left, result);
      await dfs(user.right, result);
    };

    let tree = [];
    await dfs(root._id, tree);

    return { success: true, tree }; // ✅ Return tree data
  } catch (error) {
    // console.error(error);
    return { success: false, message: "Server Error" }; // ❌ `res` remove
  }
};

export const buildTree = async (userId) => {
  if (!userId) return null;
  const user = await UserModel.findById(userId).lean();
  if (!user) return null;

  const leftChild = await buildTree(user.left);
  const rightChild = await buildTree(user.right);

  return {
    id: user._id,
    name: user.name,
    referralCode: user.referralCode,
    totalEarnings: parseFloat(user.totalEarnings).toFixed(2),
    earnings: parseFloat(user.earnings).toFixed(2),
    totalReferrals: user.totalReferrals,
    left: leftChild,
    right: rightChild,
    username: user.username,
    investment: user.totalInvestment,
    status: user.status,
  };
};
