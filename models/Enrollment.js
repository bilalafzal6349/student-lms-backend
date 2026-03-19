const mongoose = require("mongoose");

/**
 * Enrollment schema. Tracks which student is enrolled in which course.
 * Compound unique index prevents duplicate enrollments.
 * `progress` is a percentage (0–100).
 */
const EnrollmentSchema = new mongoose.Schema(
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
    progress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true },
);

// Prevent a student from enrolling in the same course twice
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", EnrollmentSchema);
