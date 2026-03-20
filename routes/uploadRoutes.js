const express = require("express");
const multer = require("multer");
const uploadToCloudinary = require("../utils/cloudinary");
const { verifyToken } = require("../middleware/auth");
const { UPLOAD } = require("../constants");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD.MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith(UPLOAD.ALLOWED_MIME_PREFIX))
      return cb(new Error("Only image files are allowed"));
    cb(null, true);
  },
});

/** POST /api/upload/avatar */
router.post(
  "/avatar",
  verifyToken,
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file provided" });
      const url = await uploadToCloudinary(
        req.file.buffer,
        UPLOAD.FOLDERS.AVATARS,
        req.file.mimetype,
      );
      res.json({ url });
    } catch (err) {
      console.error("Avatar upload error:", err.message);
      next(err);
    }
  },
);

/** POST /api/upload/thumbnail */
router.post(
  "/thumbnail",
  verifyToken,
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file provided" });
      const url = await uploadToCloudinary(
        req.file.buffer,
        UPLOAD.FOLDERS.THUMBNAILS,
        req.file.mimetype,
      );
      res.json({ url });
    } catch (err) {
      console.error("Thumbnail upload error:", err.message);
      next(err);
    }
  },
);

module.exports = router;
