const asyncHandler = require("../utils/async_handler");
const kpiService = require("../services/kpi_service");

const getMyKpi = asyncHandler(async (req, res) => {
  const kpi = await kpiService.getMyKpi(req.user._id);
  res.json({ kpi });
});

module.exports = { getMyKpi };
