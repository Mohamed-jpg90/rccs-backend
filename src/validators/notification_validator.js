const { body } = require("express-validator");
const { ROLES } = require("../config/constants");

const notificationValidator = [
  body("title").trim().notEmpty().withMessage("title is required"),
  body("message").trim().notEmpty().withMessage("message is required"),
  body("receiver").optional().isMongoId(),
  body("receiverRole").optional().isIn([...Object.values(ROLES), "All"]),
];

module.exports = { notificationValidator };
