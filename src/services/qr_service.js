const QRCode = require("qrcode");
const Event = require("../models/event_model");
const { generateQrToken } = require("../utils/qr_token");

// Returns a base64 PNG data URL the Admin/Team Leader can display/print at the event entrance.
const generateEventQrCode = async (eventId) => {
  const event = await Event.findById(eventId);
  if (!event) {
    const error = new Error("Event not found");
    error.status = 404;
    throw error;
  }

  const token = generateQrToken(String(event._id));
  const qrImageDataUrl = await QRCode.toDataURL(token, { width: 400, margin: 2 });

  return { qrImageDataUrl, token, expiresIn: process.env.QR_TOKEN_EXPIRES_IN || "15m" };
};

module.exports = { generateEventQrCode };
