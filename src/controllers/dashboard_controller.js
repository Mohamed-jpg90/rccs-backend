const asyncHandler = require("../utils/async_handler");
const dashboardService = require("../services/dashboard_service");

const getDashboard = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats();
  res.json(stats);
});

const getTopMembers = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 20;
  const { topMembers, insights } = await dashboardService.getTopMembersByPoints(limit);
  res.json({ total: topMembers.length, topMembers, insights });
});

module.exports = { getDashboard, getTopMembers };