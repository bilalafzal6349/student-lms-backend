const courseService = require("../services/courseService");

/** GET /api/courses */
const getCourses = async (req, res, next) => {
  try {
    const { page, limit, category, search, minPrice, maxPrice } = req.query;
    const result = await courseService.getCourses({
      page,
      limit,
      category,
      search,
      minPrice,
      maxPrice,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/** GET /api/courses/:id */
const getCourseById = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    res.json({ course });
  } catch (err) {
    next(err);
  }
};

/** POST /api/courses */
const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, price, thumbnail } = req.body;
    const course = await courseService.createCourse({
      title,
      description,
      category,
      price,
      thumbnail,
      instructorId: req.user.id,
    });
    res.status(201).json({ course });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/courses/:id */
const updateCourse = async (req, res, next) => {
  try {
    const { title, description, category, price, thumbnail } = req.body;
    const course = await courseService.updateCourse(
      req.params.id,
      { title, description, category, price, thumbnail },
      req.user,
    );
    res.json({ course });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/courses/:id */
const deleteCourse = async (req, res, next) => {
  try {
    await courseService.deleteCourse(req.params.id, req.user);
    res.json({ message: "Course deleted" });
  } catch (err) {
    next(err);
  }
};

/** GET /api/courses/my — instructor's own courses */
const getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getInstructorCourses(req.user.id);
    res.json({ courses });
  } catch (err) {
    next(err);
  }
};

/** GET /api/courses/analytics — admin only */
const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await courseService.getAnalytics();
    res.json(analytics);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  getAnalytics,
};
