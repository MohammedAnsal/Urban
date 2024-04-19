const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

    products: [{
        
        productId: {
            
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'

        },

        quantity: {
            
            type: Number,
            default: 1

        },

        price: {
             
            type: Number,
            required: true

        },

    }],

    totalCartPrice: {
            
        type: Number,
        required: true

    },
    
    userId: {
        
        type: String,
        required: true
    
    },

    coupenDiscount: {
        
        type: Number,
        required: true

    },

});

module.exports = mongoose.model('cart', cartSchema);