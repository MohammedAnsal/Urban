//  Import Product Model :-
const Product = require('../models/product_model');

//  Import Order Model :-
const Order = require('../models/order_model');

//  Import User Model :-
const User = require('../models/user_model');

//  loadDahboard (Get Method) :-

const loadDahboard = async (req, res) => {
    
    try {

        const order = await Order.find();   //  Order

        const totalOrdAmount = order.reduce((acc, val) => acc + val.orderAmount, 0);    //  TotalAmount

        const totalProduct = await Product.find()   //  Product

        const users = await User.find();

        res.render('dashbord', { order, totalOrdAmount, totalProduct , users});
        
    } catch (error) {

        console.log(error.message);
        
    }

};

module.exports = {

    loadDahboard,

};
