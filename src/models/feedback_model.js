const mongoose = require("mongoose");

const eventFeedbackSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

// One feedback per user per event
eventFeedbackSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("EventFeedback", eventFeedbackSchema);