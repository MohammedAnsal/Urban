//  Import Address Modal :-
const Address = require("../models/address_model");

//  Import User Modal :-
const User = require("../models/user_model");

//  Import Product Modal :-
const Product = require("../models/product_model");

//  Import Category Modal :-
const Category = require("../models/category_model");

//  Cart
const Cart = require('../models/cart_model');

//  Razorpay :-
const instance = require('../config/razorpay');

//  Import Wallet Modal :-
const Wallet = require('../models/wallet_model');

//  Import Coupen Model :-
const Coupen = require('../models/coupen_model');

//    Load Checkout (Get Method) :-

const loadCheckout = async (req, res , next) => {
    
    try {

        const categoryData = await Category.find({ is_Listed: true });

        
        if (req.session.user) {
            
            const msg = req.flash('flash');
            
            const userData = await User.findById({ _id: req.session.user._id });
            
            const addresData = await Address.findOne({ userId: req.session.user._id });
            
            const cartDataa = await Cart.findOne({ userId: req.session.user._id }).populate('products.productId');

            const walletData = await Wallet.findOne({ userId: req.session.user._id });
        
            if (cartDataa) {

                const coupenData = await Coupen.find({ status: true });
                                
                let newTprice = cartDataa.products.reduce((acc, val) => acc + val.price, 0);

                if (cartDataa.coupenDiscount >= 0) {
                    
                    newTprice -= cartDataa.coupenDiscount;

                }
                
                const cartData = await Cart.findOneAndUpdate({ userId: req.session.user._id }, { $set: { totalCartPrice: newTprice } }, { upsert: true, new: true });
                            
                res.render("checkout", { login: req.session.user, categoryData, addres: addresData, userData, msgg: msg, cartData, walletData, coupenData });
                
            } else {

                res.redirect('/login')

            }

        } else {

            res.redirect('/login')


        }

    } catch (error) {

        next(error,req,res);

        
    }

};

//  VerifyCartAddress (Post Method) :-

const verifyCheckOutAddress = async (req, res , next) => {

    try {
          
        const userId = req.query.id
                  
        const exist = await Address.findOne({ userId: userId, addresss: { $elemMatch: { address: req.body.addressData.address } } });

        if (!exist) {
            
            const verifyAddress = await Address.findOneAndUpdate(
            
              { userId: req.query.id },

              {
                  $addToSet: {
                    
                  addresss: {
                        
                        name: req.body.addressData.name,
                        city: req.body.addressData.city,
                        state: req.body.addressData.state,
                        pincode: req.body.addressData.pincode,
                        phone: req.body.addressData.phone,
                        locality: req.body.addressData.locality,
                        address: req.body.addressData.address,
                        status: true,
                    
                    },
                      
                  },
                  
                },
              
                { new: true, upsert: true }
              
            );
            
            if (verifyAddress) {
                
                res.send({success : true});

            } else {

                console.log("error aneeee");

            }
            
        } else {

            res.status(400).send({ exist: true });

        }
        
    } catch (error) {

        res.status(400);
        next(error,req,res);

        
    }

};

//  Delete Address (Post Method) :-

const deleteAdd = async (req, res , next) => {
    
    try {

        const userId = req.query.id
        const addId = req.query.addId

        const deleteAdd = await Address.updateOne({ userId: userId }, { $unset: { addresss: { _id: addId } } });

        if (deleteAdd) {
            
            res.send(true);

        }
        
    } catch (error) {

        next(error, req, res);
        
    }

}

//  Edit Address (Put Method) :-

const editAddress = async (req, res , next) => {
    
    try {

        const { edit } = req.body;
        const editData = await Address.findOne({ 'addresss._id': edit }, { 'addresss.$': 1 });
        
        res.json({ editData });
        
    } catch (error) {

        next(error,req,res);

        
    }

};

//  Verify Edit Address (Post Method) :-

const verifyEditAddress = async (req, res , next) => {
    
    try {

        const userId = req.session.user._id;

        const { name, phone, locality, pincode, address, city, state, id } = req.body;

        const editAddress = await Address.findOneAndUpdate({ userId: userId, 'addresss._id': id }, { $set: { 'addresss.$.name': name, 'addresss.$.phone': phone, 'addresss.$.locality': locality, 'addresss.$.pincode': pincode, 'addresss.$.address': address, 'addresss.$.city': city, 'addresss.$.state': state } });

        if (editAddress) {
            
            req.flash('flash', 'Address Edited');
            res.redirect('/checkout');

        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};

//  Choosee Address (Post Method) :-

const chooseAddress = async (req, res , next) => {
    
    try {

        const addId = req.query.id

        const userIdd = req.session.user._id;

        const update = await Address.bulkWrite([
        
            {
              
                updateOne: {
                
                    filter: { userId: userIdd, "addresss.status": true },
                    update: { $set: { "addresss.$.status": false } },
              
                },
                
            },

            {
              
                updateOne: {
                
                    filter: { userId: userIdd, "addresss._id": addId },
                    update: { $set: { "addresss.$.status": true } },
              
                },
                
            },
          
        ]);
        
    } catch (error) {

        next(error,req,res);

        
    }

};

//  Paymen Method (RazorPay Post Method) :-

const RazorPay = async (req, res , next) => {
    
    try {

        const userIdd = req.session.user._id;

        if (userIdd) {

            const cartData = await Cart.findOne({ userId: userIdd });

            const addressData = await Address.findOne({ userId: userIdd });

            if (!cartData || cartData.products.length == 0) {
                
                res.send({ emptyCart: true });

            } else if (addressData.addresss.length == 0) {
                
                res.send({ noAddress: true });

            } else {

                const user = await User.findOne({ _id: req.body.userId });
                const amount = req.body.amount * 100;
        
                const options = {
        
                    amount: amount,
                    currency: "INR",
                    receipt: "absharameen625@gmail.com",
                    
                };
        
                instance.orders.create(options, (err, order) => {
        
                    if (!err) {
        
                        res.send({
        
                            succes: true,
                            msg: "ORDER created",
                            order_id: order.id,
                            amount: amount,
                            key_id: process.env.RAZORPAY_IDKEY,
                            name: user.fullName,
                            email: user.email,
        
                        });
        
                    } else {
        
                        console.error("Error creating order:", err);
        
                        res.status(500).send({ success: false, msg: "Failed to create order" });
                    }
        
                });

            }

        } else {

            res.redirect('/login');

        }
    
    } catch (error) {

        next(error,req,res);

        
    }

};

module.exports = {

    loadCheckout,
    verifyCheckOutAddress,
    deleteAdd,
    editAddress,
    verifyEditAddress,
    chooseAddress,
    RazorPay,

}; 