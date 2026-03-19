const reviewService = require("../services/reviewService");

/** GET /api/courses/:id/reviews */
const getCourseReviews = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await reviewService.getCourseReviews(req.params.id, {
      page,
      limit,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/** POST /api/courses/:id/reviews */
const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const review = await reviewService.createReview({
      studentId: req.user.id,
      courseId: req.params.id,
      rating,
      comment,
    });
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/reviews/:id */
const deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.params.id, req.user);
    res.json({ message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCourseReviews, createReview, deleteReview };
