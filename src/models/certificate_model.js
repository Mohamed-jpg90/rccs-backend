const mongoose = require("mongoose");
const { CERTIFICATE_TYPE } = require("../config/constants");

const certificateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: Object.values(CERTIFICATE_TYPE), default: CERTIFICATE_TYPE.CERTIFICATE },
    fileUrl: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

module.exports = mongoose.model("Certificate", certificateSchema);
