const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema(
  {
    clubName: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "" },
    coverImage: { type: String, default: null },
    maxMembers: { type: Number, required: true, min: 1 },
    currentMembersCount: { type: Number, default: 0, min: 0 },
    // Denormalized for fast reads: who leads this club, and who its members are.
    teamLeaders: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("Club", clubSchema);