const express = require("express");
const router = express.Router();

const { getDashboard, getTopMembers } = require("../controllers/dashboard_controller");
const { protect } = require("../middlewares/auth_middleware");
const authorize = require("../middlewares/rbac_middleware");
const { ROLES } = require("../config/constants");

router.get("/", protect, authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), getDashboard);
router.get("/top-members", protect, authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), getTopMembers);

module.exports = router;