const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");
const { ROLES, HTTP } = require("../constants");

/**
 * Registers a new user. Defaults role to 'student'.
 * Throws if the email is already taken.
 */
const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email already registered");
    err.status = HTTP.CONFLICT;
    throw err;
  }

  const user = new User({ name, email, role: role || ROLES.STUDENT });
  await user.setPassword(password);
  await user.save();
  return user;
};

/**
 * Validates credentials and returns access + refresh tokens.
 * Throws 401 on invalid credentials.
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error("Invalid email or password");
    err.status = HTTP.UNAUTHORIZED;
    throw err;
  }

  const payload = { id: user._id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: user._id });
  return { accessToken, refreshToken, user };
};

/**
 * Resets the user's password directly given a valid email.
 * Throws 404 if the email is not registered.
 */
const resetPassword = async ({ email, newPassword }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("No account found with that email");
    err.status = HTTP.NOT_FOUND;
    throw err;
  }

  await user.setPassword(newPassword);
  await user.save();
};

module.exports = {
  register,
  login,
  resetPassword,
};
