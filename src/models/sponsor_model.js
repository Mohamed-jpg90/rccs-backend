const mongoose = require("mongoose");
const socialLinksSchema = require("./social_links_schema");

const sponsorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    sector: { type: String, default: "" },
    image: { type: String, required: true },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("Sponsor", sponsorSchema);