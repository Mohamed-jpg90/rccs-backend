const Badge = require("../models/badge_model");
const UserBadge = require("../models/user_badge_model");
const User = require("../models/user_model");
const pointsService = require("./points_service");

const createBadge = async (data, uploadedFile) => {
  return Badge.create({
    badgeName: data.badgeName,
    description: data.description,
    points: data.points,
    pointsRequired: data.pointsRequired,
    badgeImage: uploadedFile ? `/uploads/${uploadedFile.filename}` : null,
  });
};

const getBadges = async () => Badge.find().sort({ pointsRequired: 1, createdAt: -1 });

const updateBadge = async (id, updates, uploadedFile) => {
  const badge = await Badge.findById(id);
  if (!badge) {
    const error = new Error("Badge not found");
    error.status = 404;
    throw error;
  }

  const fields = ["badgeName", "description", "points", "pointsRequired"];
  fields.forEach((field) => {
    if (updates[field] !== undefined) badge[field] = updates[field];
  });
  if (uploadedFile) badge.badgeImage = `/uploads/${uploadedFile.filename}`;

  await badge.save();
  return badge;
};

const deleteBadge = async (id) => {
  const badge = await Badge.findByIdAndDelete(id);
  if (!badge) {
    const error = new Error("Badge not found");
    error.status = 404;
    throw error;
  }
  await UserBadge.deleteMany({ badge: id }); 
  return badge;
};

const assignBadge = async (badgeId, userId, assignedBy) => {
  const badge = await Badge.findById(badgeId);
  if (!badge) {
    const error = new Error("Badge not found");
    error.status = 404;
    throw error;
  }

  const existing = await UserBadge.findOne({ user: userId, badge: badgeId });
  if (existing) {
    const error = new Error("This badge is already awarded to this user");
    error.status = 409;
    throw error;
  }

  const userBadge = await UserBadge.create({ user: userId, badge: badgeId });

  // The unique index above already guarantees this only fires once per user/badge.
  if (badge.points > 0) {
    await pointsService.awardPoints({
      userId,
      amount: badge.points,
      reason: `Earned badge: ${badge.badgeName}`,
      relatedBadge: badge._id,
      createdBy: assignedBy,
      notifyTitle: "Badge earned!",
    });
  }

  return userBadge;
};
// Earned badges + the single nearest badge the user hasn't unlocked yet (by pointsRequired).
const getMyBadgeProgress = async (userId) => {
  const user = await User.findById(userId);
  const earned = await UserBadge.find({ user: userId }).populate("badge");
  
  const validEarned = earned.filter((ub) => ub.badge);
  const earnedBadgeIds = validEarned.map((ub) => String(ub.badge._id));
  const nextBadge = await Badge.findOne({
    _id: { $nin: earnedBadgeIds },
    pointsRequired: { $gt: 0 },
  }).sort({ pointsRequired: 1 });

  let progress = null;
  if (nextBadge) {
    progress = {
      badge: nextBadge,
      currentPoints: user.totalPoints,
      pointsNeeded: Math.max(nextBadge.pointsRequired - user.totalPoints, 0),
      percentComplete: Math.min(Math.round((user.totalPoints / nextBadge.pointsRequired) * 100), 100),
    };
  }

  return { earnedBadges: earned, nextBadgeProgress: progress };
};

const unassignBadge = async (badgeId, userId) => {
  const deleted = await UserBadge.findOneAndDelete({ user: userId, badge: badgeId });
  if (!deleted) {
    const error = new Error("This user does not have this badge assigned");
    error.status = 404;
    throw error;
  }
  return deleted;
};



module.exports = { createBadge, getBadges, updateBadge, deleteBadge, assignBadge, getMyBadgeProgress, unassignBadge };
