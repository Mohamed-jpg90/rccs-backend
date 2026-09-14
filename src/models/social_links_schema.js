const mongoose = require("mongoose");

// All optional — a sponsor/volunteer can have none, some, or all of these.
const socialLinksSchema = new mongoose.Schema(
  {
    instagram: { type: String, trim: true, default: "" },
    tiktok: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    facebook: { type: String, trim: true, default: "" },
    twitter: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

module.exports = socialLinksSchema;