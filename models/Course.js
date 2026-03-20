const mongoose = require("mongoose");
const { COURSE_STATUS } = require("../constants");

/**
 * Course schema. Each course belongs to one instructor (User).
 * Lessons are referenced by ObjectId for lazy population.
 * averageRating is recomputed whenever a review is added/removed.
 * status controls admin approval workflow: pending → approved | rejected.
 */
const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, index: true },
    price: { type: Number, default: 0, min: 0 },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    thumbnail: { type: String, default: "" },
    status: {
      type: String,
      enum: Object.values(COURSE_STATUS),
      default: COURSE_STATUS.PENDING,
      index: true,
    },
  },
  { timestamps: true },
);

// Text index for full-text search on title and description
CourseSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Course", CourseSchema);
