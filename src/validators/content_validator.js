const { body } = require("express-validator");
const { CONTENT_TYPE } = require("../config/constants");

const contentValidator = [
  body("title").trim().notEmpty().withMessage("title is required"),
  body("type")
    .isIn(Object.values(CONTENT_TYPE))
    .withMessage(`type must be one of: ${Object.values(CONTENT_TYPE).join(", ")}`),
  body("externalUrl").trim().isURL().withMessage("externalUrl must be a valid URL"),
  body("club").optional({ nullable: true }).isMongoId().withMessage("club must be a valid id"),
];

module.exports = { contentValidator };