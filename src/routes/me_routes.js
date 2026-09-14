const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth_middleware");

const { getMyProfile, getMyLedClubs } = require("../controllers/me_controller");
const { getMyAttendanceHistory } = require("../controllers/attendance_controller");
const { getMyRegistrations } = require("../controllers/registration_controller");
const { getMyKpi } = require("../controllers/kpi_controller");
const { getMyPoints } = require("../controllers/points_controller");
const { getMyBadgeProgress } = require("../controllers/badge_controller");
const { getMyCertificates } = require("../controllers/certificate_controller");
const { getMyRequests: getMyClubRequests } = require("../controllers/club_membership_controller");

router.use(protect);

router.get("/profile", getMyProfile);
router.get("/led-clubs", getMyLedClubs);
router.get("/attendance", getMyAttendanceHistory);
router.get("/registrations", getMyRegistrations);
router.get("/kpi", getMyKpi);
router.get("/points", getMyPoints);
router.get("/badges", getMyBadgeProgress);
router.get("/certificates", getMyCertificates);
router.get("/club-requests", getMyClubRequests);

module.exports = router;