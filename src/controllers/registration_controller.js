const asyncHandler = require("../utils/async_handler");
const registrationService = require("../services/registration_service");

// User registers for an event
const registerForEvent = asyncHandler(async (req, res) => {
  const registration = await registrationService.registerForEvent(req.params.id, req.user._id);
  res.status(201).json({ registration });
});

const cancelMyRegistration = asyncHandler(async (req, res) => {
  const registration = await registrationService.cancelMyRegistration(req.params.id, req.user._id);
  res.json({ registration });
});

const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await registrationService.getMyRegistrations(req.user._id);
  res.json({ total: registrations.length, registrations });
});

// Admin / Team Leader: manage participants of an event
const getEventRegistrations = asyncHandler(async (req, res) => {
  const registrations = await registrationService.getEventRegistrations(req.params.id, req.query.status);
  res.json({ total: registrations.length, registrations });
});

const approveRegistration = asyncHandler(async (req, res) => {
  const registration = await registrationService.reviewRegistration(req.params.registrationId, req.user._id, "approve");
  res.json({ registration });
});

const rejectRegistration = asyncHandler(async (req, res) => {
  const registration = await registrationService.reviewRegistration(req.params.registrationId, req.user._id, "reject");
  res.json({ registration });
});

module.exports = {
  registerForEvent,
  cancelMyRegistration,
  getMyRegistrations,
  getEventRegistrations,
  approveRegistration,
  rejectRegistration,
};
