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

const loadOrder = async (req, res , next) => {

    try {

        const categoryData = await Category.find({ is_Listed: true });

        if (req.session.user) {

            const addressData = await Address.findOne({

                userId: req.session.user._id,

            });

            const limit = 3;
            const page = parseInt(req.query.page) || 1;
            const skip = (page - 1) * limit;

            const totalOrd = await Order.countDocuments({

                userId: req.session.user._id,

            });

            const totalPages = Math.ceil(totalOrd / limit);

            const orderData = await Order.find({ userId: req.session.user._id })
                
                .populate("products.productId")
                .skip(skip)
                .limit(limit);

            res.render("orders", {

                login: req.session.user,
                categoryData,
                address: addressData,
                orderData,
                currentPage: page,
                totalPages,

            });

        } else {

            res.redirect("/login");

        }

    } catch (error) {

        next(error,req,res);


    }

};

//  OrderDetails (Get Method) :-

const orderView = async (req, res , next) => {
      
    try {
        
        const categoryData = await Category.find({ is_Listed: true });

        const order = await Order.findOne({ _id: req.query.id }).populate('products.productId');

        res.render('orderDetails', { login: req.session.user, order, categoryData });
        
    } catch (error) {
        
        next(error, req, res);
        
    }
    
};

//  Order Kitty (Post Method) :-

const orderKitty = async (req, res , next) => {
    
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
                    coupenDis: cartt.coupenDiscount,
                    percentage: cartt.percentage
        
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
            
                    const cartRemove = await Cart.updateOne({ userId: userIdd }, { $unset: { products: 1 }, $set: { totalCartPrice: 0, coupenDiscount: 0, percentage: 0 } });
                        
                    if (cartRemove) {
            
                        res.redirect('/thanks');
            
                    } else {
                            
                        console.log("poyi");
            
                    }
        
                }
        
            }
            
        } else {

            req.redirect("/login")

        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};

//  Load Thanks Page (Get Method) :-

const loadThanks = async (req, res , next) => {
    
    try {

        if (req.session.user && req.session.orderGot) {
            
            const categoryData = await Category.find({ is_Listed: true });
            res.render("thanksPage", { login: req.session.user, categoryData });

        } else {

            res.redirect('/')

        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};

//  orderCancel (Post Method) :-

const orderCancel = async (req, res , next) => {
    
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

        let findOrd; //  Find Order Variable
        let ordVal;  //  Order Amount Variable
        let moneyDecrese // Product Price

        if (orderFind) {
            
            const getQuantity = orderFind.products[0].quantity;     //  Find Pro Quantity

            console.log(getQuantity + 'Quantity');
    
            await Product.findOneAndUpdate({ _id: proId }, { $inc: { stock: getQuantity } });

            //  Manage The Money :-

            moneyDecrese = orderFind.products[0].price    //  Find Pro Price

            findOrd = await Order.findOne({ _id: ordId, userId: userIdd });   //  Find Order

            ordVal = findOrd.orderAmount;     //  Find Ord Amount

            if (findOrd.percentage >= 1) {

                let newVal = Math.floor((ordVal) - (moneyDecrese - (moneyDecrese * findOrd.percentage / 100)));
                
                await Order.findOneAndUpdate({ _id: ordId, 'products.productId': proId }, { $set: { orderAmount: newVal } });

            } else {

                await Order.findOneAndUpdate({ _id: ordId, 'products.productId': proId }, { $inc: { orderAmount: -moneyDecrese } });

            }

        }

        //  CancelProduct Amount Adiing The Wallet :-

        if (cancelOrd.peyment != 'Cash on Delivery') {
            
            if (findOrd.percentage >= 1) {
                
                let newVall = Math.floor((moneyDecrese - (moneyDecrese * findOrd.percentage / 100)));

                await Wallet.findOneAndUpdate({ userId: userIdd }, { $inc: { balance: newVall }, $push: { transaction: { amount: newVall, creditOrDebit: 'credit' } } }, { new: true, upsert: true });

                res.send({ succ: true });
 
            } else {

                await Wallet.findOneAndUpdate({ userId: userIdd },
                
                    {
                        $inc: { balance: price },
                        $push: { transaction: { amount: price, creditOrDebit: 'credit' } }
                    },
                    
                    { new: true, upsert: true }
    
                );
    
                res.send({ succ: true });

            }

        } else {

            res.send({ fail: true });
        }

    } catch (error) {

        next(error,req,res);

        
    }

};

//  ReturnOrder (Post Method) :-

const returnOrd = async (req, res , next) => {
    
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
        
        const returnMasg = await Order.findOneAndUpdate(
        
            { _id: ordId, "products.productId": proId },
          
            {
                $set: {
                    "products.$.retruned": true,
                    "products.$.reason": reason,
                    "products.$.forButton": true,
                },
            }
          
        );

        if (returnMasg) {
         
            console.log("Okey Anuu");
         
        } else {

            console.log("Okey Allaaaa");

        }

    } catch (error) {

        next(error,req,res);

        
    }

};

//  Download Invoice (Put Method) :-

const downloadInvoice = async (req, res , next) => {
    
    try {

        const ordId = req.query.id
        
        const ordData = await Order.find({ _id: ordId }).populate('products.productId userId')

        res.render('invoice', { ordData })
        
    } catch (error) {

        next(error,req,res);

        
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