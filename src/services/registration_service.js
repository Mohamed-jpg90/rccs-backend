const Event = require("../models/event_model");
const EventRegistration = require("../models/event_registration_model");
const { REGISTRATION_STATUS, POINTS_RULES } = require("../config/constants");
const pointsService = require("./points_service");

const registerForEvent = async (eventId, userId) => {
  const event = await Event.findById(eventId);
  if (!event) {
    const error = new Error("Event not found");
    error.status = 404;
    throw error;
  }

  if (new Date() > new Date(event.registrationDeadline)) {
    const error = new Error("Registration deadline for this event has passed");
    error.status = 400;
    throw error;
  }

  const existing = await EventRegistration.findOne({ event: eventId, user: userId });
  if (existing && existing.status !== REGISTRATION_STATUS.CANCELLED && existing.status !== REGISTRATION_STATUS.REJECTED) {
    const error = new Error(`You already have a registration for this event (status: ${existing.status})`);
    error.status = 409;
    throw error;
  }

  const confirmedCount = await EventRegistration.countDocuments({
    event: eventId,
    status: { $in: [REGISTRATION_STATUS.REGISTERED, REGISTRATION_STATUS.APPROVED] },
  });

  if (confirmedCount >= event.capacity) {
    const error = new Error("This event is at full capacity");
    error.status = 409;
    throw error;
  }

  const status = event.requiresApproval ? REGISTRATION_STATUS.PENDING : REGISTRATION_STATUS.REGISTERED;

  let registration;
  if (existing) {
    existing.status = status;
    existing.reviewedBy = null;
    existing.reviewedAt = null;
    registration = await existing.save();
  } else {
    registration = await EventRegistration.create({ event: eventId, user: userId, status });
  }

  // Only awarded when the registration is immediately confirmed (no approval needed).
  // Approval-gated registrations are pointed on approve instead — see reviewRegistration below.
  if (status === REGISTRATION_STATUS.REGISTERED) {
    await pointsService.awardPoints({
      userId,
      amount: POINTS_RULES.EVENT_REGISTRATION,
      reason: `Registered for event: ${event.title}`,
      relatedEvent: event._id,
      createdBy: userId,
    });
  }

  return registration;
};

const cancelMyRegistration = async (eventId, userId) => {
  const registration = await EventRegistration.findOne({ event: eventId, user: userId });
  if (!registration) {
    const error = new Error("Registration not found");
    error.status = 404;
    throw error;
  }
  registration.status = REGISTRATION_STATUS.CANCELLED;
  await registration.save();
  return registration;
};

const getMyRegistrations = async (userId) => {
  return EventRegistration.find({ user: userId })
    .populate({
      path: "event",
      select: "title date location coverImage club status",
      populate: { path: "club", select: "clubName" },
    })
    .sort({ createdAt: -1 });
};

const getEventRegistrations = async (eventId, statusFilter) => {
  const filter = { event: eventId };
  if (statusFilter) filter.status = statusFilter;
  return EventRegistration.find(filter).populate("user", "fullName email phoneNumber");
};

const reviewRegistration = async (registrationId, reviewerId, decision) => {
  const registration = await EventRegistration.findById(registrationId).populate("event", "title _id");
  if (!registration) {
    const error = new Error("Registration not found");
    error.status = 404;
    throw error;
  }
  if (registration.status !== REGISTRATION_STATUS.PENDING) {
    const error = new Error(`Registration is already ${registration.status}`);
    error.status = 400;
    throw error;
  }

  registration.status = decision === "approve" ? REGISTRATION_STATUS.APPROVED : REGISTRATION_STATUS.REJECTED;
  registration.reviewedBy = reviewerId;
  registration.reviewedAt = new Date();
  await registration.save();

  if (decision === "approve") {
    await pointsService.awardPoints({
      userId: registration.user,
      amount: POINTS_RULES.EVENT_REGISTRATION,
      reason: `Registration approved for event: ${registration.event.title}`,
      relatedEvent: registration.event._id,
      createdBy: reviewerId,
    });
  }

  return registration;
};

module.exports = {
  registerForEvent,
  cancelMyRegistration,
  getMyRegistrations,
  getEventRegistrations,
  reviewRegistration,
};