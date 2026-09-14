const mongoose = require("mongoose");
const { ROLES, USER_STATUS } = require("../config/constants");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phoneNumber: { type: String, trim: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    profileImage: { type: String, default: null },
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", default: null },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("User", userSchema);
