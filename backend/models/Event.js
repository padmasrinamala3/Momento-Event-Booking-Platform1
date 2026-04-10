const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name:   { type: String, required: true, unique: true },
  tag:    { type: String, required: true },
  img:    { type: String, default: "https://i.pinimg.com/736x/e4/2b/55/e42b5578b225b29e8b65010a975a2d1e.jpg" },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
