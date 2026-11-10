const asyncHandler = require("../utils/async_handler");
const passwordService = require("../services/password_service");

const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;
  const result = await passwordService.resetPasswordByEmail(email, newPassword);
  res.json({ message: "Password reset successfully", ...result });
});

const changeUserPassword = asyncHandler(async (req, res) => {
  const user = await passwordService.setPasswordById(req.params.id, req.body.newPassword);
  res.json({ message: "Password changed successfully", user });
});

const changeMyPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await passwordService.changeMyPassword(req.user._id, currentPassword, newPassword);
  res.json({ message: "Password changed successfully" });
});

module.exports = { resetPassword, changeUserPassword, changeMyPassword };