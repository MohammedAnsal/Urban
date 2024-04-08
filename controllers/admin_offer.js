const Product = require("../models/product_model");

//  Import Category Modal :-
const Category = require("../models/category_model");

//  Import Order Modal :-
const Order = require("../models/order_model");

//  Import Offer Model :-
const Offer = require('../models/offer_model');


//  loadOffer (Get Method) :-

const loadOffer = async (req, res) => {
    
    try {

        const category = await Category.find({ is_Listed: true });

        const product = await Product.find({ discount: { $gt: 0 } });

        res.render('offer' , {category , product});
        
    } catch (error) {

        console.log(error.message);
        
    }

};

module.exports = {

    loadOffer,

}