//  Import Modal (Product) :-
const product = require('../models/product_model');

//  Import Modal (Category) :-
const category = require('../models/category_model');

//  Import Modal (Brand) :-
const brand = require('../models/brand_model');

const fs = require("fs");

const path = require("path");

//  loadProduct (Get Method) :-

const loadProduct = async (req, res) => {
    
    try {

        const limit = 4;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const totalProCount = await product.countDocuments();
        const totalPages = Math.ceil(totalProCount / limit);

        const productData = await product.find().populate('category').skip(skip).limit(limit);    //  Populate

        const msg = req.flash('flash');
        
        res.render('product' , {product : productData ,  currentPage: page, totalPages , msgg : msg});
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  loadAddProduct (Get Method) :-

const loadAddProduct = async (req, res) => {
    
    try {

        const categoryy = await category.find({ is_Listed: true });
        const brandd = await brand.find();

        res.render('addProduct', { categoryy , brandd});
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  verifyAddProduct (Post Method) :-

const verifyAddProduct = async (req, res) => {
    
    try {

        const price = req.body.price

        let imageArry = [];
        const images = req.files;

        images.forEach((file) => {
            
            imageArry.push(file.filename);
        });
 
        const offerPorice = Math.round((price / 100) * (100 - req.body.Discountprice));

        const categoryyy = await category.findOne({ name: req.body.category });
        const brandd = await brand.findOne({ name: req.body.brand });

        const currentDate = Date();
        
        const Product = product.create({

            name: req.body.name,
            description: req.body.discription,
            price: req.body.price,
            category: categoryyy._id,
            brand: brandd.name,
            status: req.body.radio,
            stock: req.body.stock,
            createdAt: currentDate,
            discount_price: offerPorice,
            discount: req.body.Discountprice,
            images: imageArry
            
        });

        res.redirect("/admin/product");
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  productAction (Post Methdo) :-

const productAction = async (req, res) => {
    
    try {

        const productId = req.query.id
        const productData = await product.findOne({ _id: productId });

        productData.status = !productData.status;

        productData.save();
        res.send({set : true});

        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  Product Edit (Get Method) :-

const productEdit = async (req, res) => {
    
    try {

        const productId = req.query.id;
        const editProduct = await product.findOne({ _id: productId });

        res.render("eidtProduct", { productData: editProduct });
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  Product Edit (Post Method) :-

const verifyProductEdit = async (req, res) => {
    
    try {

        const productId = req.params.id
        const editProductt = await product.findOne({ _id: productId });

        const {name , price , Discountprice , stock , discription} = req.body

        let imag = [];

        for (let i = 0; i < 3; i++) {

            const key = `k${i}`;
            
            if (req.body[key]) {

                imag.push(editProductt.images[i]);

            } else {

                imag.push(req.files[`image${i}`][0].filename);
                fs.unlinkSync(path.join(__dirname, '../public/productImage', editProductt.images[i]));
                
            }

        }

        editProductt.images = imag;

        await product.findOneAndUpdate({ _id: productId }, { $set: { name: name, price: price, discount_price: Discountprice, stock: stock, description: discription } });
            
        req.flash('flash', "Product Edited");
        editProductt.save();
        res.redirect("/admin/product");

    } catch (error) {

        console.log(error.message);
        
    }

};


module.exports = {

    loadProduct,
    loadAddProduct,
    verifyAddProduct,
    productAction,
    productEdit,
    verifyProductEdit,

};