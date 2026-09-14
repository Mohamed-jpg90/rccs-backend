const asyncHandler = require("../utils/async_handler");
const clubAnalyticsService = require("../services/club_analytics_service");

const getClubMembers = asyncHandler(async (req, res) => {
  const result = await clubAnalyticsService.getClubMembers(req.params.id, req.query);
  res.json(result);
});

const getClubTop3 = asyncHandler(async (req, res) => {
  const top3 = await clubAnalyticsService.getClubTop3(req.params.id);
  res.json({ top3 });
});

const getClubStats = asyncHandler(async (req, res) => {
  const stats = await clubAnalyticsService.getClubStats(req.params.id);
  res.json(stats);
});

const getClubAnalytics = asyncHandler(async (req, res) => {
  const analytics = await clubAnalyticsService.getClubAnalytics(req.params.id);
  res.json(analytics);
});

module.exports = { getClubMembers, getClubTop3, getClubStats, getClubAnalytics };