const User = require("../models/user_model");
const PointsTransaction = require("../models/points_transaction_model");
const { POINTS_TYPE } = require("../config/constants");
const notificationService = require("./notification_service");

// Admin / Team Leader awards or deducts points. Keeps User.totalPoints in sync.
const createTransaction = async ({ userId, type, amount, reason, relatedEvent, relatedBadge, createdBy }) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const delta = type === POINTS_TYPE.DEDUCT ? -Math.abs(amount) : Math.abs(amount);

  const transaction = await PointsTransaction.create({
    user: userId,
    type,
    amount: Math.abs(amount),
    reason,
    relatedEvent: relatedEvent || null,
    relatedBadge: relatedBadge || null,
    createdBy,
  });

  user.totalPoints = Math.max(0, user.totalPoints + delta);
  await user.save();

  return { transaction, totalPoints: user.totalPoints };
};

// Shared helper for every automatic "earn" trigger (attendance, registration,
// feedback, club approval, badge award, ...). Never throws — a points/notification
// failure should never break the action that triggered it (e.g. don't fail
// attendance check-in just because a notification couldn't be sent).
const awardPoints = async ({ userId, amount, reason, relatedEvent, relatedBadge, createdBy, notifyTitle }) => {
  if (!amount || amount <= 0) return null;

  try {
    const result = await createTransaction({
      userId,
      type: POINTS_TYPE.EARN,
      amount,
      reason,
      relatedEvent,
      relatedBadge,
      createdBy,
    });

    await notificationService.createNotification({
      title: notifyTitle || "Points earned!",
      message: `+${amount} points: ${reason}`,
      type: "PointsUpdated",
      receiver: userId,
    });

    return result;
  } catch (err) {
    console.error(`Failed to award points to user ${userId} (${reason}):`, err.message);
    return null;
  }
};

const getMyPoints = async (userId) => {
  const user = await User.findById(userId);
  const history = await PointsTransaction.find({ user: userId }).sort({ createdAt: -1 });
  return { totalPoints: user.totalPoints, history };
};

const getUserPoints = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  const history = await PointsTransaction.find({ user: userId }).sort({ createdAt: -1 });
  return { totalPoints: user.totalPoints, history };
};

module.exports = { createTransaction, awardPoints, getMyPoints, getUserPoints };