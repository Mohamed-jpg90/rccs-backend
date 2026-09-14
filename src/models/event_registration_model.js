const mongoose = require("mongoose");
const { REGISTRATION_STATUS } = require("../config/constants");

const eventRegistrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: Object.values(REGISTRATION_STATUS),
      default: REGISTRATION_STATUS.REGISTERED,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

// A user can only have one active registration per event
eventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("EventRegistration", eventRegistrationSchema);
