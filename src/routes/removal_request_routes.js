const express = require("express");
const router = express.Router();

const { getRequests, approveRequest, rejectRequest } = require("../controllers/removal_request_controller");
const { protect } = require("../middlewares/auth_middleware");
const authorize = require("../middlewares/rbac_middleware");
const { ROLES } = require("../config/constants");

// Note: creating a request is POST /api/users/:id/removal-request (see user_routes.js)
router.use(protect, authorize(ROLES.ADMIN));

router.get("/", getRequests);
router.put("/:id/approve", approveRequest);
router.put("/:id/reject", rejectRequest);

module.exports = router;
