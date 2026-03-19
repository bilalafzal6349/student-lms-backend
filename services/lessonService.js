const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

/**
 * Creates a lesson and appends it to the parent course's lessons array.
 * Throws 404 if the course doesn't exist.
 * Throws 403 if the requester doesn't own the course.
 */
const createLesson = async (
  { title, content, videoUrl, courseId, order },
  requestingUser,
) => {
  const course = await Course.findById(courseId);
  if (!course) {
    const err = new Error("Course not found");
    err.status = 404;
    throw err;
  }

  const isOwner = course.instructor.toString() === requestingUser.id;
  if (!isOwner && requestingUser.role !== "admin") {
    const err = new Error("Forbidden: you do not own this course");
    err.status = 403;
    throw err;
  }

  const lesson = await Lesson.create({
    title,
    content,
    videoUrl,
    course: courseId,
    order,
  });
  course.lessons.push(lesson._id);
  await course.save();
  return lesson;
};

/**
 * Updates a lesson. Verifies ownership via the parent course.
 */
const updateLesson = async (id, updates, requestingUser) => {
  const lesson = await Lesson.findById(id).populate("course");
  if (!lesson) {
    const err = new Error("Lesson not found");
    err.status = 404;
    throw err;
  }

  const isOwner = lesson.course.instructor.toString() === requestingUser.id;
  if (!isOwner && requestingUser.role !== "admin") {
    const err = new Error("Forbidden: you do not own this lesson");
    err.status = 403;
    throw err;
  }

  Object.assign(lesson, updates);
  await lesson.save();
  return lesson;
};

/**
 * Deletes a lesson and removes its reference from the parent course.
 */
const deleteLesson = async (id, requestingUser) => {
  const lesson = await Lesson.findById(id).populate("course");
  if (!lesson) {
    const err = new Error("Lesson not found");
    err.status = 404;
    throw err;
  }

  const isOwner = lesson.course.instructor.toString() === requestingUser.id;
  if (!isOwner && requestingUser.role !== "admin") {
    const err = new Error("Forbidden: you do not own this lesson");
    err.status = 403;
    throw err;
  }

  await Course.findByIdAndUpdate(lesson.course._id, {
    $pull: { lessons: lesson._id },
  });
  await lesson.deleteOne();
};

module.exports = { createLesson, updateLesson, deleteLesson };
