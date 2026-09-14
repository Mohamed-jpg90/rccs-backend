const asyncHandler = require("../utils/async_handler");
const clubMembershipService = require("../services/club_membership_service");

// User requests to join a club
const requestToJoin = asyncHandler(async (req, res) => {
  const request = await clubMembershipService.requestToJoin(req.params.id, req.user._id);
  res.status(201).json({ request });
});

const cancelMyRequest = asyncHandler(async (req, res) => {
  const request = await clubMembershipService.cancelMyRequest(req.params.id, req.user._id);
  res.json({ request });
});

const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await clubMembershipService.getMyRequests(req.user._id);
  res.json({ total: requests.length, requests });
});

// Admin / that club's Team Leader
const getClubRequests = asyncHandler(async (req, res) => {
  const requests = await clubMembershipService.getClubRequests(req.params.id, req.query.status);
  res.json({ total: requests.length, requests });
});

const approveRequest = asyncHandler(async (req, res) => {
  const request = await clubMembershipService.reviewRequest(req.params.requestId, req.user._id, "approve");
  res.json({ request });
});

const rejectRequest = asyncHandler(async (req, res) => {
  const request = await clubMembershipService.reviewRequest(req.params.requestId, req.user._id, "reject");
  res.json({ request });
});

module.exports = { requestToJoin, cancelMyRequest, getMyRequests, getClubRequests, approveRequest, rejectRequest };