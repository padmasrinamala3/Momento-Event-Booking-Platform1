const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// CREATE BOOKING
router.post("/", async (req, res) => {
  try {
    const { date, shift, id } = req.body;

    // Check if shift already booked for this date
    if (date && shift) {
      const existing = await Booking.findOne({ date, shift, status: { $ne: "cancelled" } });
      if (existing) {
        return res.status(400).json({ message: `The ${shift} shift for ${date} is already booked.` });
      }
    }

    const bookingData = { ...req.body };
    if (id && !bookingData.bookingId) bookingData.bookingId = id; // Ensure bookingId is saved

    const booking = await Booking.create(bookingData);
    res.status(201).json(booking);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👇 THIS ADD CHEYYI (delete cheyyakunda)
router.get("/test-create", async (req, res) => {
  try {
    const booking = await Booking.create({
      eventName: "Test Event",
      date: "2026-03-18"
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL BOOKINGS
router.get("/", async (req, res) => {
  try {

    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.json(bookings);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE BOOKING STATUS by bookingId
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const mongoose = require("mongoose");

    console.log("📝 Updating booking:", id, "to status:", status);

    // Try to find by bookingId first, then by _id
    let updatedBooking = await Booking.findOneAndUpdate(
      { bookingId: id },
      { status },
      { new: true }
    );

    // If not found by bookingId, try _id
    if (!updatedBooking && mongoose.Types.ObjectId.isValid(id)) {
      updatedBooking = await Booking.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
    }

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log("✅ Booking updated:", updatedBooking);
    res.json(updatedBooking);

  } catch (err) {
    console.error("❌ Error updating booking:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE BOOKING by bookingId or _id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require("mongoose");
    console.log("🗑 Deleting booking:", id);

    // Try deleting by bookingId first
    let result = await Booking.findOneAndDelete({ bookingId: id });

    // If not found by bookingId, try _id
    if (!result && mongoose.Types.ObjectId.isValid(id)) {
      result = await Booking.findByIdAndDelete(id);
    }

    if (!result) {
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log("✅ Booking deleted successfully");
    res.json({ message: "Booking deleted successfully", id });

  } catch (err) {
    console.error("❌ Error deleting booking:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;