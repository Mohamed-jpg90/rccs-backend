const express = require("express");
const router = express.Router();

const { getUsers, getUser, updateUser, deleteUser, updateUserStatus, getUserOverview } = require("../controllers/user_controller");
const { protect } = require("../middlewares/auth_middleware");
const authorize = require("../middlewares/rbac_middleware");
const upload = require("../middlewares/upload_middleware");
const validate = require("../middlewares/validate_middleware");
const { updateUserValidator, updateStatusValidator } = require("../validators/user_validator");
const { ROLES } = require("../config/constants");

router.use(protect);

router.get("/", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), getUsers);
router.get("/:id", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), getUser);
router.put(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.TEAM_LEADER),
  upload.single("profileImage"),
  updateUserValidator,
  validate,
  updateUser
);
router.delete("/:id", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), deleteUser); // Team Leader gets a 403 from the service, guiding them to removal-request
router.patch("/:id/status", authorize(ROLES.ADMIN), updateStatusValidator, validate, updateUserStatus);

// Team Leader -> Admin approval workflow for removing a member
router.post("/:id/removal-request", authorize(ROLES.TEAM_LEADER), require("../controllers/removal_request_controller").createRequest);

// Admin-only shortcut: create + auto-approve in one call (used by ClubMembersTable's
// "Remove from club" / "Delete account" buttons — skips the Team Leader approval queue)
router.post("/:id/removal-request/direct", authorize(ROLES.ADMIN), require("../controllers/removal_request_controller").directRemoval);

// Admin/Team Leader: points ledger of any user
router.get("/:id/points", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), require("../controllers/points_controller").getUserPoints);
router.post(
  "/:id/points",
  authorize(ROLES.ADMIN, ROLES.TEAM_LEADER),
  require("../validators/points_validator").pointsValidator,
  validate,
  require("../controllers/points_controller").createTransaction
);

// Admin/Team Leader: certificates issued to a specific user
router.get("/:id/certificates", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), require("../controllers/certificate_controller").getCertificatesForUser);

router.get(
  "/:id/overview",
  authorize(ROLES.ADMIN, ROLES.TEAM_LEADER),
  getUserOverview
);

module.exports = router;