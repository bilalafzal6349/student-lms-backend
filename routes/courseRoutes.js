const express = require("express");
const { body } = require("express-validator");
const courseController = require("../controllers/courseController");
const reviewController = require("../controllers/reviewController");
const { verifyToken, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

// Public routes
router.get("/", courseController.getCourses);
router.get(
  "/my",
  verifyToken,
  authorize("instructor", "admin"),
  courseController.getInstructorCourses,
);
router.get(
  "/analytics",
  verifyToken,
  authorize("admin"),
  courseController.getAnalytics,
);
router.get("/:id", courseController.getCourseById);
router.get("/:id/reviews", reviewController.getCourseReviews);

// Instructor-only routes
router.post(
  "/",
  verifyToken,
  authorize("instructor", "admin"),
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("price").optional().isNumeric().withMessage("Price must be a number"),
  ],
  validate,
  courseController.createCourse,
);

router.put(
  "/:id",
  verifyToken,
  authorize("instructor", "admin"),
  courseController.updateCourse,
);
router.delete(
  "/:id",
  verifyToken,
  authorize("instructor", "admin"),
  courseController.deleteCourse,
);

// Student review routes
router.post(
  "/:id/reviews",
  verifyToken,
  authorize("student"),
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
  ],
  validate,
  reviewController.createReview,
);

module.exports = router;
