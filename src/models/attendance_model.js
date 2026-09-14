const mongoose = require("mongoose");
const { ATTENDANCE_STATUS } = require("../config/constants");

const attendanceSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    attendanceStatus: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.PENDING,
    },

    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    checkedAt: {
      type: Date,
      default: null,
    },

    checkedInViaQr: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: false,
    },
  }
);

attendanceSchema.index(
  { event: 1, user: 1 },
  { unique: true }
);

const Attendance =
  mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;