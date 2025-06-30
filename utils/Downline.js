import UserModel from "../models/user.model.js";

// direct downline

// export const getBinaryDownline = async (userId) => {
//   try {
//     const user = await UserModel.findById(userId).populate(["left", "right"]);
//     if (!user) return [];

//     let downline = [];

//     if (user.left) {
//       const leftDownline = await getBinaryDownline(user.left._id);
//       downline.push({
//         userId: user.left._id,
//         username: user.left.username,
//         position: "left",
//         downline: leftDownline,
//       });
//     }

//     if (user.right) {
//       const rightDownline = await getBinaryDownline(user.right._id);
//       downline.push({
//         userId: user.right._id,
//         username: user.right.username,
//         position: "right",
//         downline: rightDownline,
//       });
//     }

//     return downline;
//   } catch (error) {
//     console.error("Error fetching binary downline:", error);
//     return [];
//   }
// };

// left and right downline

export const getBinaryDownline = async (userId) => {
  try {
    const user = await UserModel.findById(userId).populate(["left", "right"]);
    if (!user) return { leftDownline: [], rightDownline: [] };

    let leftDownline = [];
    let rightDownline = [];

    if (user.left) {
      const leftTree = await getBinaryDownline(user.left._id);
      leftDownline.push({
        userId: user.left._id,
        username: user.left.username,
        position: "left",
        downline: leftTree, // Recursively fetch left downline
      });
    }

    if (user.right) {
      const rightTree = await getBinaryDownline(user.right._id);
      rightDownline.push({
        userId: user.right._id,
        username: user.right.username,
        position: "right",
        downline: rightTree, // Recursively fetch right downline
      });
    }

    return { leftDownline, rightDownline };
  } catch (error) {
    // console.error("Error fetching binary downline:", error);
    return { leftDownline: [], rightDownline: [] };
  }
};

export const getBinaryDownlineUsers = async (req, res) => {
  try {
    const userId = req.params.userId;
    const binaryDownline = await getBinaryDownline(userId);

    res.status(200).json({ success: true, binaryDownline });
  } catch (error) {
    // console.error("Error in getBinaryDownlineUsers:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
