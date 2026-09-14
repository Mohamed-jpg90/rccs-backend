const mongoose = require("mongoose");
const { ROLES } = require("../config/constants");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["Announcement", "EventUpdate", "BadgeAwarded", "AttendanceConfirmed", "PointsUpdated", "General"],
      default: "General",
    },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    receiverRole: { type: String, enum: [...Object.values(ROLES), "All"], default: "All" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

module.exports = mongoose.model("Notification", notificationSchema);
