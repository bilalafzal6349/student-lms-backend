const express = require("express");
const userController = require("../controllers/userController");
const { verifyToken, authorize } = require("../middleware/auth");

const router = express.Router();

// All user management routes require authentication
router.use(verifyToken);

router.get("/", authorize("admin"), userController.getAllUsers);
router.get(
  "/:id",
  authorize("admin", "instructor", "student"),
  userController.getUserById,
);
router.put("/:id", userController.updateProfile);
router.put("/:id/password", userController.updatePassword);
router.patch("/:id/role", authorize("admin"), userController.updateUserRole);
router.delete("/:id", authorize("admin"), userController.deleteUser);

module.exports = router;
