const mongoose = require("mongoose");
const { CLUB_JOIN_STATUS } = require("../config/constants");

const clubMembershipRequestSchema = new mongoose.Schema(
  {
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: Object.values(CLUB_JOIN_STATUS), default: CLUB_JOIN_STATUS.PENDING },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

clubMembershipRequestSchema.index({ club: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("ClubMembershipRequest", clubMembershipRequestSchema);