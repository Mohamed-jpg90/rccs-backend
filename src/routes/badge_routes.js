const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth_middleware");
const authorize = require("../middlewares/rbac_middleware");
const upload = require("../middlewares/upload_middleware");
const validate = require("../middlewares/validate_middleware");
const { badgeValidator, assignBadgeValidator } = require("../validators/badge_validator");
const { ROLES } = require("../config/constants");
const { createBadge, getBadges, updateBadge, deleteBadge, assignBadge, unassignBadge } = require("../controllers/badge_controller");

router.use(protect);

router.post("/", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), upload.single("badgeImage"), badgeValidator, validate, createBadge);
router.get("/", getBadges);
router.put("/:id", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), upload.single("badgeImage"), updateBadge);
router.delete("/:id", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), deleteBadge);
router.post("/:id/assign", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), assignBadgeValidator, validate, assignBadge);
router.delete(
  "/:id/assign",
  authorize(ROLES.ADMIN, ROLES.TEAM_LEADER),
  assignBadgeValidator, 
  validate,
  unassignBadge
);
module.exports = router;
