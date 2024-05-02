//  Import User Modal :-
const User = require('../models/user_model');

//  Import Product Modal :-
const Product = require('../models/product_model');

//  Import Category Modal :-
const Category = require('../models/cart_model');

//  Import Wishlist Modal :-
const Wishlist = require('../models/wishlist_model');

//  Import Cart Modal :-
const Cart = require('../models/cart_model');

//  loadWishlist (Get Method) :-

const loadWishlist = async (req, res , next) => {
    
    try {
        
        if (req.session.user) {

            const categoryData = await Category.find({ is_Listed: true });

            const wishlistData = await Wishlist.findOne({ userId: req.session.user._id }).populate('products.productId');
         
            if (wishlistData) {
                
                const proStatus = wishlistData.products.filter(val => val.productId.status === false);

                if (proStatus.length >= 1) {
                    
                    for (const product of proStatus) {
                        
                        var newData = await Wishlist.findOneAndUpdate({ userId: req.session.user._id }, { $pull: { products: { productId: product.productId._id } } }, { new: true }).populate('products.productId');
    
                    }
                    
                    res.render("wishlist", { login: req.session.user, categoryData, wishlistData: newData });
                    
                } else {
                    
                    res.render("wishlist", { login: req.session.user, categoryData, wishlistData });
                }
                
            } else {
                
                res.render("wishlist", { login: req.session.user, categoryData, wishlistData });

            }
            
        } else {

            res.redirect('/login');

        }
        
    } catch (error) {
        
        next(error,req,res);


    }

};

//   addWishlist (Post Method) :-

const addWishlist = async (req, res , next) => {
    
    try {
    
        const proIdd = req.query.id
        const userIdd = req.session.user._id

        const exist = await Wishlist.findOne({ userId: userIdd, products: { $elemMatch: { productId: proIdd } } }).exec();

        if (!exist) {
             
            await Wishlist.findOneAndUpdate({ userId: userIdd }, { $addToSet: { products: { productId: proIdd } } }, { upsert: true });
            
            res.send({ succ: true });
           
        } else {

            res.send({ suc: true });
        }

    } catch (error) {

        next(error,req,res);

        // res.status(500).send({ suc: false, message: 'Internal Server Error' });
        
    }

};

//  removeWishlist (Put Method) :-

const removeWishlist = async (req, res , next) => {
    
    try {

        const proId = req.query.id

        const removeWishlistt = await Wishlist.findOneAndUpdate({ userId: req.session.user._id }, { $pull: { products: { productId: proId } } });

        if (removeWishlistt) {
            
            res.send({ suc: true })

        } else {

            res.send({ fail: true })

        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};

//  addCart (Post Method) :-

const addCart = async (req, res , next) => {
    
    try {

        const proIdd = req.query.id
        const userIddd = req.session.user._id

        const proData = await Product.findOne({ _id: proIdd });
        
        const exist = await Cart.findOne({ userId: userIddd, products: { $elemMatch: { productId: proIdd } } });

        const pricee = proData.price;
        const qty = 1

        if (!exist) {
            
            await Cart.findOneAndUpdate({ userId: userIddd }, { $addToSet: { products: { productId: proIdd, price: pricee, quantity: qty } } }, { upsert: true, new: true });
            
            await Wishlist.findOneAndUpdate({ userId: userIddd }, { $pull: { products: { productId: proIdd } } }, { new: true });

            res.send({ suc: true });

        } else {

            res.send({ fail: true });

        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};

module.exports = {

    loadWishlist,
    addWishlist,
    removeWishlist,
    addCart,

};