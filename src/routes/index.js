const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth_routes"));
router.use("/users", require("./user_routes"));
router.use("/me", require("./me_routes")); // User module self-service (profile, attendance, kpi, points, badges, certificates)
router.use("/clubs", require("./club_routes"));
router.use("/events", require("./event_routes")); // also: /:id/attendance, /:id/registrations, /:id/qrcode, /:id/checkin
router.use("/badges", require("./badge_routes"));
router.use("/announcements", require("./announcement_routes"));
router.use("/notifications", require("./notification_routes"));
router.use("/dashboard", require("./dashboard_routes"));
router.use("/content", require("./content_routes"));
router.use("/leaderboard", require("./leaderboard_routes"));
router.use("/certificates", require("./certificate_routes"));
router.use("/removal-requests", require("./removal_request_routes"));
router.use("/sponsors", require("./sponsor_routes"));
router.use("/volunteers", require("./volunteer_routes"));

module.exports = router;
