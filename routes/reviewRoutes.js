const express = require("express");
const reviewController = require("../controllers/reviewController");
const { verifyToken, authorize } = require("../middleware/auth");

const router = express.Router();

// Author or admin can delete a review
router.delete(
  "/:id",
  verifyToken,
  authorize("student", "admin"),
  reviewController.deleteReview,
);

module.exports = router;
