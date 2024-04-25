const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

    products: [{
        
        productId: {
            
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'

        },

        name: {
            
            type: String,
            required: true

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
        required: true,
        default: 0

    },

    percentage: {
        
        type: Number,
        required: true,
        default: 0
        

    }

});

module.exports = mongoose.model('cart', cartSchema);