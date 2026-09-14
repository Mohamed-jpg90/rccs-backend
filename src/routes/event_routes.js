const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
  getEventQrCode,
} = require("../controllers/event_controller");
const { checkInWithQr } = require("../controllers/attendance_controller");

const { protect } = require("../middlewares/auth_middleware");
const authorize = require("../middlewares/rbac_middleware");
const upload = require("../middlewares/upload_middleware");
const validate = require("../middlewares/validate_middleware");
const { eventValidator } = require("../validators/event_validator");
const { ROLES } = require("../config/constants");
const feedbackRoutes = require('./feedback_routes.js')

const attendanceRoutes = require("./attendance_routes");
const registrationRoutes = require("./registration_routes");

router.use(protect);

router.post(
  "/",
  authorize(ROLES.ADMIN, ROLES.TEAM_LEADER),
  upload.single("coverImage"),
  eventValidator,
  validate,
  createEvent
);
router.get("/", getEvents); // everyone can browse events
router.get("/:id", getEvent);
router.put("/:id", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), upload.single("coverImage"), updateEvent);
router.delete("/:id", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), deleteEvent);
router.get("/:id/participants", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), getEventParticipants);
router.get("/:id/qrcode", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), getEventQrCode);

// Any authenticated member scans the QR code shown at the event -> self check-in
router.post("/:id/checkin", checkInWithQr);

// /api/events/:id/attendance, /present, /absent
router.use("/:id/attendance", attendanceRoutes);

// /api/events/:id/registrations (+ /:registrationId/approve|reject)
router.use("/:id/registrations", registrationRoutes);


router.use("/:id/feedback", feedbackRoutes);

module.exports = router;
