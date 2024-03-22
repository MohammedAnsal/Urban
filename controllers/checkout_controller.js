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

//    Load Checkout (Get Method) :-

const loadCheckout = async (req, res) => {
    
    try {

        const categoryData = await Category.find({ is_Listed: true });

        if (req.session.user) {

            const msg = req.flash('flash');
            const userData = await User.findById({ _id: req.session.user._id });
            const addresData = await Address.findOne({ userId: req.session.user._id });

            const cartData = await Cart.findOne({ userId: req.session.user._id }).populate('products.productId');
            
            res.render("checkout", { login: req.session.user, categoryData, addres: addresData, userData, msgg: msg , cartData});

        } else {

            res.render('checkout', { categoryData });

        }

    } catch (error) {

        console.log(error.message);
        
    }

};

//  VerifyCartAddress (Post Method) :-

const verifyCheckOutAddress = async (req, res) => {

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
        console.log(error.message);
        
    }

};

//  Delete Address (Post Method) :-

const deleteAdd = async (req, res) => {
    
    try {

        const userId = req.query.id
        const addId = req.query.addId

        const deleteAdd = await Address.updateOne({ userId: userId }, { $unset: { addresss: { _id: addId } } });

        if (deleteAdd) {
            
            res.send(true);

        }
        
    } catch (error) {
        
    }

}

//  Edit Address (Put Method) :-

const editAddress = async (req, res) => {
    
    try {

        const { edit } = req.body;
        const editData = await Address.findOne({ 'addresss._id': edit }, { 'addresss.$': 1 });
        
        res.json({ editData });
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  Verify Edit Address (Post Method) :-

const verifyEditAddress = async (req, res) => {
    
    try {

        const userId = req.session.user._id;

        const { name, phone, locality, pincode, address, city, state, id } = req.body;

        const editAddress = await Address.findOneAndUpdate({ userId: userId, 'addresss._id': id }, { $set: { 'addresss.$.name': name, 'addresss.$.phone': phone, 'addresss.$.locality': locality, 'addresss.$.pincode': pincode, 'addresss.$.address': address, 'addresss.$.city': city, 'addresss.$.state': state } });

        if (editAddress) {
            
            req.flash('flash', 'Address Edited');
            res.redirect('/checkout');

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  Choosee Address (Post Method) :-

const chooseAddress = async (req, res) => {
    
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

        console.log(error.message);
        
    }

};

module.exports = {

    loadCheckout,
    verifyCheckOutAddress,
    deleteAdd,
    editAddress,
    verifyEditAddress,
    chooseAddress,

}