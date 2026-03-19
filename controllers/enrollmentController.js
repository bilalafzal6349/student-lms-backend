const enrollmentService = require("../services/enrollmentService");

/** POST /api/enroll */
const enroll = async (req, res, next) => {
  try {
    await enrollmentService.enroll(req.user.id, req.body.courseId);
    res.json({ message: "Enrolled successfully" });
  } catch (err) {
    next(err);
  }
};

/** GET /api/my-courses */
const getMyCourses = async (req, res, next) => {
  try {
    const courses = await enrollmentService.getMyCourses(req.user.id);
    res.json({ courses });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/enroll/progress */
const updateProgress = async (req, res, next) => {
  try {
    const { courseId, progress } = req.body;
    const enrollment = await enrollmentService.updateProgress(
      req.user.id,
      courseId,
      progress,
    );
    res.json({ enrollment });
  } catch (err) {
    next(err);
  }
};

module.exports = { enroll, getMyCourses, updateProgress };
