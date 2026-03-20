const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authService = require("../services/authService");
const { generateAccessToken } = require("../utils/generateToken");

/** POST /api/auth/register */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    // Only student and instructor are self-registerable — admin must be assigned
    const safeRole = role === "instructor" ? "instructor" : "student";
    await authService.register({ name, email, password, role: safeRole });
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/login */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.login({
      email,
      password,
    });

    // Refresh token stored in HttpOnly cookie — never exposed to JS
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ token: accessToken, user });
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/refresh */
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token)
      return res.status(401).json({ error: "Refresh token required" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Look up current role from DB — refresh token only stores id
    const user = await User.findById(decoded.id).select("role");
    if (!user) return res.status(401).json({ error: "User not found" });

    const accessToken = generateAccessToken({
      id: decoded.id,
      role: user.role,
    });
    res.json({ token: accessToken });
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/logout */
const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};

/** POST /api/auth/password-reset */
const requestPasswordReset = async (req, res, next) => {
  try {
    await authService.requestPasswordReset(req.body.email);
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/password-reset/confirm */
const confirmPasswordReset = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    await authService.confirmPasswordReset({ email, otp, newPassword });
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  requestPasswordReset,
  confirmPasswordReset,
};
