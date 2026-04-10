const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/auth.middleware");

// Store in memory, then upload to cloudinary (optional)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// POST /api/upload
router.post("/", protect, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
});

module.exports = router;