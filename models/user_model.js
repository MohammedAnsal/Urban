const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    fullName: {

        type: String,
        required:true
    },

    email: {
        
        type: String,
        required :true

    },

    phone: {
        
        type: String,
        required:true

    },

    password: {
        
        type: String,
        required:true

    },

    is_verified: {
        
        type: Boolean,
        default:false

    },

    is_admin: {
        
        type: Boolean,
        required: true
        
    },

    datejoined: {
        
        type: Date,
        default:Date.now

    }

});

module.exports = mongoose.model("userData", userSchema);