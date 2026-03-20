const User = require("../models/User");
const { ROLES, HTTP, PAGINATION } = require("../constants");

/**
 * Returns a paginated list of all users. Admin only.
 */
const getAllUsers = async ({
  page = PAGINATION.DEFAULT_PAGE,
  limit = PAGINATION.DEFAULT_LIMIT,
}) => {
  const total = await User.countDocuments();
  const users = await User.find()
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return {
    users,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    total,
  };
};

/**
 * Returns a single user by ID.
 * Throws 404 if not found.
 */
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error("User not found");
    err.status = HTTP.NOT_FOUND;
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
    err.status = HTTP.NOT_FOUND;
    throw err;
  }
};

/**
 * Updates a user's role. Admin only.
 * Throws 400 for invalid role, 403 if admin tries to demote themselves, 404 if not found.
 */
const updateUserRole = async (id, role, requestingUser) => {
  if (requestingUser.id === id) {
    const err = new Error("You cannot change your own role");
    err.status = HTTP.FORBIDDEN;
    throw err;
  }

  const allowed = Object.values(ROLES);
  if (!allowed.includes(role)) {
    const err = new Error("Invalid role");
    err.status = HTTP.BAD_REQUEST;
    throw err;
  }
  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  if (!user) {
    const err = new Error("User not found");
    err.status = HTTP.NOT_FOUND;
    throw err;
  }
  return user;
};

/**
 * Updates a user's profile (name, bio, avatar). Users can only update themselves.
 */
const updateProfile = async (id, updates, requestingUser) => {
  if (id !== requestingUser.id && requestingUser.role !== ROLES.ADMIN) {
    const err = new Error("Forbidden");
    err.status = HTTP.FORBIDDEN;
    throw err;
  }
  const allowed = {
    name: updates.name,
    bio: updates.bio,
    avatar: updates.avatar,
  };
  // Strip undefined fields so partial updates don't overwrite with undefined
  Object.keys(allowed).forEach(
    (k) => allowed[k] === undefined && delete allowed[k],
  );

  const user = await User.findByIdAndUpdate(id, allowed, { new: true });
  if (!user) {
    const err = new Error("User not found");
    err.status = HTTP.NOT_FOUND;
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
    err.status = HTTP.FORBIDDEN;
    throw err;
  }
  const user = await User.findById(id);
  if (!user || !(await user.comparePassword(currentPassword))) {
    const err = new Error("Current password is incorrect");
    err.status = HTTP.BAD_REQUEST;
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
