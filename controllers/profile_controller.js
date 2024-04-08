//  Import User Modal :-
const User = require('../models/user_model');

//  Import Otp Modal :-
const Otp = require('../models/otp_model');

//  Import Product Modal :-
const Product = require('../models/product_model');

//  Import Category Modal :-
const Category = require('../models/category_model');

//  Import Address Modal :-
const Address = require('../models/address_model');

//  Import Wallet Modal :-
const Wallet = require('../models/wallet_model');

//  securely hash passwords :-
const bcrypt = require('bcrypt');

const securePassword = async (password) => {
    
    try {
        
        const passwordHash = await bcrypt.hash(password , 10);
        return passwordHash;
        
    } catch (error) {
        
        console.log(error.message);
        
    }
    
};

// Load Profile (Get Method) ;-
 
const loadProfile = async (req, res) => {
    
    try {
        
        const categoryData = await Category.find({ is_Listed: true });

        if (req.session.user) {

            const msg = req.flash('flash')

            const walletData = await Wallet.findOne({ userId: req.session.user._id });

            const userData = await User.findById({ _id: req.session.user._id });
            res.render("profile", { login: req.session.user, categoryData, userData, msgg: msg , walletData});
            
        } else {

            res.redirect('/login');

        }
        
    } catch (error) {

        console.log(error.message);
    }

};

//  editProfile (Post Method) :-

const editProfile = async (req, res) => {
    
    try {

        const userId = req.query.userId

        const bodyName = req.body.name.trim()
        const bodyPhone = req.body.phone.trim()

        const updateData = await User.findByIdAndUpdate({ _id: userId }, { $set: { fullName: bodyName, phone: bodyPhone } });

        if (updateData) {

            req.flash('flash' , "Profile Editted Successfully")
            res.redirect("/profile");

        } else {

            res.redirect('/profile');

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  changePassword (Post Method) :-

const changePassword = async (req, res) => {
    
    try {
        
        const userId = req.query.userId;    //  User ID
        const userDataa = await User.findById({ _id: userId });
        
        const oldPass = req.body.oldPass;   //  Old Password (First Pass)
        const matchPass = await bcrypt.compare(oldPass, userDataa.password);

        if (matchPass) {

            const newPass = req.body.newPass
            const confirmPass = req.body.confirmPass

            if (newPass == confirmPass) {
                
                const hashPassword = await securePassword(newPass);
                
                const updatePass = await User.findByIdAndUpdate({ _id: userId }, { $set: { password: hashPassword } });
             
                if (updatePass) {
                    
                    req.flash("flash", "Password Changed Successfully");
                    res.redirect("/profile");

                }

            } else {

                req.flash('flash', "Password Not Match!!!");
                res.redirect('/profile')

            }

        } else {
            
            req.flash("flash", "Please Check Your Password Corroct Or Not");
            res.redirect('/profile');

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

}

module.exports = {

    loadProfile,
    editProfile,
    changePassword,

};