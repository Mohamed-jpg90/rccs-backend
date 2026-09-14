const mongoose = require("mongoose");

// Maps which Team Leader(s) lead which Club(s). A Team Leader can lead more than one club.
const clubLeaderSchema = new mongoose.Schema(
  {
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
    teamLeader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: "assignedAt", updatedAt: false } }
);

clubLeaderSchema.index({ club: 1, teamLeader: 1 }, { unique: true });

module.exports = mongoose.model("ClubLeader", clubLeaderSchema);