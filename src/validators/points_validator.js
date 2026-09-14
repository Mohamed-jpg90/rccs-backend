const { body } = require("express-validator");
const { POINTS_TYPE } = require("../config/constants");

const pointsValidator = [
  body("type").isIn(Object.values(POINTS_TYPE)).withMessage("type must be Earn or Deduct"),
  body("amount").isInt({ min: 1 }).withMessage("amount must be a positive integer"),
  body("reason").trim().notEmpty().withMessage("reason is required"),
];

module.exports = { pointsValidator };
