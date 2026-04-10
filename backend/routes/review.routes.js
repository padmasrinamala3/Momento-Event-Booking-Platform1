const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// GET /api/reviews — all reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews — add review
router.post("/", async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/reviews/:id — remove review
router.delete("/:id", async (req, res) => {
  console.log("🗑 Deleting review ID:", req.params.id);
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found in database" });
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;