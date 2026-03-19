const userService = require("../services/userService");

/** GET /api/users */
const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await userService.getAllUsers({ page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/** GET /api/users/:id */
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/users/:id */
const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/users/:id/role */
const updateUserRole = async (req, res, next) => {
  try {
    const user = await userService.updateUserRole(req.params.id, req.body.role);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/users/:id */
const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(
      req.params.id,
      req.body,
      req.user,
    );
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/users/:id/password */
const updatePassword = async (req, res, next) => {
  try {
    await userService.updatePassword(req.params.id, req.body, req.user);
    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserRole,
  updateProfile,
  updatePassword,
};
