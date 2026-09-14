const { body } = require("express-validator");
const { ANNOUNCEMENT_PRIORITY } = require("../config/constants");

const announcementValidator = [
  body("title").trim().notEmpty().withMessage("title is required"),
  body("description").trim().notEmpty().withMessage("description is required"),
  body("priority").optional().isIn(Object.values(ANNOUNCEMENT_PRIORITY)),
  body("expirationDate").optional().isISO8601(),
];

module.exports = { announcementValidator };
