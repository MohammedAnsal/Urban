const Product = require("../models/product_model");

//  Import Category Modal :-
const Category = require("../models/category_model");

//  Import Order Modal :-
const Order = require("../models/order_model");

//  Import Offer Model :-
const Offer = require('../models/offer_model');

//  loadOffer (Get Method) :-

const loadOffer = async (req, res , next) => {
    
    try {

        const category = await Category.find({ is_Listed: true })

        const offer = await Offer.find().populate('category')

        res.render('offer' , {category , offer});
        
    } catch (error) {

        next(error,req,res);
        
    }

};

//  addOffer (Post Method) :-

const addOffer = async (req, res , next) => {
    
    try {

        const { offname, category, offer } = req.body;

        const findCategory = await Category.findOne({ name: category })

        const findProduct = await Product.find({'category': findCategory._id }).populate('category');

        const exist = await Offer.findOne({

            $or: [
            
                { name: { $regex: new RegExp(offname, 'i') } },

                { category: findCategory._id } 

            ]

        }).populate('category');
        
        if (!exist) {
            
            findProduct.forEach(async (val) => {
            
                const offerPorice = Math.round((val.price / 100) * (100 - offer));
                await Product.findOneAndUpdate({ _id: val._id }, { $set: { discount: offer, discount_price: offerPorice } });

            })
            
            const offerAdd = new Offer({

                name: offname,
                offer: offer,
                category: findCategory._id

            })

            offerAdd.save();
            res.redirect("/admin/adminOffer");

        } else {

            console.log("Fail");

        }

    } catch (error) {

        next(error,req,res);

        
    }

};

//  offerRemove (Put Method) :-

const offerRemove = async (req, res , next) => {
    
    try {

        const offerId = req.query.id
        
        const removed = await Offer.findOneAndDelete({ _id: offerId });

        const cateId = removed.category._id

        if (removed) {
            
            const r = await Product.updateMany({ category: cateId }, { $set: { discount: 0, discount_price: 0 } });

            res.send({ succ: true })

        } else {

            res.send({ fail: true })

        }

    } catch (error) {

        next(error,req,res);

    }

};

module.exports = {

    loadOffer,
    addOffer,
    offerRemove
}