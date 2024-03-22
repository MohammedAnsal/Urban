//  Import Address Modal :-
const Address = require("../models/address_model");

//  Import User Modal :-
const User = require("../models/user_model");

//  Import Product Modal :-
const Product = require("../models/product_model");

//  Import Category Modal :-
const Category = require("../models/category_model");

//  Import Cart Modal :-
const Cart = require('../models/cart_model');

//  Load Cart Page (Get Method) :-

const loadCart = async (req, res) => {
    
    try {

        const userIdd = req.session.user._id

        const categoryData = await Category.find({ is_Listed: true });

        if (req.session.user) {

            const cartData = await Cart.findOne({ userId: userIdd }).populate('products.productId');

            if (cartData) { 
                
                const totall = cartData.products.reduce((acc, product) => acc + product.price, 0);  //  Calculating Cart Total Pricee

                const totalPriceAdding = await Cart.findOneAndUpdate({ userId: userIdd }, { $set: { totalCartPrice: totall } } , {new : true , upsert : true}).exec()

                res.render("cart", { login: req.session.user, categoryData, cartData, totalPrice: totalPriceAdding.totalCartPrice });
                
            } else {
                
                res.render("cart", { login: req.session.user, categoryData, totalPrice: 0 });

            }

        } else {

            res.render("cart" , {categoryData});

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  Add Cart (Post Method) :-

const addCart = async (req, res) => {
    
    try {

        const productIdd = req.query.id;
        const userIdd = req.session.user._id
        const qty = req.body.quantity || 1;

        const cartProduct = await Product.findOne({ _id: productIdd });

        const exist = await Cart.findOne({ userId: userIdd, products: { $elemMatch: { productId: productIdd } } });

        if (!exist) {

            const total = cartProduct.price * qty;
            
            await Cart.findOneAndUpdate(
            
                { userId: userIdd },
              
                {
                  
                    $addToSet: {
                    
                        products: {
                            
                            productId: productIdd,
                            price: total,
                            quantity: qty,
                        },
                    },
                
                },
              
                { new: true, upsert: true }
              
            );

            res.send({ success: true });

        } else {

            res.send({ exist: true });

        }

    } catch (error) {

        console.log(error.message);
        
    }

};

//  Delete Cart (Post Method) :-

const deleteCart = async (req, res) => {
    
    try {

        const cartIdd = req.query.id
        const userIdd = req.session.user._id

        const removeCart = await Cart.updateOne({ userId: userIdd }, { $pull: { products: { productId: cartIdd } } });

        if (removeCart) {
            
            console.log("success");
            res.send(true);

        } else {

            console.log("false");

        }

    } catch (error) {

        console.log(error.message);
        
    }

};

//  Update Cart (Put Method) : -

const updateCart = async (req, res) => {
      
    try {

        const productIdd = req.body.proId
        const cartIdd = req.body.cartId
        const quantityy = req.body.quantity

        const product = await Product.findOne({ _id: productIdd });
        
        const newValue = product.price * quantityy;
  
        const updatedCart = await Cart.findOneAndUpdate({ _id: cartIdd, "products.productId": productIdd }, { $set: { "products.$.price": newValue, "products.$.quantity": quantityy, }, }, { new: true });

        const totalCartPricee = updatedCart.products.reduce((acc, product) => acc + product.price, 0);
  
        await Cart.findOneAndUpdate({ _id: cartIdd }, { $set: { totalCartPrice: totalCartPricee } });

        res.send({ success: totalCartPricee });
        
    } catch (err) {

        console.log(err.message + "cart edit");
        
    }

};

module.exports = {

    loadCart,
    addCart,
    deleteCart,
    updateCart,

}