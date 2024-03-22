const mongoose = require("mongoose");

const Order = mongoose.Schema({

    userId: {
      
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userData',
        required: true,
    
    },

    orderAmount: {
      
        type: Number,
        required: true,
    
    },

    payment: {
      
        type: String,
        required: true,
    
    },

    orderDate: {
      
        type: Date,
        required: true,
        default: Date.now,
    
    },

    orderStatus: {
        
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'canceled'],
        default: 'pending'
    },

    deliveryAddress: {
      
        name: { type: String, required: true },
        phone: { type: Number, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: Number, required: true },
        address: { type: String, required: true },
        locality: { type: String, required: true },
    
    },

    products: [{
        
        productId: {
          
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true
        
        },

        quantity: {
        
            type: Number,
            default: 1,
            required: true
        
        },
      
        price: {
                
            type: Number,
            required: true,
            
        },
          
        orderProStatus: {
                
            type: String,
            required: true,
            enum: ['pending', 'shipped', 'delivered', 'canceled'],
            default: 'pending',

        }
    }],

});

module.exports = mongoose.model("order", Order);