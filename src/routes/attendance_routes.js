const express = require("express");
const router = express.Router({ mergeParams: true }); // access to :id (eventId) from the parent event router

const {
  markAttendance,
  getAttendance,
  getPresentAttendance,
  getAbsentAttendance,
} = require("../controllers/attendance_controller");

const authorize = require("../middlewares/rbac_middleware");
const { ROLES } = require("../config/constants");

// protect() is already applied by the parent event router
router.post("/",
  authorize(ROLES.ADMIN, ROLES.TEAM_LEADER),
  markAttendance);
router.get("/", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), getAttendance);
router.get("/present", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), getPresentAttendance);
router.get("/absent", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), getAbsentAttendance);

module.exports = router;
