const Review = require("../models/Review");
const Course = require("../models/Course");
const { ROLES, HTTP, PAGINATION } = require("../constants");

/**
 * Recomputes and persists the average rating for a course.
 * Called after any review is created or deleted.
 */
const recalculateRating = async (courseId) => {
  const result = await Review.aggregate([
    { $match: { course: courseId } },
    { $group: { _id: "$course", avg: { $avg: "$rating" } } },
  ]);
  const avg = result.length ? parseFloat(result[0].avg.toFixed(2)) : 0;
  await Course.findByIdAndUpdate(courseId, { averageRating: avg });
};

/**
 * Returns paginated reviews for a course.
 */
const getCourseReviews = async (
  courseId,
  { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT },
) => {
  const total = await Review.countDocuments({ course: courseId });
  const reviews = await Review.find({ course: courseId })
    .populate("student", "name avatar")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return { reviews, page: Number(page), totalPages: Math.ceil(total / limit) };
};

/**
 * Creates a review and triggers rating recalculation.
 * Throws 409 if the student already reviewed this course.
 */
const createReview = async ({ studentId, courseId, rating, comment }) => {
  const review = await Review.create({
    student: studentId,
    course: courseId,
    rating,
    comment,
  });
  await recalculateRating(review.course);
  return review;
};

/**
 * Deletes a review. Only the author or an admin may delete.
 * Throws 403 on ownership failure, 404 if not found.
 */
const deleteReview = async (reviewId, requestingUser) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const err = new Error("Review not found");
    err.status = HTTP.NOT_FOUND;
    throw err;
  }

  const isAuthor = review.student.toString() === requestingUser.id;
  if (!isAuthor && requestingUser.role !== ROLES.ADMIN) {
    const err = new Error("Forbidden: you cannot delete this review");
    err.status = HTTP.FORBIDDEN;
    throw err;
  }

  const courseId = review.course;
  await review.deleteOne();
  await recalculateRating(courseId);
};

module.exports = { getCourseReviews, createReview, deleteReview };
