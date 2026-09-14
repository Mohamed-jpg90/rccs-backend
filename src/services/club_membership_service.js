const ClubMembershipRequest = require("../models/club_membership_request_model");
const Club = require("../models/club_model");
const User = require("../models/user_model");
const pointsService = require("./points_service");
const { CLUB_JOIN_STATUS, POINTS_RULES } = require("../config/constants");

const requestToJoin = async (clubId, userId) => {
  const club = await Club.findById(clubId);
  if (!club) {
    const error = new Error("Club not found");
    error.status = 404;
    throw error;
  }

  const user = await User.findById(userId);
  if (String(user.club) === String(clubId)) {
    const error = new Error("You are already a member of this club");
    error.status = 409;
    throw error;
  }

  if (club.members.length >= club.maxMembers) {
    const error = new Error("This club is at full capacity");
    error.status = 409;
    throw error;
  }

  const existing = await ClubMembershipRequest.findOne({ club: clubId, user: userId });
  if (existing) {
    if (existing.status === CLUB_JOIN_STATUS.PENDING) {
      const error = new Error("You already have a pending request for this club");
      error.status = 409;
      throw error;
    }
    existing.status = CLUB_JOIN_STATUS.PENDING;
    existing.reviewedBy = null;
    existing.reviewedAt = null;
    await existing.save();
    return existing;
  }

  return ClubMembershipRequest.create({ club: clubId, user: userId });
};

const cancelMyRequest = async (clubId, userId) => {
  const request = await ClubMembershipRequest.findOne({ club: clubId, user: userId });
  if (!request) {
    const error = new Error("Request not found");
    error.status = 404;
    throw error;
  }
  request.status = CLUB_JOIN_STATUS.CANCELLED;
  await request.save();
  return request;
};

const getMyRequests = async (userId) => {
  return ClubMembershipRequest.find({ user: userId }).populate("club", "clubName").sort({ createdAt: -1 });
};

const getClubRequests = async (clubId, statusFilter) => {
  const filter = { club: clubId };
  if (statusFilter) filter.status = statusFilter;
  return ClubMembershipRequest.find(filter).populate("user", "fullName email phoneNumber").sort({ createdAt: -1 });
};

// Removes userId from club's members[] and re-syncs the cached count. Exported so
// removal-request approval and direct Admin delete can both free the seat correctly.
const removeMemberFromClub = async (clubId, userId) => {
  if (!clubId) return;
  const club = await Club.findById(clubId);
  if (!club) return;
  club.members.pull(userId);
  club.currentMembersCount = club.members.length;
  await club.save();
};

const addMemberToClub = async (clubId, userId) => {
  const club = await Club.findById(clubId);
  if (!club) {
    const error = new Error("Club not found");
    error.status = 404;
    throw error;
  }
  club.members.addToSet(userId);
  club.currentMembersCount = club.members.length;
  await club.save();
  return club;
};

const reviewRequest = async (requestId, reviewerId, decision) => {
  const request = await ClubMembershipRequest.findById(requestId).populate("club", "clubName");
  if (!request) {
    const error = new Error("Request not found");
    error.status = 404;
    throw error;
  }
  if (request.status !== CLUB_JOIN_STATUS.PENDING) {
    const error = new Error(`Request is already ${request.status}`);
    error.status = 400;
    throw error;
  }

  request.reviewedBy = reviewerId;
  request.reviewedAt = new Date();

  if (decision === "approve") {
    const club = await Club.findById(request.club._id);
    if (club.members.length >= club.maxMembers) {
      const error = new Error("This club is now at full capacity, cannot approve");
      error.status = 409;
      throw error;
    }

    const user = await User.findById(request.user);

    if (user.club && String(user.club) !== String(request.club._id)) {
      await removeMemberFromClub(user.club, user._id);
    }

    user.club = request.club._id;
    await user.save();
    await addMemberToClub(request.club._id, user._id);

    request.status = CLUB_JOIN_STATUS.APPROVED;

    await pointsService.awardPoints({
      userId: user._id,
      amount: POINTS_RULES.CLUB_JOIN_APPROVED,
      reason: `Joined club: ${request.club.clubName}`,
      createdBy: reviewerId,
    });
  } else {
    request.status = CLUB_JOIN_STATUS.REJECTED;
  }

  await request.save();
  return request;
};

module.exports = {
  requestToJoin,
  cancelMyRequest,
  getMyRequests,
  getClubRequests,
  reviewRequest,
  removeMemberFromClub,
  addMemberToClub,
};