const User = require("../models/user_model");
const { ROLES } = require("../config/constants");

const getUsers = async ({ search, role, status, club, page = 1, limit = 20 }) => {
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (club) filter.club = club;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).populate("club", "clubName").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return { users, total, page: Number(page), limit: Number(limit) };
};

const getUserById = async (id) => {
  return User.findById(id).populate("club", "clubName");
};

const updateUser = async (actingUser, targetId, updates, uploadedFile) => {
  const target = await User.findById(targetId);
  if (!target) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  if (actingUser.role === ROLES.TEAM_LEADER) {
    if (target.role !== ROLES.USER) {
      const error = new Error("Team Leaders cannot modify Admin or Team Leader accounts");
      error.status = 403;
      throw error;
    }
    if (updates.role !== undefined && updates.role !== ROLES.USER) {
      const error = new Error("Team Leaders cannot change user roles or system permissions");
      error.status = 403;
      throw error;
    }
    delete updates.role;
  }

  // لازم نلتقط الحالة قبل التعديل عشان نعرف لو الـ role اتغير بعيد عن Team Leader
  const wasTeamLeader = target.role === ROLES.TEAM_LEADER;
  const roleChangedAwayFromTeamLeader =
    wasTeamLeader && updates.role !== undefined && updates.role !== ROLES.TEAM_LEADER;

  if (updates.fullName !== undefined) target.fullName = updates.fullName;
  if (updates.phoneNumber !== undefined) target.phoneNumber = updates.phoneNumber;
  if (updates.role !== undefined) target.role = updates.role;
  if (updates.club !== undefined) target.club = updates.club;
  if (uploadedFile) target.profileImage = `/uploads/${uploadedFile.filename}`;

  await target.save();

  if (roleChangedAwayFromTeamLeader) {
    const clubLeaderService = require("./club_leader_service");
    await clubLeaderService.removeAllLeaderAssignments(target._id);
  }

  return target;
};
const deleteUser = async (actingUser, targetId) => {
  const target = await User.findById(targetId);
  if (!target) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  if (actingUser.role === ROLES.TEAM_LEADER) {
    const error = new Error(
      "Team Leaders cannot delete users directly. Use POST /api/users/:id/removal-request instead."
    );
    error.status = 403;
    throw error;
  }

  if (target.club) {
    const clubMembershipService = require("./club_membership_service");
    await clubMembershipService.removeMemberFromClub(target.club, target._id);
  }

  await target.deleteOne();
  return target;
};

const updateUserStatus = async (id, status) => {
  const user = await User.findByIdAndUpdate(id, { status }, { new: true });
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return user;
};

// GET /api/me/profile
const getMyProfile = async (userId) => {
  const user = await User.findById(userId).populate("club", "clubName description coverImage");
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const result = { user };

  if (user.role === ROLES.TEAM_LEADER) {
    const clubLeaderService = require("./club_leader_service");
    result.ledClubs = await clubLeaderService.getClubsLedBy(userId);
  }

  return result;
};

// GET /api/users/:id/overview
const getUserOverview = async (userId) => {
  const registrationService = require("./registration_service");
  const kpiService = require("./kpi_service");
  const pointsService = require("./points_service");
  const badgeService = require("./badge_service");
  const Certificate = require("../models/certificate_model");

  const user = await User.findById(userId).populate("club", "clubName description coverImage");
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const [eventRegistrations, kpi, points, badges, certificatesCount] = await Promise.all([
    registrationService.getMyRegistrations(userId),
    kpiService.getMyKpi(userId),
    pointsService.getUserPoints(userId),
    badgeService.getMyBadgeProgress(userId),
    Certificate.countDocuments({ user: userId }),
  ]);

  return { user, club: user.club, eventRegistrations, kpi, points, badges, certificatesCount };
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserStatus,
  getMyProfile,
  getUserOverview,
};