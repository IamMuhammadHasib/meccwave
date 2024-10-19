const multer = require("multer");
const path = require("path");
const { v2 } = require("cloudinary");
const fs = require("fs");

// Cloudinary configuration
v2.config({
  // cloud_name: process.env.CLOUDINARY_CLOUD,
  // api_key: process.env.CLOUDINARY_API_KEY,
  // api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: "dy6fbxnfe",
  api_key: "776469514868259",
  api_secret: "8n179VamrtTYbeLKQouwUA5rBo8",
});

// Configure Multer to handle form-data
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory temporarily
  limits: {
    fileSize: 1024 * 1024 * 5, // Limit file size to 5MB
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|mkv/; // Supported file types
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error("Error: File type not supported!")); // Handle unsupported file types
  },
}).single("media"); // Expecting a single file under the key 'media'

// Middleware to upload file to Cloudinary
const fileUploadMiddleware = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    try {
      // Upload file to Cloudinary
      const result = await v2.uploader.upload_stream(
        { resource_type: "auto" }, // Auto-detects whether it's an image or video
        (error, uploadResult) => {
          if (error) {
            return res.status(500).json({ message: error.message });
          }

          // Add the uploaded file info to req.body
          req.body.media = [
            {
              type: req.file.mimetype.startsWith("image") ? "image" : "video",
              url: uploadResult.secure_url, // Use Cloudinary's secure URL
            },
          ];

          console.log("Uploaded:", req.body);
          next(); // Proceed to the next middleware/controller
        }
      );

      // Write the file buffer to the stream
      result.end(req.file.buffer);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });
};

module.exports = fileUploadMiddleware;
