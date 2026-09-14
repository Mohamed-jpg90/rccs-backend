const { body } = require("express-validator");

const clubValidator = [
  body("clubName").trim().notEmpty().withMessage("clubName is required"),
  body("maxMembers").isInt({ min: 1 }).withMessage("maxMembers must be a positive integer"),
  body("description").optional().isString(),
];

module.exports = { clubValidator };
