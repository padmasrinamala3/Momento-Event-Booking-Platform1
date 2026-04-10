const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
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
app.get("/api/health", (req, res) => res.status(200).json({ status: "UP", timestamp: new Date() }));

// ── SERVE FRONTEND BUILD ──
// Assuming build folder is at the root level (../build from backend folder)
const buildPath = path.join(__dirname, "../build");
app.use(express.static(buildPath));

// Catch-all route for any request that doesn't match the API routes
// This allows React Router to handle page refreshing etc.
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ message: "API route not found" });
  res.sendFile(path.join(buildPath, "index.html"));
});

// ── CONNECT DB + START SERVER ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected!");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));