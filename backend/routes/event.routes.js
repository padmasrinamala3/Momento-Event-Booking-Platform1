const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth.middleware");

// Booked dates (can be stored in DB later)
let bookedDates = ["2026-04-03","2026-04-08","2026-04-14","2026-04-19","2026-04-22","2026-04-27"];

// GET /api/events/booked-dates
router.get("/booked-dates", (req, res) => {
  res.json({ bookedDates });
});

// POST /api/events/booked-dates — admin add booked date
router.post("/booked-dates", protect, adminOnly, (req, res) => {
  const { date } = req.body;
  if (!bookedDates.includes(date)) bookedDates.push(date);
  res.json({ bookedDates });
});

module.exports = router;