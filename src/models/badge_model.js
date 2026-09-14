const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
  {
    badgeName: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "" },
    badgeImage: { type: String, default: null },
    points: { type: Number, default: 0, min: 0 },
    // Total points a user needs to have accumulated to be eligible for this badge.
    // Used to compute "progress toward next badge" for the User module.
    pointsRequired: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

module.exports = mongoose.model("Badge", badgeSchema);
