const mongoose = require("mongoose");

/**
 * Review schema. A student can leave one review per course.
 * After save/remove, the course's averageRating should be recomputed
 * via ReviewService.recalculateRating().
 */
const ReviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true },
);

// One review per student per course
ReviewSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
