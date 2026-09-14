const { body } = require("express-validator");
const { ROLES, USER_STATUS } = require("../config/constants");

const updateUserValidator = [
  body("fullName").optional().trim().notEmpty(),
  body("phoneNumber").optional().isString(),
  body("role").optional().isIn(Object.values(ROLES)).withMessage("Invalid role"),
  body("club").optional().isMongoId().withMessage("Invalid club id"),
];

const updateStatusValidator = [
  body("status").isIn(Object.values(USER_STATUS)).withMessage("status must be Active or Inactive"),
];

module.exports = { updateUserValidator, updateStatusValidator };
