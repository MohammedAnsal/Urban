//  Import Address Modal :-
const Address = require("../models/address_model");

//  Import User Modal :-
const User = require("../models/user_model");

//  Import Product Modal :-
const Product = require("../models/product_model");

//  Import Category Modal :-
const Category = require("../models/category_model");

//  Import Order Modal :-
const Order = require("../models/order_model");

//  Import Cart Modal :-
const Cart = require("../models/cart_model");

//  Import Wallet Model :-
const Wallet = require("../models/wallet_model");

//  Coupen Modal :-
const Coupen = require('../models/coupen_model');

//  loadCoupen (Get Method) :- (User)

const loadCoupen = async (req, res , next) => {
    
    try {
        
        const categoryData = await Category.find({ is_Listed: true });

        if (req.session.user) {

            const msg = req.flash('flash')

            const coupenData = await Coupen.find({ status: true });
            
            res.render("coupen", { login: req.session.user, categoryData, coupenData, msgg: msg });

        } else {

            res.redirect('/login');

        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};

//  Coupen Checking (Post Method) :- (User)

const coupenCheck = async (req, res , next) => {
    
    try {

        const inpValue = req.body.inpVal

        const checkCoupen = await Coupen.findOne({ coupenId: inpValue });

        if (checkCoupen) {
            
            res.send({ succ: true })

        } else {

            res.send({ fail: true })

        }

    } catch (error) {

        next(error,req,res);

        
    }

};

//  Use Coupen (Post Method) :- (User)

const useCoupen = async (req, res , next) => {
    
    try {

        const coupenIdd = req.body.coupen;
        
        const coupen = await Coupen.findOne({ coupenId: coupenIdd, status: true });

        if (coupen) {
            
            const cartData = await Cart.findOne({ userId: req.session.user._id });

            const exist = await User.findOne({ _id: req.session.user._id, applyCoupen: { $in: [coupen.coupenId] } });

            if (!exist) {
                
                const cartPrice = cartData.totalCartPrice;  //  CartPrice
                const coupenDis = coupen.discount     //  Coupen Discount
                
                if (coupen) {
                            
                    const offerValue = Math.round((cartPrice) - (cartPrice * coupenDis / 100));
                    const discountedValue = cartPrice - offerValue
                
                    const updateCart = await Cart.findOneAndUpdate({ _id: cartData._id }, { $set: { totalCartPrice: offerValue, coupenDiscount: discountedValue, percentage: coupen.discount } }, { new: true });
                    await User.findOneAndUpdate({ _id: req.session.user._id }, { $push: { applyCoupen: coupen.coupenId } });
                
                    if (updateCart) {
                               
                        req.flash("flash", "coupen");
                        res.redirect("/checkout");
                
                    }
                }

            } else {

                req.flash('flash', 'usedOne');
                res.redirect("/checkout");

            }

        } else {



        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};

//  RemoveCoupen (Put Method) :- (User)

const removeCop = async (req, res , next) => {
    
    try {

        const userIdd = req.session.user._id

        const cartData = await Cart.findOne({ userId: userIdd });

        const addPrice = cartData.coupenDiscount

        const updateCart = await Cart.findOneAndUpdate({ userId: userIdd }, { $set: { coupenDiscount: 0, percentage: 0 } }, { $inc: { totalCartPrice: addPrice } });   //  Update Cart

        await User.findOneAndUpdate({ _id: userIdd }, { $pop: { applyCoupen: 1 } }); //  Remove Coupen Id in User Side
        
        if (updateCart) {
            
            res.send({ succ: true });
        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};

//  loadCoupen (Get Method) :- (Admin)

const loadAdminCoupen = async (req, res , next) => {
    
    try {

        const msg = req.flash("good");

        const coupenData = await Coupen.find();

        res.render("adminCoupen", { coupenData , msgg : msg});
        
    } catch (error) {

        next(error,req,res);

        
    }

};

//  AddCoupen (Post Method) :- (Admin)

const addCoupen = async (req, res , next) => {
    
    try {

        const { coupon, min, max, discount } = req.body;

        const newId = generateCoupenId()

        const createCoupen = new Coupen({

            name: coupon,
            discount: discount,
            from: min,
            to: max,
            coupenId: newId,
            image: req.files[0].filename

        })
        
        if (createCoupen) {
            
            createCoupen.save();
            req.flash("flash", "good");
            res.redirect("/admin/adminCoupen");

        }

    } catch (error) {

        next(error,req,res);

        
    }

};

//  CoupenAction (Put Method) :-

const coupenAction = async (req, res , next) => {
    
    try {

        const copId = req.query.id

        const changeStatus = await Coupen.findOne({ _id: copId });

        changeStatus.status = !changeStatus.status
        changeStatus.save()
        
    } catch (error) {

        next(error, req, res);
        
    }

};

//  DeleteCoupen (Put Method) :-

const deleteCoupen = async (req, res , next) => {
    
    try {

        const copId = req.query.id

        const deletCoupen = await Coupen.deleteOne({ _id: copId });

        if (deletCoupen) {
            
            res.send({ succ: true });

        } 
                
    } catch (error) {

        next(error,req,res);

        
    }

};

//  generateCoupenId :-

const generateCoupenId = () => {

    const look = '123456789ABCDEFG'
    let ID = ''
    
    for (let i = 0; i < 6; i++) {

        ID += look[Math.floor(Math.random() * 10)];

    };

    return ID

}

module.exports = {

    loadCoupen,
    loadAdminCoupen,
    addCoupen,
    coupenAction,
    deleteCoupen,
    coupenCheck,
    useCoupen,
    removeCop
}