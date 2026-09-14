const express = require("express");
const router = express.Router();

const {
  createVolunteer,
  getVolunteers,
  getVolunteer,
  updateVolunteer,
  deleteVolunteer,
} = require("../controllers/volunteer_controller");

const { protect } = require("../middlewares/auth_middleware");
const authorize = require("../middlewares/rbac_middleware");
const upload = require("../middlewares/upload_middleware");
const { ROLES } = require("../config/constants");

router.use(protect); // "anybody" = anybody logged into the system, same as your other list endpoints

router.post("/", authorize(ROLES.ADMIN), upload.single("image"), createVolunteer);
router.get("/", getVolunteers);
router.get("/:id", getVolunteer);
router.put("/:id", authorize(ROLES.ADMIN), upload.single("image"), updateVolunteer);
router.delete("/:id", authorize(ROLES.ADMIN), deleteVolunteer);

module.exports = router;