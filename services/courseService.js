const Course = require("../models/Course");

/**
 * Returns a paginated, optionally filtered list of courses.
 * Supports filtering by category, text search, and price range.
 */
const getCourses = async ({
  page = 1,
  limit = 10,
  category,
  search,
  minPrice,
  maxPrice,
}) => {
  const query = {};

  if (category) query.category = category;
  if (search) query.$text = { $search: search };
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }

  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate("instructor", "name email avatar")
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return {
    courses,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    total,
  };
};

/**
 * Returns a single course with its lessons and instructor populated.
 * Throws 404 if not found.
 */
const getCourseById = async (id) => {
  const course = await Course.findById(id)
    .populate("instructor", "name email avatar bio")
    .populate("lessons");
  if (!course) {
    const err = new Error("Course not found");
    err.status = 404;
    throw err;
  }
  return course;
};

/**
 * Creates a new course owned by the given instructorId.
 */
const createCourse = async ({
  title,
  description,
  category,
  price,
  thumbnail,
  instructorId,
}) => {
  const course = await Course.create({
    title,
    description,
    category,
    price,
    thumbnail,
    instructor: instructorId,
  });
  return course;
};

/**
 * Updates a course. Ensures the requesting user owns it (unless admin).
 * Throws 403 if ownership check fails, 404 if not found.
 */
const updateCourse = async (id, updates, requestingUser) => {
  const course = await Course.findById(id);
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

  Object.assign(course, updates);
  await course.save();
  return course;
};

/**
 * Deletes a course. Enforces ownership unless requester is admin.
 */
const deleteCourse = async (id, requestingUser) => {
  const course = await Course.findById(id);
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

  await course.deleteOne();
};

/**
 * Returns all courses owned by a specific instructor.
 */
const getInstructorCourses = async (instructorId) => {
  return Course.find({ instructor: instructorId })
    .populate("instructor", "name email avatar")
    .sort({ createdAt: -1 });
};

/**
 * Returns platform-wide analytics for the admin dashboard.
 * Aggregates total users by role, total courses, total enrollments,
 * and the top 5 most-enrolled courses.
 */
const getAnalytics = async () => {
  const User = require("../models/User");
  const Enrollment = require("../models/Enrollment");

  const [totalUsers, totalCourses, totalEnrollments, usersByRole, topCourses] =
    await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Enrollment.aggregate([
        { $group: { _id: "$course", enrollments: { $sum: 1 } } },
        { $sort: { enrollments: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "courses",
            localField: "_id",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: "$course" },
        {
          $project: {
            _id: 0,
            title: "$course.title",
            category: "$course.category",
            enrollments: 1,
          },
        },
      ]),
    ]);

  const roleMap = usersByRole.reduce((acc, r) => {
    acc[r._id] = r.count;
    return acc;
  }, {});

  return {
    totalUsers,
    totalCourses,
    totalEnrollments,
    students: roleMap.student || 0,
    instructors: roleMap.instructor || 0,
    admins: roleMap.admin || 0,
    topCourses,
  };
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
