const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ── MIDDLEWARE ──
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── ROUTES ──
app.use("/api/auth",     require("./routes/auth.routes"));
app.use("/api/bookings", require("./routes/booking.routes"));
app.use("/api/reviews",  require("./routes/review.routes"));
app.use("/api/events",   require("./routes/event.routes"));
app.use("/api/admin",    require("./routes/admin.routes"));
app.use("/api/upload",   require("./routes/upload.routes"));

// ── TEST ROUTE ──
app.get("/", (req, res) => res.json({ message: "MomentO Backend Running! ✦" }));

// ── CONNECT DB + START SERVER ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected!");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));