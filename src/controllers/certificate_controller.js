const asyncHandler = require("../utils/async_handler");
const certificateService = require("../services/certificate_service");

const createCertificate = asyncHandler(async (req, res) => {
  const certificate = await certificateService.createCertificate(req.body, req.user._id, req.file);
  res.status(201).json({ certificate });
});

const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await certificateService.getMyCertificates(req.user._id);
  res.json({ total: certificates.length, certificates });
});

const getCertificatesForUser = asyncHandler(async (req, res) => {
  const certificates = await certificateService.getCertificatesForUser(req.params.id);
  res.json({ total: certificates.length, certificates });
});

const deleteCertificate = asyncHandler(async (req, res) => {
  await certificateService.deleteCertificate(req.params.id);
  res.json({ message: "Certificate deleted successfully" });
});

// Forces a browser download instead of inline display
const downloadCertificate = asyncHandler(async (req, res) => {
  const certificate = await certificateService.getCertificateById(req.params.id);
  if (!certificate) return res.status(404).json({ message: "Certificate not found" });

  return res.redirect(certificate.fileUrl);
});

module.exports = { createCertificate, getMyCertificates, getCertificatesForUser, deleteCertificate, downloadCertificate };
