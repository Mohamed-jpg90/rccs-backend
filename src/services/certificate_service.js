const Certificate = require("../models/certificate_model");

const createCertificate = async (data, issuerId, uploadedFile) => {
  if (!uploadedFile) {
    const error = new Error("Please upload a PDF or image.");
    error.status = 400;
    throw error;
  }

  return Certificate.create({
    title: data.title,
    description: data.description,
    type: data.type,
fileUrl: uploadedFile.path,
    user: data.userId,
    issuedBy: issuerId,
  });
};

const getMyCertificates = async (userId) => {
  return Certificate.find({ user: userId }).sort({ createdAt: -1 });
};

const getCertificatesForUser = async (userId) => {
  return Certificate.find({ user: userId }).populate("issuedBy", "fullName").sort({ createdAt: -1 });
};

const deleteCertificate = async (id) => {
  const cert = await Certificate.findByIdAndDelete(id);
  if (!cert) {
    const error = new Error("Certificate not found");
    error.status = 404;
    throw error;
  }
  return cert;
};

const getCertificateById = async (id) => Certificate.findById(id);

module.exports = { createCertificate, getMyCertificates, getCertificatesForUser, deleteCertificate, getCertificateById };
