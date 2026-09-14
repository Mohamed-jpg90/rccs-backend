const { body } = require("express-validator");

const eventValidator = [
  body("title").trim().notEmpty().withMessage("title is required"),
  body("club").isMongoId().withMessage("A valid club id is required"),
  body("location").trim().notEmpty().withMessage("location is required"),
  body("date").isISO8601().withMessage("date must be a valid date"),
  body("time").trim().notEmpty().withMessage("time is required"),
  body("capacity").isInt({ min: 1 }).withMessage("capacity must be a positive integer"),
  body("registrationDeadline").isISO8601().withMessage("registrationDeadline must be a valid date"),
  body("requiresApproval").optional().isBoolean(),
];

module.exports = { eventValidator };
