const { body } = require("express-validator");

const removalRequestValidator = [body("reason").trim().notEmpty().withMessage("reason is required")];

module.exports = { removalRequestValidator };
