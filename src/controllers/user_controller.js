const asyncHandler = require("../utils/async_handler");
const userService = require("../services/user_service");

const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getUsers(req.query);
  res.json(result);
});

const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.user, req.params.id, req.body, req.file);
  res.json({ user });
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.user, req.params.id);
  res.json({ message: "User deleted successfully" });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.updateUserStatus(req.params.id, req.body.status);
  res.json({ user });
});

const getUserOverview = asyncHandler(async (req, res) => {
  const overview = await userService.getUserOverview(req.params.id);

  if (!overview) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  res.json(overview);
});

module.exports = { getUsers, getUser, updateUser, deleteUser, updateUserStatus , getUserOverview };
