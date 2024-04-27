//  Import Product Model :-
const Product = require('../models/product_model');

//  Import Order Model :-
const Order = require('../models/order_model');

//  Import User Model :-
const User = require('../models/user_model');

//  Import Category Modal :-
const Category = require("../models/category_model");

//  loadDahboard (Get Method) :-

const loadDahboard = async (req, res , next) => {
    
  try {

    const order = await Order.find();   //  Order

    const totalOrdAmount = order.reduce((acc, val) => acc + val.orderAmount, 0);    //  TotalAmount

    const totalProduct = await Product.find()   //  Product

    //  Best Selling Products :-

    const bestSellPro = await Order.aggregate([
        
      {
        $unwind: "$products",
      },

      {
        $group: {

          _id: "$products.productId",
          ttlCount: { $sum: "$products.quantity" },
                    
        },
      },

      {
        $lookup: {

          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productData",
        },
      },

      {
        $sort: { ttlCount: -1 },
      },

      {
        $limit: 5,
      },

    ]);
      
    //  Top Selling Category :-

    const bestSellCate = await Order.aggregate([
    
      { $unwind: "$products" },

      {
        $group: {

          _id: "$products.productId",
          totalQuantity: { $sum: "$products.quantity" },
        },

      },

      { $sort: { totalQuantity: -1 } },
      { $limit: 3 },

      {

        $lookup: {

          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",

        },

      },

      { $unwind: "$productDetails" },

      {
        $lookup: {

          from: "categories",
          localField: "productDetails.category",
          foreignField: "_id",
          as: "categoryDetails",

        },

      },

      {
        $group: {

          _id: "$categoryDetails._id",
          categoryName: { $first: "$categoryDetails.name" },
          totlCate: { $sum: "$totalQuantity" },
        },

      },

      { $sort: { totalCategoryQuantity: -1 } },

      { $limit: 2 },

    ]);

    //  Top Selling Brand :-

    const bestSellBrand = await Order.aggregate([
    
      {
        $unwind: "$products",
      },

      {

        $group: {

          _id: "$products.productId",
          totalQuantity: { $sum: "$products.quantity" },
          
        },

      },

      {

        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },

      },

      {
        $unwind: "$product",
      },

      {

        $group: {

          _id: "$product.brand",
          totalQuantity: { $sum: "$totalQuantity" },

        },

      },

      {
        $sort: { totalQuantity: -1 },
      },

      {
        $limit: 3,
      },

    ]);

    res.render('dashbord', { order, totalOrdAmount, totalProduct, bestSellPro, bestSellCate, bestSellBrand });
        
  } catch (error) {

    next(error,req,res);

        
  }

};

//  Year Chart (Put Method) :-

const chartYear = async (req, res , next) => {

  try {

    const curntYear = new Date().getFullYear();

    const yearChart = await Order.aggregate([
        
      {
        
        $match: {

          orderDate: {

            $gte: new Date(`${curntYear - 5}-01-01`),
            $lte: new Date(`${curntYear}-12-31`),

          },

        },

      },

      {
        $group: {

          _id: { $year: "$orderDate" },
          totalAmount: { $sum: "$orderAmount" },

        },

      },

      {
        $sort: { _id: 1 },
      },

    ]);

    res.send({ yearChart });

  } catch (error) {

    next(error,req,res);


  }

};

//  Month Chart (Put Method) :-

const monthChart = async (req, res , next) => {

  try {
    
    const monthName = [

      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const curntYear = new Date().getFullYear();

    const monData = await Order.aggregate([
    
      {
        $match: {

          orderDate: {

            $gte: new Date(`${curntYear}-01-01`),
            $lte: new Date(`${curntYear}-12-31`),
            
          },

        },
      },

      {
        $group: {
          _id: { $month: "$orderDate" },
          totalAmount: { $sum: "$orderAmount" },
        },
      },

      {
        $sort: { _id: 1 },
      },

    ]);

    const salesData = Array.from({ length: 12 }, (_, i) => {

      const monthData = monData.find((item) => item._id === i + 1);

      return monthData ? monthData.totalAmount : 0;

    });

    res.json({ months: monthName, salesData });

  } catch (error) {

    next(error,req,res);

  }

};

module.exports = {

  loadDahboard,
  chartYear,
  monthChart

};
