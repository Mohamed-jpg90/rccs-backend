const { body } = require("express-validator");

const badgeValidator = [
  body("badgeName").trim().notEmpty().withMessage("badgeName is required"),
  body("points").optional().isInt({ min: 0 }),
  body("pointsRequired").optional().isInt({ min: 0 }),
];

const assignBadgeValidator = [body("userId").isMongoId().withMessage("A valid userId is required")];

module.exports = { badgeValidator, assignBadgeValidator };
