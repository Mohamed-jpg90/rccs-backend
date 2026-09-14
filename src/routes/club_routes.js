const express = require("express");
const router = express.Router();

const {
  createClub,
  getClubs,
  getClub,
  updateClub,
  deleteClub,
  getClubOverview,
} = require("../controllers/club_controller");
const {
  getClubMembers,
  getClubTop3,
  getClubStats,
  getClubAnalytics,
} = require("../controllers/club_analytics_controller");
const {
  assignTeamLeader,
  unassignTeamLeader,
  getClubLeaders,
} = require("../controllers/club_leader_controller");

const {
  requestToJoin,
  cancelMyRequest,
  getClubRequests,
  approveRequest,
  rejectRequest,
} = require("../controllers/club_membership_controller");

const { protect } = require("../middlewares/auth_middleware");
const authorize = require("../middlewares/rbac_middleware");
const { requireAdminOrClubLeader } = require("../middlewares/club_access_middleware");
const upload = require("../middlewares/upload_middleware");
const validate = require("../middlewares/validate_middleware");
const { clubValidator } = require("../validators/club_validator");
const { ROLES } = require("../config/constants");

router.use(protect);

router.post("/", authorize(ROLES.ADMIN), upload.single("coverImage"), clubValidator, validate, createClub);
router.get("/", getClubs);
router.get("/:id", getClub);
router.get("/:id/overview", getClubOverview);

router.put("/:id", requireAdminOrClubLeader, upload.single("coverImage"), updateClub);
router.delete("/:id", authorize(ROLES.ADMIN), deleteClub);

router.post("/:id/team-leaders", authorize(ROLES.ADMIN), assignTeamLeader);
router.get("/:id/team-leaders", getClubLeaders);
router.delete("/:id/team-leaders/:userId", authorize(ROLES.ADMIN), unassignTeamLeader);

router.post("/:id/join", authorize(ROLES.USER), requestToJoin);
router.delete("/:id/join", authorize(ROLES.USER), cancelMyRequest);
router.get("/:id/join-requests", requireAdminOrClubLeader, getClubRequests);
router.put("/:id/join-requests/:requestId/approve", requireAdminOrClubLeader, approveRequest);
router.put("/:id/join-requests/:requestId/reject", requireAdminOrClubLeader, rejectRequest);


router.get("/:id/users", requireAdminOrClubLeader, getClubMembers);
router.get("/:id/top3", requireAdminOrClubLeader, getClubTop3);
router.get("/:id/stats", requireAdminOrClubLeader, getClubStats);
router.get("/:id/analytics", requireAdminOrClubLeader, getClubAnalytics);


module.exports = router;