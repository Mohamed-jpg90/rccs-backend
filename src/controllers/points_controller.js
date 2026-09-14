const asyncHandler = require("../utils/async_handler");
const pointsService = require("../services/points_service");
const notificationService = require("../services/notification_service");

// Admin / Team Leader awards or deducts points for a user
const createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, reason, relatedEvent, relatedBadge } = req.body;
  const result = await pointsService.createTransaction({
    userId: req.params.id,
    type,
    amount,
    reason,
    relatedEvent,
    relatedBadge,
    createdBy: req.user._id,
  });

  await notificationService.createNotification({
    title: type === "Earn" ? "Points earned!" : "Points deducted",
    message: `${amount} points ${type === "Earn" ? "added" : "deducted"}: ${reason}`,
    type: "PointsUpdated",
    receiver: req.params.id,
  });

  res.status(201).json(result);
});

const getMyPoints = asyncHandler(async (req, res) => {
  const result = await pointsService.getMyPoints(req.user._id);
  res.json(result);
});

const getUserPoints = asyncHandler(async (req, res) => {
  const result = await pointsService.getUserPoints(req.params.id);
  res.json(result);
});

module.exports = { createTransaction, getMyPoints, getUserPoints };
