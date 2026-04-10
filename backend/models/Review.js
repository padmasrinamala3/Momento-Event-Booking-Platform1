const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name:  { type: String, required: true },
  text:  { type: String, required: true },
  stars: { type: Number, min: 1, max: 5, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);