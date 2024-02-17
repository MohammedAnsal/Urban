const mongoose = require('mongoose');

const userOtpVerificationSchema = mongoose.Schema({

    email: {
      
        type: String,
    },
    
    otp: {
      
        type: String,
    },
    
    createdAt: {
      
        type: Date,
        default: Date.now,
    },
    
});

userOtpVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

module.exports = mongoose.model("userOtpVerification", userOtpVerificationSchema);

// module.exports = UserOtpVerification;