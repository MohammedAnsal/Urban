//  import module (user Model) :-
const User = require("../models/user_model");

//  import module (otp Model) :-
const Otp = require('../models/otp_model');

//  set flash :-
const flash = require('flash');

//  set nodeMailer :-
const nodemailer = require('nodemailer');

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

//===============================//

//  Load Home (Get Method) :-

const loadhome = async (req , res) => {
    
    try {

        res.render('user/homePage');
        
    } catch (error) {

        console.log(error.message);
        
    }
}

//===============================//


//  User SignUp (Get Method) :-

const loadsignUp = async (req, res) => {
    
    try {

        res.render('user/signUp');
        
    } catch (error) {

        console.log(error.message);
        
    }
};

//  Fetch User data and store data in (DataBase) :- (Post of Signup)

const insertUser = async (req, res) => {
    
    try {

        const securepassword = await securePassword(req.body.password);

        // const confirmpassword = await securePassword(req.body.confirm_password);

        const user = new User({

            fullName: req.body.fullname,
            email: req.body.email,
            phone: req.body.phone,
            password: securepassword,
            is_admin: 0

        });

        const passwordd = req.body.password;
        const confirmpasswordd = req.body.confirmPassword

        if (passwordd == confirmpasswordd) {
            
            const userData = await user.save();
    
            if (userData) {

                // sendVerifyMail(req.body.fullname, req.body.email, userData._id);
                
                res.redirect('/');
    
            }

        } else {

            res.redirect('/signup')

        }

        
    } catch (error) {

        console.log(error.message);
        
    }

};

//===============================//

//  Load Otp (Get Method) :-





//===============================//

//  Load Login (Get Method) :-

const loadlogin = async (req, res) => {
    
    try {

        res.render('user/login');

    } catch (error) {

        console.log(error.message);
        
    }
};

//  Load Login (Post Method) :-

const verifylogin = async (req, res) => {
    
    try {

        res.redirect('/');
        
    } catch (error) {

        console.log(error.message);
        
    }
};

//===============================//

module.exports = {

  loadhome,
  loadlogin,
  verifylogin,
  loadsignUp,
  insertUser,
  
};