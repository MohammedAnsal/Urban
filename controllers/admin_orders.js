//  Import Admin Modal :-
const Admin = require('../models/user_model');

//  Impoert Order Modal :-
const Order = require('../models/order_model');

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

        res.render('orderDetails', {ordDettails});
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  OrderDetails Handling Fub :-

const updateOrderStatus = async (orderId) => {

    try {
      
        const order = await Order.findById(orderId);
        
        const orderProStatusValues = order.products.map(
    
            (item) => item.orderProStatus
            
        );
        
        let newOrderStatus;
        
        if (orderProStatusValues.every((status) => status === "delivered")) {
        
            newOrderStatus = "delivered";
            
        } else if (orderProStatusValues.every((status) => status === "shipped")) {
            
            newOrderStatus = "shipped";
            
        } else if (orderProStatusValues.every((status) => status === "canceled")) {
            
            newOrderStatus = "canceled";
            
        } else {
            
            newOrderStatus = "pending";
            
        }

        order.orderStatus = newOrderStatus;
        
        await order.save();
        
    } catch (err) {
        
        console.log(err.message + " updateOrderStatus");
        
    }
    
};

//  orderDetails Handling (Post Method) :-

const orderProstatus = async (req, res) => {

    try {

        const orderId = req.body.ordId
        const productId = req.body.proId
        const bodyValue = req.body.val
      
        await Order.findOneAndUpdate(
    
            { _id: orderId, "products.productId": productId },

            { $set: { "products.$.orderProStatus": bodyValue } }
      
        );
        
        updateOrderStatus(orderId);
        
        res.json({ success: true });
        
    } catch (err) {
        
        console.log(err.message + " orderProstatus");
        res.status(500).json({ success: false, error: err.message });
        
    }
    
};

module.exports = {

    loadOrders,
    ordersDetails,
    orderProstatus,

};