const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({

    name: {
        
        type: String,
        required: true,
        unique: true,

    },
    
    is_Listed: {
        
        type: Boolean,
        required: true,
        default:true,

    },

});

module.exports = mongoose.model("category", categorySchema);