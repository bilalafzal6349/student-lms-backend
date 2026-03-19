const User = require("../models/User");

/**
 * Returns a paginated list of all users. Admin only.
 */
const getAllUsers = async ({ page = 1, limit = 10 }) => {
  const total = await User.countDocuments();
  const users = await User.find()
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return { users, page: Number(page), totalPages: Math.ceil(total / limit) };
};

/**
 * Returns a single user by ID.
 * Throws 404 if not found.
 */
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return user;
};

/**
 * Deletes a user by ID. Admin only.
 * Throws 404 if not found.
 */
const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
};

/**
 * Updates a user's role. Admin only.
 * Throws 404 if not found, 400 for invalid role.
 */
const updateUserRole = async (id, role) => {
  const allowed = ["admin", "instructor", "student"];
  if (!allowed.includes(role)) {
    const err = new Error("Invalid role");
    err.status = 400;
    throw err;
  }
  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return user;
};

/**
 * Updates a user's profile (name, bio). Users can only update themselves.
 */
const updateProfile = async (id, updates, requestingUser) => {
  if (id !== requestingUser.id && requestingUser.role !== "admin") {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
  const allowed = { name: updates.name, bio: updates.bio };
  const user = await User.findByIdAndUpdate(id, allowed, { new: true });
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return user;
};

/**
 * Updates a user's password after verifying the current one.
 */
const updatePassword = async (
  id,
  { currentPassword, newPassword },
  requestingUser,
) => {
  if (id !== requestingUser.id) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
  const user = await User.findById(id);
  if (!user || !(await user.comparePassword(currentPassword))) {
    const err = new Error("Current password is incorrect");
    err.status = 400;
    throw err;
  }
  await user.setPassword(newPassword);
  await user.save();
};

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserRole,
  updateProfile,
  updatePassword,
};
