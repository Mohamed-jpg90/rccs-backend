const RemovalRequest = require("../models/removal_request_model");
const User = require("../models/user_model");
const clubLeaderService = require("./club_leader_service");
const clubMembershipService = require("./club_membership_service");
const { ROLES, REMOVAL_REQUEST_STATUS, REMOVAL_REQUEST_SCOPE } = require("../config/constants");

// services/removal_request_service.js
const createRequest = async (requestingUser, targetUserId, reason, scope = REMOVAL_REQUEST_SCOPE.CLUB) => {
  if (!Object.values(REMOVAL_REQUEST_SCOPE).includes(scope)) {
    const error = new Error("Invalid removal scope");
    error.status = 400;
    throw error;
  }

  const target = await User.findById(targetUserId);
  if (!target) {
    const error = new Error("Target user not found");
    error.status = 404;
    throw error;
  }
  if (target.role !== ROLES.USER) {
    const error = new Error("Team Leaders can only request removal of regular Users");
    error.status = 403;
    throw error;
  }

  if (requestingUser.role === ROLES.TEAM_LEADER) {
    // Team Leaders should never be able to request a full system deletion —
    // only Admins reviewing should be able to escalate, if you want that at all.
    if (scope === REMOVAL_REQUEST_SCOPE.SYSTEM) {
      const error = new Error("Team Leaders can only request club removal, not account deletion");
      error.status = 403;
      throw error;
    }
    if (!target.club) {
      const error = new Error("This user is not a member of any club you lead");
      error.status = 403;
      throw error;
    }
    const isLeader = await clubLeaderService.isLeaderOfClub(requestingUser._id, target.club);
    if (!isLeader) {
      const error = new Error("You can only request removal of users in a club you lead");
      error.status = 403;
      throw error;
    }
  }

  return RemovalRequest.create({ targetUser: targetUserId, requestedBy: requestingUser._id, reason, scope });
};

const reviewRequest = async (requestId, reviewerId, decision) => {
  const request = await RemovalRequest.findById(requestId);
  if (!request) {
    const error = new Error("Removal request not found");
    error.status = 404;
    throw error;
  }
  if (request.status !== REMOVAL_REQUEST_STATUS.PENDING) {
    const error = new Error(`Request is already ${request.status}`);
    error.status = 400;
    throw error;
  }

  request.status = decision === "approve" ? REMOVAL_REQUEST_STATUS.APPROVED : REMOVAL_REQUEST_STATUS.REJECTED;
  request.reviewedBy = reviewerId;
  request.reviewedAt = new Date();
  await request.save();

  if (decision === "approve") {
    const target = await User.findById(request.targetUser);
    if (target && target.club) {
      await clubMembershipService.removeMemberFromClub(target.club, target._id);
    }

    if (request.scope === REMOVAL_REQUEST_SCOPE.SYSTEM) {
      await User.findByIdAndDelete(request.targetUser);
    } else if (target) {
      // club-only removal — keep the account, just detach from the club
      target.club = null;
      await target.save();
    }
  }

  return request;
};

const getRequests = async (statusFilter) => {
  const filter = {};
  if (statusFilter) filter.status = statusFilter;
  return RemovalRequest.find(filter)
    .populate("targetUser", "fullName email")
    .populate("requestedBy", "fullName")
    .sort({ createdAt: -1 });
};

// Admin-only shortcut: create the request and immediately approve it,
// reusing the exact same tested logic reviewRequest already uses
// (so we never duplicate the target.club = null step again).
const adminDirectRemoval = async (adminUser, targetUserId, reason, scope) => {
  const request = await createRequest(adminUser, targetUserId, reason, scope);
  return reviewRequest(request._id, adminUser._id, "approve");
};

module.exports = { createRequest, getRequests, reviewRequest , adminDirectRemoval  };