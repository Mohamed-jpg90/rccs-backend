const EventFeedback = require("../models/feedback_model");
const Event = require("../models/event_model");
const Attendance = require("../models/attendance_model");
const eventService = require("./event_service");
const pointsService = require("./points_service");
const { ATTENDANCE_STATUS, EVENT_STATUS, ROLES, POINTS_RULES } = require("../config/constants");

const createFeedback = async (eventId, userId, { rating, comment }) => {
  const event = await Event.findById(eventId);
  if (!event) {
    const error = new Error("Event not found");
    error.status = 404;
    throw error;
  }

  await eventService.syncEventStatus(event);

  if (event.status !== EVENT_STATUS.FINISHED) {
    const error = new Error("You can only leave feedback after the event has ended");
    error.status = 400;
    throw error;
  }

  const attendance = await Attendance.findOne({ event: eventId, user: userId });
  if (!attendance || attendance.attendanceStatus !== ATTENDANCE_STATUS.PRESENT) {
    const error = new Error("Only users who attended the event can leave feedback");
    error.status = 403;
    throw error;
  }

  if (!rating) {
    const error = new Error("rating is required");
    error.status = 400;
    throw error;
  }

  const existing = await EventFeedback.findOne({ event: eventId, user: userId });
  if (existing) {
    const error = new Error("You already submitted feedback for this event");
    error.status = 409;
    throw error;
  }

  const feedback = await EventFeedback.create({ event: eventId, user: userId, rating, comment });

  // The unique index + existing-check above already guarantee this only fires once per event.
  await pointsService.awardPoints({
    userId,
    amount: POINTS_RULES.FEEDBACK_SUBMITTED,
    reason: `Submitted feedback for event: ${event.title}`,
    relatedEvent: event._id,
    createdBy: userId,
  });

  return feedback;
};

const getFeedbackForEvent = async (eventId) => {
  return EventFeedback.find({ event: eventId }).populate("user", "fullName email").sort({ createdAt: -1 });
};

const deleteFeedback = async (feedbackId, requestingUser) => {
  const feedback = await EventFeedback.findById(feedbackId);
  if (!feedback) {
    const error = new Error("Feedback not found");
    error.status = 404;
    throw error;
  }

  const isOwner = String(feedback.user) === String(requestingUser._id);
  const isAdmin = requestingUser.role === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    const error = new Error("You can only delete your own feedback");
    error.status = 403;
    throw error;
  }

  await feedback.deleteOne();
  return feedback;
};

module.exports = { createFeedback, getFeedbackForEvent, deleteFeedback };