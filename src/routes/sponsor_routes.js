const express = require("express");
const router = express.Router();

const {
  createSponsor,
  getSponsorImages,
  getSponsors,
  getSponsor,
  updateSponsor,
  deleteSponsor,
} = require("../controllers/sponsor_controller");

const { protect } = require("../middlewares/auth_middleware");
const authorize = require("../middlewares/rbac_middleware");
const upload = require("../middlewares/upload_middleware"); // your existing local multer middleware
const { ROLES } = require("../config/constants");

router.use(protect);

router.post("/", authorize(ROLES.ADMIN), upload.single("image"), createSponsor);
router.get("/images", getSponsorImages); // keep above "/:id"
router.get("/", getSponsors);
router.get("/:id", getSponsor);
router.put("/:id", authorize(ROLES.ADMIN), upload.single("image"), updateSponsor);
router.delete("/:id", authorize(ROLES.ADMIN), deleteSponsor);

module.exports = router;