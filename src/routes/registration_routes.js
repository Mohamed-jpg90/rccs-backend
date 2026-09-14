const express = require("express");
const router = express.Router({ mergeParams: true }); // access to :id (eventId)

const {
  registerForEvent,
  cancelMyRegistration,
  getEventRegistrations,
  approveRegistration,
  rejectRegistration,
} = require("../controllers/registration_controller");

const authorize = require("../middlewares/rbac_middleware");
const { ROLES } = require("../config/constants");

// protect() is already applied by the parent event router

// User: register / cancel their own registration for this event
router.post("/", authorize(ROLES.USER), registerForEvent);
router.delete("/", authorize(ROLES.USER), cancelMyRegistration);

// Admin / Team Leader: view & approve/reject participants
router.get("/", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), getEventRegistrations);
router.put("/:registrationId/approve", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), approveRegistration);
router.put("/:registrationId/reject", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), rejectRegistration);

module.exports = router;
