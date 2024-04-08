const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
 
    userId: {
             
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userData',
        required: true

    },

    products: [{
        
        productId: {
           
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'

        }

    }]

});

module.exports = mongoose.model('wishlist', wishlistSchema);