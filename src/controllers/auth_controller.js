const asyncHandler = require("../utils/async_handler");
const authService = require("../services/auth_service");

const register = asyncHandler(async (req, res) => {
  const { token, user } = await authService.register(req.body);
  res.status(201).json({
    token,
    user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, status: user.status },
  });
});

const login = asyncHandler(async (req, res) => {
  const { token, user } = await authService.login(req.body);
  res.json({
    token,
    user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, status: user.status },
  });
});

const logout = asyncHandler(async (req, res) => {
  res.json({ message: "Logged out successfully" });
});

const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, logout, getProfile };
