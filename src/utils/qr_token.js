const jwt = require("jsonwebtoken");

// Short-lived, purpose-specific token embedded inside the event's QR code image.
// Kept on a separate secret from the login JWT so it can be rotated independently.
const generateQrToken = (eventId) => {
  return jwt.sign({ eventId, purpose: "event-checkin" }, process.env.QR_SECRET, {
    expiresIn: process.env.QR_TOKEN_EXPIRES_IN || "15m",
  });
};

const verifyQrToken = (token) => {
  const decoded = jwt.verify(token, process.env.QR_SECRET);
  if (decoded.purpose !== "event-checkin") {
    throw new Error("Invalid QR token purpose");
  }
  return decoded; // { eventId, purpose, iat, exp }
};

module.exports = { generateQrToken, verifyQrToken };
