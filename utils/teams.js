import UserModel from "../models/user.model.js";

export const calculateTeams = async (userId) => {
    try {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error("User not found");

        // Team A: Directly referred users
        const teamA = await UserModel.find({ _id: { $in: user.referedUsers } });

        let teamB = [];
        for (let a of teamA) {
            const referredByA = await UserModel.find({
                _id: { $in: a.referedUsers },
            });
            teamB.push(...referredByA);
        }

        let teamC = [];
        for (let b of teamB) {
            const referredByB = await UserModel.find({
                _id: { $in: b.referedUsers },
            });
            teamC.push(...referredByB);
        }

        // console.log(teamA.length, teamB.length, teamC.length);
        return {
            teamA: teamA,
            teamB: teamB,
            teamC: teamC,
            totalTeamBC: teamB + teamC,
        };
    } catch (error) {
        // console.error("❌ Error in calculateTeams:", error.message);
        throw error;
    }
};
