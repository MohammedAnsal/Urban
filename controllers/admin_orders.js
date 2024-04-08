//  Import Admin Modal :-
const Admin = require('../models/user_model');

//  Impoert Order Modal :-
const Order = require('../models/order_model');

//  Import Product Modal :-
const Product = require('../models/product_model');

// Import Wallet Modal :-
const Wallet = require('../models/wallet_model');

//  loadOrders (Get Method) :-

const loadOrders = async (req, res) => {
    
    try {
        
        //  Page Navigation :-

        const limit = 5;
        const page = parseInt(req.query.page) || 1
        const skip = (page - 1) * limit;

        const totaluserCount = await Order.countDocuments()
        const totalPages = Math.ceil(totaluserCount / limit);

        const orderData = await Order.find().populate('products.productId')
            
            .skip(skip)
            .limit(limit);
        
        res.render('ordersList', { currentPage: page, totalPages, orderData });
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  ordersDetails (Post Method) :-

const ordersDetails = async (req, res) => {
    
    try {

        const ordId = req.query.id

        const ordDettails = await Order.findOne({ _id: ordId }).populate('products.productId userId');

        res.render("orderDetails", { ordDettails, ordId });
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  OrderDetails Handling :-

// const updateOrderStatus = async (orderId) => {

//     try {
      
//         const order = await Order.findById(orderId);
        
//         const orderProStatusValues = order.products.map(
    
//             (item) => item.orderProStatus
            
//         );
        
//         let newOrderStatus;
        
//         if (orderProStatusValues.every((status) => status === "delivered")) {
        
//             newOrderStatus = "delivered";
            
//         } else if (orderProStatusValues.every((status) => status === "shipped")) {
            
//             newOrderStatus = "shipped";
            
//         } else if (orderProStatusValues.every((status) => status === "canceled")) {
            
//             newOrderStatus = "canceled";
            
//         } else {
            
//             newOrderStatus = "pending";
            
//         }

//         order.orderStatus = newOrderStatus;
        
//         await order.save();
        
//     } catch (err) {
        
//         console.log(err.message + " updateOrderStatus");
        
//     }
    
// };

//  orderDetails Handling (Put Method) :-

const orderProstatus = async (req, res) => { 

    try {

        const orderId = req.body.ordId
        const productId = req.body.proId
        const bodyValue = req.body.val
      
        await Order.findOneAndUpdate(
    
            { _id: orderId, "products.productId" : productId },

            { $set: { "products.$.orderProStatus": bodyValue } }
      
        );
        
        // updateOrderStatus(orderId);
        
        res.json({ success: true });
        
    } catch (err) {
        
        console.log(err.message + " orderProstatus");
        res.status(500).json({ success: false, error: err.message });
        
    }
    
};

//  Return Managing Admin :-

const returnManaging = async (req, res) => {

    try {

        const ordId = req.query.id

        const findReturnOrd = await Order.find({ _id: ordId, "products.retruned": true });

        //  Itrating OrdId :-

        for (const ordData of findReturnOrd) {

            const userIdd = ordData.userId;     //  UserId

            for (const element of ordData.products) {

                if (element.retruned) {

                    await Order.findOneAndUpdate(
                  
                        { _id: ordId, "products.productId": element.productId },
                    
                        { $set: { "products.$.orderProStatus": "returned" } },
                    
                        { new: true }
                    
                    );
                    
                    // Adding Stock Back :-

                    const findOrder = await Order.findOne(
                  
                        {
                            _id: ordId,
                            "products.productId": element.productId,
                            "products.retruned": true,
                      
                        },

                        { "products.$": 1 }
                    
                    );

                    if (findOrder) {
                      
                        const findStock = element.quantity;

                        await Product.findOneAndUpdate(
                        
                            { _id: element.productId },

                            { $inc: { stock: findStock } }

                        );

                        //  Money Managing :-
      
                        const moneyDecreses = element.price;
      
                        await Order.findOneAndUpdate(
      
                            { _id: ordId, "products.productId": element.productId },
      
                            { $inc: { orderAmount: -moneyDecreses } }
      
                        );
                        
                    };

                };

                if (element.retruned && ordId.peyment !== 'Cash on Delivery') {
                
                    await Wallet.findOneAndUpdate({ userId: userIdd }, { $inc: { balance: element.price }, $push: { transaction: { amount: element.price, creditOrDebit: 'credit' } } }, { new: true, upsert: true });
                
                }
            }

        }

    } catch (error) {

        console.log(error.message);

    }

};


module.exports = {

    loadOrders,
    ordersDetails,
    orderProstatus,
    returnManaging

};