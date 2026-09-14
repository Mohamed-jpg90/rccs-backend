const express = require("express");
const router = express.Router();

const {
  createNotification,
  getNotifications,
  markNotificationRead,
  deleteNotification,
} = require("../controllers/notification_controller");
const { protect } = require("../middlewares/auth_middleware");
const authorize = require("../middlewares/rbac_middleware");
const validate = require("../middlewares/validate_middleware");
const { notificationValidator } = require("../validators/notification_validator");
const { ROLES } = require("../config/constants");

router.use(protect);

router.post("/", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), notificationValidator, validate, createNotification);
router.get("/", getNotifications);
router.put("/:id/read", markNotificationRead);
router.delete("/:id", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), deleteNotification);

module.exports = router;
