const mongoose = require("mongoose");
const { ANNOUNCEMENT_PRIORITY } = require("../config/constants");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: Object.values(ANNOUNCEMENT_PRIORITY),
      default: ANNOUNCEMENT_PRIORITY.MEDIUM,
    },
    expirationDate: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

module.exports = mongoose.model("Announcement", announcementSchema);
