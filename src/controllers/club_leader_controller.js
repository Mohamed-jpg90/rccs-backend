const asyncHandler = require("../utils/async_handler");
const clubLeaderService = require("../services/club_leader_service");

const assignTeamLeader = asyncHandler(async (req, res) => {
  const assignment = await clubLeaderService.assignTeamLeader(req.user._id, req.params.id, req.body.userId);
  res.status(201).json({ assignment });
});

const unassignTeamLeader = asyncHandler(async (req, res) => {
  await clubLeaderService.unassignTeamLeader(req.params.id, req.params.userId);
  res.json({ message: "Team Leader removed from this club" });
});

const getClubLeaders = asyncHandler(async (req, res) => {
  const leaders = await clubLeaderService.getClubLeaders(req.params.id);
  res.json({ total: leaders.length, leaders });
});

module.exports = { assignTeamLeader, unassignTeamLeader, getClubLeaders };