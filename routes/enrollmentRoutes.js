const express = require("express");
const { body } = require("express-validator");
const enrollmentController = require("../controllers/enrollmentController");
const { verifyToken, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/enroll",
  verifyToken,
  authorize("student"),
  [body("courseId").notEmpty().withMessage("courseId is required")],
  validate,
  enrollmentController.enroll,
);

router.get(
  "/my-courses",
  verifyToken,
  authorize("student"),
  enrollmentController.getMyCourses,
);

router.patch(
  "/enroll/progress",
  verifyToken,
  authorize("student"),
  [
    body("courseId").notEmpty(),
    body("progress")
      .isInt({ min: 0, max: 100 })
      .withMessage("Progress must be 0–100"),
  ],
  validate,
  enrollmentController.updateProgress,
);

module.exports = router;
