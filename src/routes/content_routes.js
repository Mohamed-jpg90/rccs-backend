const express = require("express");
const router = express.Router();

const { createContent, getContent, updateContent, deleteContent } = require("../controllers/content_controller");
const { protect } = require("../middlewares/auth_middleware");
const authorize = require("../middlewares/rbac_middleware");
const validate = require("../middlewares/validate_middleware");
const { contentValidator } = require("../validators/content_validator");
const { ROLES } = require("../config/constants");

router.use(protect);

// No more file upload middleware — content is now Drive/YouTube links only
router.post("/", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), contentValidator, validate, createContent);
router.get("/", getContent);
router.put("/:id", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), updateContent);
router.delete("/:id", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), deleteContent);

module.exports = router;