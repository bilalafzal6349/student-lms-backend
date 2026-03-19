const mongoose = require("mongoose");

/**
 * Lesson schema. Each lesson belongs to one course.
 * `order` determines the sequential display position within a course.
 */
const LessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" }, // markdown or plain text
    videoUrl: { type: String, default: "" },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Lesson", LessonSchema);
