const asyncHandler = require("../utils/async_handler");
const clubLeaderService = require("../services/club_leader_service");
const { ROLES } = require("../config/constants");

const requireAdminOrClubLeader = asyncHandler(async (req, res, next) => {
  if (req.user.role === ROLES.ADMIN) return next();

  if (req.user.role === ROLES.TEAM_LEADER) {
    const isLeader = await clubLeaderService.isLeaderOfClub(req.user._id, req.params.id);
    if (isLeader) return next();
  }

  return res.status(403).json({ message: "Only an Admin or this club's Team Leader can do that" });
});

module.exports = { requireAdminOrClubLeader };