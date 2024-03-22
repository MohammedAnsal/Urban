//  Import Address Modal :-
const Address = require("../models/address_model");

//  Import User Modal :-
const User = require("../models/user_model");

//  Import Product Modal :-
const Product = require("../models/product_model");

//  Import Category Modal :-
const Category = require("../models/category_model");

//  Import Order Modal :-
const Order = require('../models/order_model');

//  Import Cart Modal :-
const Cart = require('../models/cart_model');

//  loadOrder (Get Method) :-

const loadOrder = async (req, res) => {
    
    try {

        const categoryData = await Category.find({ is_Listed: true });
        
        if (req.session.user) {

            const addressDataa = await Address.findOne({ userId: req.session.user._id });     //  Passing Address Data into Ejs Page

            const orderData = await Order.find({ userId: req.session.user._id }).populate('products.productId');
           
            res.render('orders', { login: req.session.user, categoryData, address: addressDataa, orderData});

        } else {
 
            console.log("Byeee");
 
        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  OrderDetails (Get Method) :-

const orderView = async (req, res) => {
      
    try {
        
        const categoryData = await Category.find({ is_Listed: true });

        const order = await Order.findOne({ _id: req.query.id }).populate('products.productId');

        res.render('orderDetails', { login: req.session.user, order, categoryData });
        
    } catch (err) {
        
        console.log(err.message + '      ORDER VIEW PAGE RENDERING ')
        
    }
    
};

//  Order Kitty (Post Method) :-

const orderKitty = async (req, res) => {
    
    try {

        const userIdd = req.session.user._id

        const cartt = await Cart.findOne({ userId: userIdd });

        const addresss = await Address.findOne({ userId: userIdd, 'addresss.status': true }, { 'addresss.$': 1 });

        const product = cartt.products;

        const { name, phone, address, pincode, locality, state, city } = addresss?.addresss?.[0] ?? {};

        const orderGot = await Order.create({

            userId: userIdd,
            products: product,
            
            deliveryAddress: {
                
                name: name,
                phone: phone,
                address: address,
                locality: locality,
                city: city,
                state: state,
                pincode: pincode

            },

            orderDate: Date.now(),
            orderAmount: cartt.totalCartPrice,
            payment: 'Cash on Delivery',
            // orderStatus: 'Pending',

        });

        //  Quantity Managing :-

        if (orderGot) {

            orderGot.products.forEach(async (e) => {

                let productt = await Product.findOne({ _id: e.productId });

                let newStock = productt.stock - e.quantity;

                await Product.findOneAndUpdate({ _id: e.productId }, { $set: { stock: newStock } });

            });

            //  Update Cart :-

            const cartRemove = await Cart.updateOne({ userId: userIdd }, { $unset: { products: 1 }, $set: { totalCartPrice: 0 } });
            
            if (cartRemove) {

                res.redirect("/thanks");

            } else {
                
                console.log("poyi");

            }
            
        };
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  Load Thanks Page (Get Method) :-

const loadThanks = async (req, res) => {
    
    try {

        if (req.session.user) {
            
            const categoryData = await Category.find({ is_Listed: true });
            res.render("thanksPage", { login: req.session.user, categoryData });

        } else {

            console.log("byee");

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

module.exports = {

    loadOrder,
    orderKitty,
    loadThanks,
    orderView,

};