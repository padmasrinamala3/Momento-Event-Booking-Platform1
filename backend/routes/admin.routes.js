const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const { protect, adminOnly } = require("../middleware/auth.middleware");

// GET /api/admin/analytics
router.get("/analytics", protect, adminOnly, async (req, res) => {
  try {
    const totalUsers    = await User.countDocuments({ role: "user" });
    const totalBookings = await Booking.countDocuments();
    const totalRevenue  = await Booking.aggregate([{ $group: { _id: null, total: { $sum: "$price" } } }]);
    const totalReviews  = await Review.countDocuments();
    const recentBookings = await Booking.find().populate("user","name email").sort({ createdAt: -1 }).limit(5);

    res.json({
      totalUsers,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalReviews,
      recentBookings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;