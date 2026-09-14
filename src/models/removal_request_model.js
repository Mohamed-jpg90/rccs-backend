const mongoose = require("mongoose");
const { REMOVAL_REQUEST_STATUS } = require("../config/constants");
const {REMOVAL_REQUEST_SCOPE} = require("../config/constants")
// A Team Leader cannot delete a member directly - they file a request an Admin must approve.
const removalRequestSchema = new mongoose.Schema(
  {
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: Object.values(REMOVAL_REQUEST_STATUS), default: REMOVAL_REQUEST_STATUS.PENDING },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    scope: {
   type: String,
   enum: Object.values(REMOVAL_REQUEST_SCOPE),
   default: REMOVAL_REQUEST_SCOPE.CLUB, // safest default — never silently delete
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

module.exports = mongoose.model("RemovalRequest", removalRequestSchema);
