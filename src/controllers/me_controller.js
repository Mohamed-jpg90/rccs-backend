const asyncHandler = require("../utils/async_handler");
const userService = require("../services/user_service");
const clubLeaderService = require("../services/club_leader_service");

// GET /api/me/profile — الآن لو الشخص Team Leader، بيرجع ledClubs معاه كمان
const getMyProfile = asyncHandler(async (req, res) => {
  const result = await userService.getMyProfile(req.user._id);
  res.json(result); // { user, ledClubs? }
});

// GET /api/me/led-clubs — endpoint مستقل بس للنوادي اللي التيم ليدر ده قائدها
const getMyLedClubs = asyncHandler(async (req, res) => {
  const clubs = await clubLeaderService.getClubsLedBy(req.user._id);
  res.json({ total: clubs.length, clubs });
});

module.exports = { getMyProfile, getMyLedClubs };