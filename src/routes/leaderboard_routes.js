const express = require("express");
const router = express.Router();

const { getLeaderboard } = require("../controllers/leaderboard_controller");
const { protect } = require("../middlewares/auth_middleware");

router.get("/", protect, getLeaderboard);

module.exports = router;
