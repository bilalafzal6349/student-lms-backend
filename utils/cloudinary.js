const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary using base64 encoding.
 * More reliable than stream approach across Node versions.
 * @param {Buffer} buffer   - file buffer from multer memoryStorage
 * @param {string} folder   - cloudinary folder: "avatars" | "thumbnails"
 * @param {string} mimetype - file mimetype e.g. "image/jpeg"
 * @returns {Promise<string>} secure_url
 */
const uploadToCloudinary = async (buffer, folder, mimetype) => {
  const base64 = buffer.toString("base64");
  const dataUri = `data:${mimetype};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });

  return result.secure_url;
};

module.exports = uploadToCloudinary;
