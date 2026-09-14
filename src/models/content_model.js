const mongoose = require("mongoose");
const { CONTENT_TYPE } = require("../config/constants");

const contentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: Object.values(CONTENT_TYPE), required: true },
    // Only external links now — no more uploaded files for content.
    externalUrl: { type: String, required: true, trim: true },
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

module.exports = mongoose.model("Content", contentSchema);