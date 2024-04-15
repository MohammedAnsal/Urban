//  Import Product Model :-
const Product = require('../models/product_model');

//  Import Order Model :-
const Order = require('../models/order_model');

//  Import User Model :-
const User = require('../models/user_model');

//  Import Category Modal :-
const Category = require("../models/category_model");

//  loadDahboard (Get Method) :-

const loadDahboard = async (req, res) => {
    
    try {

        const order = await Order.find();   //  Order

        const totalOrdAmount = order.reduce((acc, val) => acc + val.orderAmount, 0);    //  TotalAmount

        const totalProduct = await Product.find()   //  Product

        //  Best Selling Products :-

        const bestSellPro = await Order.aggregate([
        
            {
                $unwind: "$products",
            },

            {
                $group: {

                    _id: "$products.productId",
                    ttlCount: { $sum: "$products.quantity" },
                    
                },
            },

            {
                $lookup: {

                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productData",
                },
            },

            {
                $sort: { ttlCount: -1 },
            },

            {
                $limit: 5,
            },

        ]);

        res.render('dashbord', { order, totalOrdAmount, totalProduct, bestSellPro });
        
    } catch (error) {

        console.log(error.message);
        
    }

};

module.exports = {

    loadDahboard,

};
