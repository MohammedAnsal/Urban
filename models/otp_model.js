const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({

    userId: String,
    otp: String,
    createdAt: Date,
    expiresAt: Date,
    
});

module.exports = mongoose.model('Otp',otpSchema)