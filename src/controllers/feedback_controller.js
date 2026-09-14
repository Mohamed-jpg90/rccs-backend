const asyncHandler = require("../utils/async_handler");
const feedbackService = require("../services/feedback_service");

const createFeedback = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.createFeedback(req.params.id, req.user._id, req.body);
  res.status(201).json({ feedback });
});

const getEventFeedback = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.getFeedbackForEvent(req.params.id);
  res.json({ total: feedback.length, feedback });
});

const deleteFeedback = asyncHandler(async (req, res) => {
  await feedbackService.deleteFeedback(req.params.feedbackId, req.user);
  res.json({ message: "Feedback deleted successfully" });
});

module.exports = { createFeedback, getEventFeedback, deleteFeedback };