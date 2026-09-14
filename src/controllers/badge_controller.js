const asyncHandler = require("../utils/async_handler");
const badgeService = require("../services/badge_service");

const createBadge = asyncHandler(async (req, res) => {
  const badge = await badgeService.createBadge(req.body, req.file);
  res.status(201).json({ badge });
});

const getBadges = asyncHandler(async (req, res) => {
  const badges = await badgeService.getBadges();
  res.json({ total: badges.length, badges });
});

const updateBadge = asyncHandler(async (req, res) => {
  const badge = await badgeService.updateBadge(req.params.id, req.body, req.file);
  res.json({ badge });
});

const deleteBadge = asyncHandler(async (req, res) => {
  await badgeService.deleteBadge(req.params.id);
  res.json({ message: "Badge deleted successfully" });
});

const assignBadge = asyncHandler(async (req, res) => {
  const userBadge = await badgeService.assignBadge(req.params.id, req.body.userId, req.user._id);
  res.status(201).json({ userBadge });
});

// GET /api/me/badges — earned badges + progress toward the next one
const getMyBadgeProgress = asyncHandler(async (req, res) => {
  const result = await badgeService.getMyBadgeProgress(req.user._id);
  res.json(result);
});

const unassignBadge = asyncHandler(async (req, res) => {
  await badgeService.unassignBadge(req.params.id, req.body.userId);
  res.json({ message: "Badge unassigned successfully" });
});


module.exports = { createBadge, getBadges, updateBadge, deleteBadge, assignBadge, getMyBadgeProgress, unassignBadge };
