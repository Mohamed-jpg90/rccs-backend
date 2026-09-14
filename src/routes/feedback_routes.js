const express = require("express");
const router = express.Router({ mergeParams: true }); // access to :id (eventId) from the parent event router

const { createFeedback, getEventFeedback, deleteFeedback } = require("../controllers/feedback_controller");
const authorize = require("../middlewares/rbac_middleware");
const { ROLES } = require("../config/constants");

// protect() is already applied by the parent event router

router.post("/", authorize(ROLES.USER), createFeedback);
router.get("/", getEventFeedback); // anyone authenticated can view an event's feedback
router.delete("/:feedbackId", deleteFeedback);

module.exports = router;