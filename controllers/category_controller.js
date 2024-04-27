//  Import Category Modal :-
const category = require('../models/category_model');

//  Import Brand Modal :-
const brand = require('../models/brand_model');

//  load category (Get Method) :-

const loadAdminCategory = async (req, res , next) => {

    try {

        const limit = 5;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const totalCatCount = await category.countDocuments();
        const totalPages = Math.ceil(totalCatCount / limit);

        const categoryData = await category.find()
        const brandData = await brand.find()

        .skip(skip)
        .limit(limit);

        res.render("category" , {category : categoryData , brand : brandData , currentPage: page, totalPages });
        
    } catch (error) {
        
        next(error,req,res);


    }

};

//  addCategory (Post Method) :-

const addCategory = async (req, res , next) => {
    
    try {

        if(req.query.inp){

            const catecheck = await category.findOne({ name: { $regex: new RegExp('^' + req.query.inp + '$', 'i') } });
            
            if (catecheck) {
                
                res.send({ status: true });
                
            } else {
                
                res.send({ status: false });
                
            }
            
        } else if(req.query.name && req.query.radio ){

            const addCategory = new category({

                name: req.query.name,
                is_Listed: req.query.radio
    
            });
            
            addCategory.save();

            res.send({ true: true });
        }
        
    } catch (error) {

        next(error,req,res);
        
    }

};

//  categoryAction (Post Method) :-

const categoryAction = async (req, res , next) => {

    try {
      
        const categoryId = req.query.id;
        const categoryy = await category.findOne({ _id: categoryId });

        categoryy.is_Listed = !categoryy.is_Listed;

        categoryy.save();
        res.send(true);
   
    } catch (error) {
        
        next(error,req,res);
        
    }
    
};

//  categoryEdit (Post Method) :-

const categoryEdit = async (req, res , next) => {
    
    try {

        const cateId = req.query.id;
        const newName = req.query.value

        //  Valifation For Edit Category :-

        const dataCheck = await category.findOne({ name: { $regex: new RegExp('^' + newName + '$', 'i') } });

        if (dataCheck) {
            
            res.send({ error: "Category already exist" });

        } else {

            const categoryDataa = await category.findByIdAndUpdate({ _id: cateId }, { $set: { name: newName } });

            categoryDataa.save();
            res.send(true);

        }
        
    } catch (error) {

        next(error,req,res);
        
    }

};

//  BrandAdd (Post Method) :-

const BrandAdd = async (req, res , next) => {
    
    try {

        if (req.query.input) {

            const brandData = await brand.findOne({ name: { $regex: new RegExp('^' + req.query.input + '$', 'i') } });

            if (brandData) {
                
                res.send({ status: true });

            } else {

                res.send({ status: false });

            }

        } else if (req.query.name) {
            
            const brandName = req.query.name

            const brandData = new brand({

                name: brandName

            });

            if (brandData) {

                brandData.save();
                res.send(true);

            } else {

                console.log("Brand Error");
                res.send(false);
                
            }

        };
        
    } catch (error) {

        next(error,req,res);

    }

};

module.exports = {

    loadAdminCategory,
    addCategory,
    categoryAction,
    categoryEdit,
    BrandAdd,

};