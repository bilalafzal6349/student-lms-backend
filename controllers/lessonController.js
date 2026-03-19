const lessonService = require("../services/lessonService");

/** POST /api/lessons */
const createLesson = async (req, res, next) => {
  try {
    const { title, content, videoUrl, courseId, order } = req.body;
    const lesson = await lessonService.createLesson(
      { title, content, videoUrl, courseId, order },
      req.user,
    );
    res.status(201).json({ lesson });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/lessons/:id */
const updateLesson = async (req, res, next) => {
  try {
    const { title, content, videoUrl, order } = req.body;
    const lesson = await lessonService.updateLesson(
      req.params.id,
      { title, content, videoUrl, order },
      req.user,
    );
    res.json({ lesson });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/lessons/:id */
const deleteLesson = async (req, res, next) => {
  try {
    await lessonService.deleteLesson(req.params.id, req.user);
    res.json({ message: "Lesson deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createLesson, updateLesson, deleteLesson };
