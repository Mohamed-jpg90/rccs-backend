const mongoose = require("mongoose");
const { POINTS_TYPE } = require("../config/constants");

const pointsTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: Object.values(POINTS_TYPE), required: true },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true },
    relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: "Event", default: null },
    relatedBadge: { type: mongoose.Schema.Types.ObjectId, ref: "Badge", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

module.exports = mongoose.model("PointsTransaction", pointsTransactionSchema);
