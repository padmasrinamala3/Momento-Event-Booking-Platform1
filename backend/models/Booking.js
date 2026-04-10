const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true }, // Custom booking ID like BK227594
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name:     { type: String, required: true },
  phone:    { type: String, required: true },
  event:    { type: String, required: true },
  date:     { type: String, required: true },
  venue:    { type: String },
  address:  { type: String },
  guests:   { type: String },
  services: { type: String },
  theme:    { type: String },
  themeNumber: { type: String },
  special:  { type: String },
  price:    { type: Number, required: true },
  advancePaid: { type: Number, default: 0 },
  remainingBalance: { type: Number, default: 0 },
  payMode:  { type: String, default: "Full Payment" },
  status:   { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
  shift:    { type: String, enum: ["morning", "night"], default: "night" },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);