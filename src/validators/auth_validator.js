const { body } = require("express-validator");

const registerValidator = [
  body("fullName").trim().notEmpty().withMessage("fullName is required"),
  body("email").isEmail().withMessage("A valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("password must be at least 6 characters"),
  body("phoneNumber").optional().isString(),
];

const loginValidator = [
  body("email").isEmail().withMessage("A valid email is required"),
  body("password").notEmpty().withMessage("password is required"),
];

module.exports = { registerValidator, loginValidator };
