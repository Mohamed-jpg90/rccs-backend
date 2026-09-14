const asyncHandler = require("../utils/async_handler");
const removalRequestService = require("../services/removal_request_service");

// const createRequest = asyncHandler(async (req, res) => {
//   const request = await removalRequestService.createRequest(req.user, req.params.id, req.body.reason);
//   res.status(201).json({ request });
// });

const createRequest = asyncHandler(async (req, res) => {
  const request = await removalRequestService.createRequest(
    req.user,
    req.params.id,
    req.body.reason,
    req.body.scope // "club" | "system", optional — defaults to "club"
  );
  res.status(201).json({ request });
});

const getRequests = asyncHandler(async (req, res) => {
  const requests = await removalRequestService.getRequests(req.query.status);
  res.json({ total: requests.length, requests });
});

const approveRequest = asyncHandler(async (req, res) => {
  const request = await removalRequestService.reviewRequest(req.params.id, req.user._id, "approve");
  res.json({ request });
});

const rejectRequest = asyncHandler(async (req, res) => {
  const request = await removalRequestService.reviewRequest(req.params.id, req.user._id, "reject");
  res.json({ request });
});


const directRemoval = asyncHandler(async (req, res) => {
  const request = await removalRequestService.adminDirectRemoval(
    req.user,
    req.params.id,
    req.body.reason,
    req.body.scope // "club" | "system"
  );
  res.json({ request });
});

module.exports = { createRequest, getRequests, approveRequest, rejectRequest, directRemoval };

