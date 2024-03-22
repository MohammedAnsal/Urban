const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'userData', required: true },
    
    addresss: [{
        
        name: { type: String, required: true },
        phone: { type: Number, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: Number, required: true },
        address: { type: String, required: true },
        locality: { type: String, required: true },
        status : {type : Boolean , required : true , default : false},

    }],

});

module.exports = mongoose.model('address', addressSchema);