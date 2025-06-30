import moment from "moment";
import UserModel from "../models/user.model.js";

// export const calculateTeams = async (userId, date = null) => {
//   try {
//     const user = await UserModel.findById(userId);
//     if (!user) throw new Error("User not found");

//     let dateFilter = {};
//     if (date) {
//       const startOfDay = moment(date).startOf('day').toDate();
//       const endOfDay = moment(date).endOf('day').toDate();
//       dateFilter.createdAt = { $gte: startOfDay, $lte: endOfDay };
//     }

//     const teamA = await UserModel.find({
//       _id: { $in: user.referedUsers },
//       ...dateFilter
//     });

//     let teamB = [];
//     for (let a of teamA) {
//       const referredByA = await UserModel.find({
//         _id: { $in: a.referedUsers },
//         ...dateFilter
//       });
//       teamB.push(...referredByA);
//     }

//     let teamC = [];
//     for (let b of teamB) {
//       const referredByB = await UserModel.find({
//         _id: { $in: b.referedUsers },
//         ...dateFilter
//       });
//       teamC.push(...referredByB);
//     }

//     return {
//       teamA,
//       teamB,
//       teamC,
//       totalTeamBC: teamB.length + teamC.length,
//     };
//   } catch (error) {
//     // console.error("❌ Error in calculateTeams:", error.message);
//     throw error;
//   }
// };


export const calculateTeams = async (userId, date = null) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error("User not found");

    let dateFilter = {};
    if (date) {
      const startOfDay = moment(date).startOf("day").toDate();
      const endOfDay = moment(date).endOf("day").toDate();
      dateFilter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const teamA = await UserModel.find({
      _id: { $in: user.referedUsers },
      ...dateFilter,
    });

    let teamB = [];
    for (let a of teamA) {
      const referredByA = await UserModel.find({
        _id: { $in: a.referedUsers },
        ...dateFilter,
      });
      teamB.push(...referredByA);
    }

    let teamC = [];
    for (let b of teamB) {
      const referredByB = await UserModel.find({
        _id: { $in: b.referedUsers },
        ...dateFilter,
      });
      teamC.push(...referredByB);
    }

    let teamD = [];
    for (let c of teamC) {
      const referredByC = await UserModel.find({
        _id: { $in: c.referedUsers },
        ...dateFilter,
      });
      teamD.push(...referredByC);
    }

    return {
      teamA,
      teamB,
      teamC,
      teamD,
      totalTeamBCD: teamB.length + teamC.length + teamD.length,
    };
  } catch (error) {
    throw error;
  }
};