const express = require("express");
const router = express.Router();

const {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcement_controller");
const { protect } = require("../middlewares/auth_middleware");
const authorize = require("../middlewares/rbac_middleware");
const validate = require("../middlewares/validate_middleware");
const { announcementValidator } = require("../validators/announcement_validator");
const { ROLES } = require("../config/constants");

router.use(protect);

router.post("/", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), announcementValidator, validate, createAnnouncement);
router.get("/", getAnnouncements);
router.put("/:id", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), updateAnnouncement);
router.delete("/:id", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), deleteAnnouncement);

module.exports = router;
