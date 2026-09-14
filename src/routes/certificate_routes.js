const express = require("express");
const router = express.Router();

const {
  createCertificate,
  deleteCertificate,
  downloadCertificate,
} = require("../controllers/certificate_controller");
const { protect } = require("../middlewares/auth_middleware");
const authorize = require("../middlewares/rbac_middleware");
const upload = require("../middlewares/upload_middleware");
const { ROLES } = require("../config/constants");

router.use(protect);

// Admin / Team Leader issue certificates & recommendation letters to a user
router.post("/", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), upload.single("file"), createCertificate);
router.delete("/:id", authorize(ROLES.ADMIN, ROLES.TEAM_LEADER), deleteCertificate);

// Any authenticated user can download a certificate (ownership isn't re-checked here;
// add a req.user._id === certificate.user check in the controller if you need it stricter)
router.get("/:id/download", downloadCertificate);

module.exports = router;
