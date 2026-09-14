const ClubLeader = require("../models/club_leader_model");
const Club = require("../models/club_model");
const User = require("../models/user_model");
const { ROLES } = require("../config/constants");

const assignTeamLeader = async (adminId, clubId, userId) => {
  const [club, user] = await Promise.all([Club.findById(clubId), User.findById(userId)]);

  if (!club) {
    const error = new Error("Club not found");
    error.status = 404;
    throw error;
  }
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  if (user.role === ROLES.ADMIN) {
    const error = new Error("Cannot assign an Admin as a Team Leader");
    error.status = 400;
    throw error;
  }

  const existing = await ClubLeader.findOne({ club: clubId, teamLeader: userId });
  if (existing) {
    const error = new Error("This user is already the Team Leader of this club");
    error.status = 409;
    throw error;
  }

  const assignment = await ClubLeader.create({ club: clubId, teamLeader: userId, assignedBy: adminId });

  club.teamLeaders.addToSet(userId);
  await club.save();

  if (user.role !== ROLES.TEAM_LEADER) {
    user.role = ROLES.TEAM_LEADER;
    await user.save();
  }

  return assignment;
};

const unassignTeamLeader = async (clubId, userId) => {
  const assignment = await ClubLeader.findOneAndDelete({ club: clubId, teamLeader: userId });
  if (!assignment) {
    const error = new Error("This user is not a Team Leader of this club");
    error.status = 404;
    throw error;
  }

  await Club.findByIdAndUpdate(clubId, { $pull: { teamLeaders: userId } });

  const remainingClubs = await ClubLeader.countDocuments({ teamLeader: userId });
  if (remainingClubs === 0) {
    await User.findByIdAndUpdate(userId, { role: ROLES.USER });
  }

  return assignment;
};

const getClubLeaders = async (clubId) => {
  return ClubLeader.find({ club: clubId }).populate("teamLeader", "fullName email phoneNumber profileImage");
};

// All clubs a given user leads - reads straight off Club.teamLeaders (fast, no join needed).
const getClubsLedBy = async (userId) => {
  return Club.find({ teamLeaders: userId }).select("clubName description coverImage maxMembers currentMembersCount");
};

const removeAllLeaderAssignments = async (userId) => {
  const assignments = await ClubLeader.find({ teamLeader: userId }).select("club");
  const clubIds = assignments.map((a) => a.club);

  await ClubLeader.deleteMany({ teamLeader: userId });

  if (clubIds.length > 0) {
    await Club.updateMany({ _id: { $in: clubIds } }, { $pull: { teamLeaders: userId } });
  }

  return clubIds;
};


const isLeaderOfClub = async (userId, clubId) => {
  if (!clubId) return false;
  return Boolean(await Club.exists({ _id: clubId, teamLeaders: userId }));
};

module.exports = { assignTeamLeader, unassignTeamLeader, getClubLeaders, getClubsLedBy, isLeaderOfClub ,removeAllLeaderAssignments };