const mongoose = require("mongoose");
const { EVENT_STATUS } = require("../config/constants");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    coverImage: { type: String, default: null },
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    registrationDeadline: { type: Date, required: true },
    status: { type: String, enum: Object.values(EVENT_STATUS), default: EVENT_STATUS.UPCOMING },
    // If true, self-registration goes to "Pending" and needs Admin/Team Leader approval.
    requiresApproval: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

module.exports = mongoose.model("Event", eventSchema);
