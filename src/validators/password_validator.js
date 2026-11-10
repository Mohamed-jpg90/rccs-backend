const { body } = require("express-validator");

const resetPasswordValidator = [
  body("email").isEmail().withMessage("A valid email is required"),
  body("newPassword")
    .optional()
    .isLength({ min: 8 })
    .withMessage("newPassword must be at least 8 characters"),
];

const changePasswordValidator = [
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("newPassword must be at least 8 characters"),
];

const changeMyPasswordValidator = [
  body("currentPassword").notEmpty().withMessage("currentPassword is required"),
  body("newPassword").isLength({ min: 8 }).withMessage("newPassword must be at least 8 characters"),
];

module.exports = { resetPasswordValidator, changePasswordValidator, changeMyPasswordValidator };