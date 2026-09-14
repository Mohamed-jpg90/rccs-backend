const asyncHandler = require("../utils/async_handler");
const leaderboardService = require("../services/leaderboard_service");

const getLeaderboard = asyncHandler(async (req, res) => {
  const result = await leaderboardService.getLeaderboard(req.user._id, req.query.limit);
  res.json(result);
});

module.exports = { getLeaderboard };
