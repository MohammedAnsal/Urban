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

const loadCoupen = async (req, res) => {
    
    try {
        
        const categoryData = await Category.find({ is_Listed: true });

        if (req.session.user) {

            const coupenData = await Coupen.find({ status: true });
            
            res.render("coupen", { login: req.session.user, categoryData, coupenData });

        } else {

            res.redirect('/login');

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  Coupen Checking (Post Method) :- (User)

const coupenCheck = async (req, res) => {
    
    try {

        const inpValue = req.body.inpVal

        const checkCoupen = await Coupen.findOne({ coupenId: inpValue });

        if (checkCoupen) {
            
            res.send({ succ: true })

        } else {

            res.send({ fail: true })

        }

    } catch (error) {

        console.log(error.message);
        
    }

};

//  Use Coupen (Post Method) :- (User)

const useCoupen = async (req, res) => {
    
    try {

        
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  loadCoupen (Get Method) :- (Admin)

const loadAdminCoupen = async (req, res) => {
    
    try {

        const msg = req.flash("good");

        const coupenData = await Coupen.find();

        res.render("adminCoupen", { coupenData , msgg : msg});
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  AddCoupen (Post Method) :- (Admin)

const addCoupen = async (req, res) => {
    
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

        console.log(error.message);
        
    }

};

//  CoupenAction (Put Method) :-

const coupenAction = async (req, res) => {
    
    try {

        const copId = req.query.id

        const changeStatus = await Coupen.findOne({ _id: copId });

        changeStatus.status = !changeStatus.status
        changeStatus.save()
        
    } catch (error) {

        
    }

};

//  DeleteCoupen (Put Method) :-

const deleteCoupen = async (req, res) => {
    
    try {

        const copId = req.query.id

        const deletCoupen = await Coupen.deleteOne({ _id: copId });

        if (deletCoupen) {
            
            res.send({ succ: true });

        } 
                
    } catch (error) {

        console.log(error.message);
        
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
}