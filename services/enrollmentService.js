const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

/**
 * Enrolls a student in a course.
 * Throws 404 if the course doesn't exist.
 * Throws 409 if already enrolled (duplicate key from unique index).
 */
const enroll = async (studentId, courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    const err = new Error("Course not found");
    err.status = 404;
    throw err;
  }

  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
  });
  return enrollment;
};

/**
 * Returns all courses a student is currently enrolled in.
 */
const getMyCourses = async (studentId) => {
  const enrollments = await Enrollment.find({ student: studentId }).populate({
    path: "course",
    populate: { path: "instructor", select: "name email avatar" },
  });
  return enrollments.map((e) => ({
    ...e.course.toObject(),
    progress: e.progress,
  }));
};

/**
 * Updates the progress percentage for a student's enrollment.
 * Throws 404 if the enrollment doesn't exist.
 */
const updateProgress = async (studentId, courseId, progress) => {
  const enrollment = await Enrollment.findOneAndUpdate(
    { student: studentId, course: courseId },
    { progress },
    { new: true },
  );
  if (!enrollment) {
    const err = new Error("Enrollment not found");
    err.status = 404;
    throw err;
  }
  return enrollment;
};

module.exports = { enroll, getMyCourses, updateProgress };
