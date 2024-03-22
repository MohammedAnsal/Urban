const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    name: { type: String, required: true },

    description: { type: String, required: true },

    price: { type: Number, min: 0, required: true },

    category: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'category' },
    
    brand: { type: String, required: true },
    
    createdAt: { type: Date },
    
    status: { type: Boolean, default: true },
    
    stock: { type: Number, default: 1 },

    images: { type: Array, required: true },

    discount_price: { type: Number, default: 0 },

    discount: { type: Number, default: 0 },
    
});

module.exports = mongoose.model("product", productSchema); 