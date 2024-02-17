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

        res.render('homePage');
        
    } catch (error) {

        console.log(error.message);
        
    }
}

//===============================//


//  User SignUp (Get Method) :-

const loadsignUp = async (req, res) => {
    
    try {

        res.render('signUp');
        
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

        const userData = await user.save();
    
        if (userData) {
            
            const generatedOtp = generateOtp();    //   Assign OTP to Variable
            console.log(generatedOtp);

            await sendOtpMail(req.body.fullname, req.body.email, generatedOtp);     //  Sended Otp

            res.redirect('/otpVerification');

        } else {

            res.redirect('/signup');

        };

    } catch (error) {

        console.log(error.message);
        
    }

};

//===============================//

//  Load Verify Email (For Send Mail) (Get Method) :-

const sendOtpMail = async (name , email , otpp) => {
    
    try {

        const transporter = nodemailer.createTransport({

            service: 'gmail',
            
            auth: {
                
                user: process.env.EMAIL_USER,   //  Email
                pass:process.env.EMAIL_PASSWORD //  App Password
            }
        });

        //  Compose Email :-

        const mailOption = {

            from: 'ansalshaah786@gmail.com',
            to: email,
            subject: 'For Otp Verification',
            html: `<h3>Hello ${name}, Welcome to Urban Store Page</h3>
            <br><p>Enter ${otpp} on the Signup Page to Register</p>`
        };

        //  Send Email :-

        transporter.sendMail(mailOption, function (error, info) {

            if (error) {

                console.log('Error Sending Email:-' , error);

            } else {

                console.log("Email Has Been Sended:-" , info.response);
            }
        });

        //  Otp Schema Adding

        const newUserOtp = new Otp({

            email: email,
            otp: otpp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 120000
        });

        await newUserOtp.save();    //  Otp Saved in Dbs

        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  Function to Generator Otp :-

const generateOtp = () => {
    
    const digits = '0123456789';

    let OTP = '';

    for (let i = 0; i < 4; i++) {

        OTP += digits[Math.floor(Math.random() * 10)];
    };

    return OTP;

};

//===============================//

//  Load Otp (Get Method) :-

const loadOtp = async (req , res) => {
    
    try {

        res.render('otp');
        
    } catch (error) {

        console.log(error.message);
        
    }
};

//  Load Otp (Post Method) :-

const verifyOtpp = async () => {
    
    try {

        res.redirect("/otpVerification");
        
    } catch (error) {

        console.log(error);
        
    }

}

//===============================//

//  Load Login (Get Method) :-

const loadlogin = async (req, res) => {
    
    try {

        res.render('login');

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
  loadOtp,
  verifyOtpp
  
  
};