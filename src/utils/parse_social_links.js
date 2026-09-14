// req.body.socialLinks arrives as a JSON string over multipart/form-data
// (e.g. '{"instagram":"https://instagram.com/x"}') — falls back to {} safely.
const parseSocialLinks = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw; // already parsed (e.g. JSON request body)

  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

module.exports = parseSocialLinks;