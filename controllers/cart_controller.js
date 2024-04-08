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
        
        const userIdd = req.session.user._id;

        const categoryData = await Category.find({ is_Listed: true });

        if (req.session.user) {

            const cartData = await Cart.findOne({ userId: userIdd }).populate('products.productId');

            if (cartData) {

                const proStatus = cartData.products.filter(val => val.productId.status === false);     //  Product Status
                
                if (proStatus) {
                    
                    for (const product of proStatus) {
    
                        var newData = await Cart.findOneAndUpdate({ userId: userIdd }, { $pull: { products: { productId: product.productId._id } } }, { new: true });
        
                    }

                }

                const overAll = newData ? newData : cartData;   // TotalPrice Managing

                const totall = overAll.products.reduce((acc, product) => acc + product.price, 0);  //  Calculating Cart Total Pricee

                await Cart.findOneAndUpdate({ userId: userIdd }, { $set: { totalCartPrice: totall } }, { new: true, upsert: true }).exec();

                const updatedCartData = await Cart.findOne({ userId: userIdd }).populate('products.productId');
                
                res.render("cart", { login: req.session.user, categoryData, cartData: updatedCartData, totalPrice: totall });

            } else {

                res.render("cart", { login: req.session.user, categoryData, totalPrice: 0 });

            }

        } else {

            res.redirect('/login')

        }
        
    } catch (error) {

        console.log(error.message);

    }

};

//  Add Cart (Post Method) :-

const addCart = async (req, res) => {
    
    try {

        const productIdd = req.query.id;
        const qty = req.body.quantity || 1;
        
        if (req.session.user) {

            const userIdd = req.session.user._id
            
            const cartProduct = await Product.findOne({ _id: productIdd });
    
            const exist = await Cart.findOne({ userId: userIdd, products: { $elemMatch: { productId: productIdd } } });
    
            if (!exist) {
    
                const total = cartProduct.discount > 0 ? cartProduct.discount_price * qty : cartProduct.price * qty
                
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


        } else {

            res.redirect("/login");

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
      
        const productIdd = req.body.proId;
        const cartIdd = req.body.cartId;
        const quantityy = req.body.quantity;

        const product = await Product.findOne({ _id: productIdd });
        
        const newValue = product.discount > 0 ? product.discount_price * quantityy : product.price * quantityy;

        // Update the product price and quantity in the cart

        const updatedCart = await Cart.findOneAndUpdate(
        
            { _id: cartIdd, "products.productId": productIdd },

            {
                $set: {

                    "products.$.price": newValue,
                    "products.$.quantity": quantityy,

                },

            },

            { new: true }

        );

        // Calculate the updated total cart price

        const totalCartPrice = updatedCart.products.reduce(
        
            (acc, product) => acc + product.price, 0

        );

        // Update the totalCartPrice in the cart document

        await Cart.findOneAndUpdate(
        
            { _id: cartIdd },

            { $set: { totalCartPrice: totalCartPrice } }

        );

        // Send the updated total cart price along with the individual product price

        res.send({ success: totalCartPrice, productPrice: newValue });
        
    } catch (err) {

        console.log(err.message + "cart edit");
        
    }

};

module.exports = {

    loadCart,
    addCart,
    deleteCart,
    updateCart,

};