const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/Booking");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 0. GET RAZORPAY KEY ID
router.get("/get-key", (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// 1. CREATE ORDER & PENDING BOOKING
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", bookingData } = req.body;
    
    // Create the booking in 'pending' status first
    const newBooking = await Booking.create({
      ...bookingData,
      bookingId: bookingData.id, // Map frontend 'id' to schema 'bookingId'
      status: "pending"
    });

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: `rcpt_${newBooking.bookingId || newBooking._id}`,
    };

    const order = await razorpay.orders.create(options);

    // Link Razorpay Order ID to our booking record
    newBooking.razorpayOrderId = order.id;
    await newBooking.save();

    res.json({
      ...order,
      localBookingId: newBooking.bookingId,
      mongoId: newBooking._id
    });
  } catch (err) {
    console.error("❌ Razorpay Order/Booking Error:", err);
    res.status(500).json({ 
      message: "Failed to initialize booking and payment",
      error: err.message 
    });
  }
});

// 2. VERIFY PAYMENT SIGNATURE
router.post("/verify-payment", async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingId // The custom BKxxxxxx ID
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthorized = expectedSignature === razorpay_signature;

    if (isAuthorized) {
      // Find and update booking by Razorpay Order ID to ensure strict linking
      const booking = await Booking.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { 
          status: "confirmed",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature
        },
        { new: true }
      );
      if (!booking) return res.status(404).json({ message: "Booking not found" });

      res.json({ 
        success: true, 
        message: "Payment verified & booking confirmed!",
        booking 
      });
    } else {
      res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
  } catch (err) {
    console.error("❌ Verification Error:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

// 3. WEBHOOK ENDPOINT (For automated verification even if user closes browser)
router.post("/webhook", async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "momento_webhook_secret";
    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (signature === digest) {
      const event = req.body.event;
      if (event === "payment.captured") {
        const orderId = req.body.payload.payment.entity.order_id;
        // Update booking based on order_id
        await Booking.findOneAndUpdate(
          { razorpayOrderId: orderId },
          { status: "confirmed" }
        );
      }
      res.json({ status: "ok" });
    } else {
      res.status(400).send("Invalid signature");
    }
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    res.status(500).send("Webhook process failed");
  }
});

// 4. CREATE PENDING BOOKING (Pre-payment)
router.post("/create-pending-booking", async (req, res) => {
  try {
    const { amount, bookingData } = req.body;
    
    // Create the booking in 'pending' status
    const newBooking = await Booking.create({
      ...bookingData,
      bookingId: bookingData.id, // Map frontend 'id' to schema 'bookingId'
      status: "pending",
      paymentMethod: "upi"
    });

    res.json({
      success: true,
      bookingId: newBooking.bookingId,
      mongoId: newBooking._id
    });
  } catch (err) {
    console.error("❌ Pending Booking Error:", err);
    res.status(500).json({ 
      message: "Failed to initialize booking",
      error: err.message 
    });
  }
});

// 5. SUBMIT UPI TRANSACTION ID (Manual Verification)
router.post("/submit-upi", async (req, res) => {
  try {
    const { bookingId, upiTransactionId } = req.body;
    
    if (!bookingId || !upiTransactionId) {
      return res.status(400).json({ message: "Booking ID and Transaction ID are required" });
    }

    // Try finding by custom bookingId (BKxxxxxx)
    const booking = await Booking.findOneAndUpdate(
      { bookingId: bookingId },
      { 
        upiTransactionId: upiTransactionId,
        paymentMethod: "upi",
        status: "pending"
      },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json({ 
      success: true, 
      message: "Transaction ID submitted. Verification in progress!",
      booking 
    });
  } catch (err) {
    console.error("❌ UPI Submission Error:", err);
    res.status(500).json({ message: "Failed to submit transaction ID" });
  }
});

module.exports = router;
