const express = require("express");
const { body } = require("express-validator");
const lessonController = require("../controllers/lessonController");
const { verifyToken, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorize("instructor", "admin"),
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("courseId").notEmpty().withMessage("courseId is required"),
  ],
  validate,
  lessonController.createLesson,
);

router.put(
  "/:id",
  verifyToken,
  authorize("instructor", "admin"),
  lessonController.updateLesson,
);
router.delete(
  "/:id",
  verifyToken,
  authorize("instructor", "admin"),
  lessonController.deleteLesson,
);

module.exports = router;
