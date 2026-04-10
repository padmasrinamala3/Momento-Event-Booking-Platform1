const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    const user = await User.create({ name, email, phone, password });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      phone: user.phone, role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Account not found. Please register first." });
    }
    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Incorrect password." });
    }
    res.json({
      _id: user._id, name: user.name, email: user.email,
      phone: user.phone, role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/google-callback
router.post("/google-callback", async (req, res) => {
  try {
    const { name, email } = req.body;
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create a random password for Google users as it's required by the schema
      const randomPass = Math.random().toString(36).slice(-10);
      user = await User.create({ name, email, phone: "Google Auth", password: randomPass });
    }
    
    res.json({
      _id: user._id, name: user.name, email: user.email,
      phone: user.phone, role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/forgot-password (Simulated)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found in our records" });
    
    // In a real application, you would generate a reset token and send an email here.
    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;