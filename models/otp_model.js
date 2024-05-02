const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({

  otp: { type: String, required: true },
  token: { type: String, default: null },
  userEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  
});

const Otp = mongoose.model("Otp", OtpSchema);

module.exports = Otp;