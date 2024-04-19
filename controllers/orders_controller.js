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

//  Import Wallet Model :-
const Wallet = require('../models/wallet_model');

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
        
        console.log(err.message + 'ORDER VIEW PAGE RENDERING');
        
    }
    
};

//  Order Kitty (Post Method) :-

const orderKitty = async (req, res) => {
    
    try {

        const userIdd = req.session.user._id

        if (userIdd) {

            const cartData = await Cart.findOne({ userId: userIdd });

            const addressData = await Address.findOne({ userId: userIdd });

            if (!cartData || cartData.products.length == 0) {

                req.flash('flash', 'Cart Empty');
                res.redirect("/checkout");

            } else if (!addressData || addressData.addresss.length == 0) {
                
                req.flash('flash', 'No Address');
                res.redirect("/checkout");

            } else {

                const peyMethod = req.body.peyment
        
                const cartt = await Cart.findOne({ userId: userIdd });

                const WalletData = await Wallet.findOne({ userId: userIdd });
        
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
                    peyment: peyMethod,
        
                });
                
                req.session.orderGot = orderGot

                if (req.body.peyment == 'wallet') {

                    const balancee = WalletData.balance - cartt.totalCartPrice

                    const debitAmount = cartt.totalCartPrice
                    
                    await Wallet.findOneAndUpdate(
                    
                        { userId: userIdd },
                      
                        {
                          
                            $set: { balance: balancee },
                            
                            $push: {
                            
                                transaction: { amount: debitAmount, creditOrDebit: 'debit' },
                                
                            },
                            
                        }
                        
                    );

                }

                //  Quantity Managing :-
            
                if (orderGot) {
            
                    orderGot.products.forEach(async (e) => {
            
                        let productt = await Product.findOne({ _id: e.productId });
            
                        let newStock = productt.stock - e.quantity;
            
                        await Product.findOneAndUpdate({ _id: e.productId }, { $set: { stock: newStock } });
            
                    });
            
                    //  Update Cart :-
            
                    const cartRemove = await Cart.updateOne({ userId: userIdd }, { $unset: { products: 1 }, $set: { totalCartPrice: 0, coupenDiscount: 0 } });
                        
                    if (cartRemove) {
            
                        res.redirect('thanks');
            
                    } else {
                            
                        console.log("poyi");
            
                    }
        
                }
        
            }
            
        } else {

            req.redirect("/login")

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  Load Thanks Page (Get Method) :-

const loadThanks = async (req, res) => {
    
    try {

        if (req.session.user && req.session.orderGot) {
            
            const categoryData = await Category.find({ is_Listed: true });
            res.render("thanksPage", { login: req.session.user, categoryData });

        } else {

            res.redirect('/')

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  orderCancel (Post Method) :-

const orderCancel = async (req, res) => {
    
    try {

        const { proId, ordId, price, reason } = req.body;
        const userIdd = req.session.user._id

        const cancelOrd = await Order.findOneAndUpdate(
        
            { _id: ordId, 'products.productId': proId },
          
            {
              
                $set: {
                
                    'products.$.orderProStatus': 'canceled',
                    'products.$.canceled': true,
                    'products.$.reason': reason,
                
                },
                
            },

            { new: true }
            
        )

        //  Adding Stock Back :-

        const orderFind = await Order.findOne({ _id: ordId, "products.productId": proId, "products.canceled": true, }, { "products.$": 1, });

        if (orderFind) {
            
            const getQuantity = orderFind.products[0].quantity;
    
            await Product.findOneAndUpdate({ _id: proId }, { $inc: { stock: getQuantity } });

            //  Manage The Money :-

            const moneyDecrese = orderFind.products[0].price

            await Order.findOneAndUpdate({ _id: ordId, 'products.productId': proId }, { $inc: { orderAmount: -moneyDecrese } });

        }

        //  CancelProduct Amount Adiing The Wallet :-

        if (cancelOrd.peyment != 'Cash on Delivery') {
            
            await Wallet.findOneAndUpdate({ userId: userIdd },
            
                {
                    $inc: { balance: price },
                    $push: { transaction: { amount: price, creditOrDebit: 'credit' } }
                },
                
                { new: true, upsert: true }

            );

            res.send({ succ: true });

        } else {

            res.send({ fail: true });
        }

    } catch (error) {

        console.log(error.message);
        
    }

}

//  ReturnOrder (Post Method) :-

const returnOrd = async (req, res) => {
    
    try {

        const { proId, ordId, price, reason } = req.body;
        const userIdd = req.session.user._id

        // if (req.session.user) {
            
        //     const returnOrdd = await Order.findOneAndUpdate(
            
        //         { _id: ordId, "products.productId": proId },
              
        //         {
                  
        //             $set: {
                    
        //                 "products.$.orderProStatus": "canceled",
        //                 "products.$.canceled": true,
        //                 "products.$.reason": reason,
                  
        //             },
                    
        //         },
              
        //         { new: true }
              
        //     );

        //     //  Adding Stock Back :-

        //     const findOrder = await Order.findOne({ _id: ordId, 'products.productId': proId, 'products.canceled': true }, { 'products.$': 1 });

        //     if (findOrder) {
                
        //         const findStock = findOrder.products[0].quantity;
                
        //         await Product.findOneAndUpdate({ _id: proId }, { $inc: { stock: findStock } });

        //         //  Money Managing :-
                
        //         const moneyDecreses = findOrder.products[0].price;

        //         await Order.findOneAndUpdate({ _id: ordId, 'products.productId': proId }, { $inc: { orderAmount: -moneyDecreses } });

        //     }

        //     //  CancelProduct Money Adding Wallet :-

        //     if (returnOrdd.peyment !== 'Cash on Delivery') {
                
        //         await Wallet.findOneAndUpdate({ userId: userIdd }, { $inc: { balance: price }, $push: { transaction: { amount: price, creditOrDebit: 'credit' } } }, { new: true, upsert: true });

        //         res.send({ succ: true })

        //     } else {

        //         res.send({ fail: true })

        //     }

        // }
        
        //  Return Product :-
        
        const returnMasg = await Order.findOneAndUpdate({ _id: ordId, 'products.productId': proId }, {

            $set: {

                'products.$.retruned': true, "products.$.reason": reason,

            }

        });

        if (returnMasg) {
         
            console.log("Okey Anuu");
         
        } else {

            console.log("Okey Allaaaa");

        }

    } catch (error) {

        console.log(error.message);
        
    }

};

//  Download Invoice (Put Method) :-

const downloadInvoice = async (req, res) => {
    
    try {

        const categoryData = await Category.find({ is_Listed: true });

        const ordId = req.query.id
        
        const ordData = await Order.findOne({ _id: ordId }).populate('products.productId')

        res.render('invoice', { ordData, categoryData })
        
    } catch (error) {

        console.log(error.message);
        
    }

};

module.exports = {

    loadOrder,
    orderKitty,
    loadThanks,
    orderView,
    orderCancel,
    returnOrd,
    downloadInvoice

};