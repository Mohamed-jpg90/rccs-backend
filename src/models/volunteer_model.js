const mongoose = require("mongoose");
const socialLinksSchema = require("./social_links_schema");

const volunteerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    description: { type: String, default: "" },
    image: { type: String, required: true },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
    linkedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);