const express = require("express");
const router = express.Router();

const { register, login, logout, getProfile } = require("../controllers/auth_controller");
const { protect } = require("../middlewares/auth_middleware");
const validate = require("../middlewares/validate_middleware");
const { registerValidator, loginValidator } = require("../validators/auth_validator");

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.post("/logout", protect, logout);
router.get("/profile", protect, getProfile);

module.exports = router;
