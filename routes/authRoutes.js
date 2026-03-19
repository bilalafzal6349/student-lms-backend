const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const { validate } = require("../middleware/validate");

const router = express.Router();

// Strict rate limit on auth endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { error: "Too many requests, please try again later" },
});

router.post(
  "/register",
  authLimiter,
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  authController.register,
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  authController.login,
);

router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

router.post(
  "/password-reset",
  authLimiter,
  [body("email").isEmail().withMessage("Valid email is required")],
  validate,
  authController.requestPasswordReset,
);

router.post(
  "/password-reset/confirm",
  [
    body("email").isEmail(),
    body("otp").notEmpty().withMessage("OTP is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  authController.confirmPasswordReset,
);

module.exports = router;
