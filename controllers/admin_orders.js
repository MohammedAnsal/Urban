//  Import Admin Modal :-
const Admin = require('../models/user_model');

//  Impoert Order Modal :-
const Order = require('../models/order_model');

//  Import Product Modal :-
const Product = require('../models/product_model');

// Import Wallet Modal :-
const Wallet = require('../models/wallet_model');

//  loadOrders (Get Method) :-

const loadOrders = async (req, res , next) => {
    
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

        next(error,req,res);

    }

};

//  ordersDetails (Post Method) :-

const ordersDetails = async (req, res , next) => {
    
    try {

        const ordId = req.query.id

        const ordDettails = await Order.findOne({ _id: ordId }).populate('products.productId userId');

        res.render("orderDetails", { ordDettails, ordId });
        
    } catch (error) {

        next(error,req,res);
        
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

const orderProstatus = async (req, res , next) => { 

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
        
    } catch (error) {
        
        next(error, req, res);
    }
    
};

//  Return Managing Admin :-

const returnManaging = async (req, res , next) => {

    try {

        const ordId = req.query.id      // Order Id
        const proIdd = req.query.proId  // Order Pro Main Id

        await Order.findOneAndUpdate(
        
            { _id: ordId, "products._id": proIdd },

            { $set: { "products.$.orderProStatus": "returned" } },

            { new: true }
        );

        //  Find Single Product And Other Things :-
        
        const findOrder = await Order.findOne(
        
            {
                _id: ordId,
                "products._id": proIdd,
                "products.retruned": true,
            },

            { "products.$": 1, userId: 1, percentage: 1, orderAmount: 1 }
          
        );

        if (findOrder) {
            
            //  There is Stock Menaging :-

            const ProIdd = findOrder.products[0].productId; //  Find ProId

            const findStock = findOrder.products[0].quantity;   //  Find Quantity

            await Product.findOneAndUpdate(
            
                        
                { _id: ProIdd },

                { $inc: { stock: findStock } },

                { new: true }

            );

            //  Money Managing :-
      
            let moneyDecreses = findOrder.products[0].price;
      
            //  There Is If Coupen Used Product Came (Menaging) :-
            
            if (findOrder.percentage >= 1) {

                let newVal = Math.floor((findOrder.orderAmount) - (moneyDecreses - (moneyDecreses * findOrder.percentage / 100)));
                
                await Order.findOneAndUpdate({ _id: ordId, 'products._id': proIdd }, { $set: { orderAmount: newVal } });

            } else {

                await Order.findOneAndUpdate({ _id: ordId, "products._id": proIdd }, { $inc: { orderAmount: -moneyDecreses } });
            }

            if (findOrder.products[0].retruned && ordId.peyment !== 'Cash on Delivery') {

                if (findOrder.percentage >= 1) {
                    
                    let newVall = Math.floor((moneyDecreses - (moneyDecreses * findOrder.percentage / 100)));
                     
                    await Wallet.findOneAndUpdate({ userId: findOrder.userId }, { $inc: { balance: newVall }, $push: { transaction: { amount: newVall, creditOrDebit: 'credit' } } }, { new: true, upsert: true });

                } else {

                    await Wallet.findOneAndUpdate({ userId: findOrder.userId }, { $inc: { balance: moneyDecreses }, $push: { transaction: { amount: moneyDecreses, creditOrDebit: 'credit' } } }, { new: true, upsert: true });

                }
                
            }
                        
        };
 
    } catch (error) {

        next(error,req,res);
    }

};

module.exports = {

    loadOrders,
    ordersDetails,
    orderProstatus,
    returnManaging

};