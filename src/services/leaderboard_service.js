const User = require("../models/user_model");
const { ROLES } = require("../config/constants");

// Top N users by totalPoints, plus the requesting user's own rank (even if outside top N).
const getLeaderboard = async (requestingUserId, limit = 20) => {
  const topUsers = await User.find({ role: ROLES.USER })
    .select("fullName profileImage totalPoints club")
    .populate("club", "clubName")
    .sort({ totalPoints: -1 })
    .limit(Number(limit));

  const usersAbove = await User.countDocuments({
    role: ROLES.USER,
    totalPoints: { $gt: (await User.findById(requestingUserId))?.totalPoints || 0 },
  });

  return {
    leaderboard: topUsers.map((u, index) => ({ rank: index + 1, ...u.toObject() })),
    myRank: usersAbove + 1,
  };
};

module.exports = { getLeaderboard };
