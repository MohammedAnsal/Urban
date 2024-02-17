const express = require("express");

const user_route = express();

//  View Engine

user_route.set('view engine' , 'ejs');
user_route.set('views' , './views/user');

//  userController
const user_controller = require('../controllers/user_controller');

//  home (get)
user_route.get('/', user_controller.loadhome);

//  login (get)
user_route.get('/login', user_controller.loadlogin);

//  login (post)
user_route.post('/login', user_controller.verifylogin);

//  signup (get)
user_route.get('/signup', user_controller.loadsignUp);

//  signup (post)
user_route.post('/signup', user_controller.insertUser);

//  otp (get)
user_route.get("/otpVerification", user_controller.loadOtp);

// //  otp (post)
user_route.post('/verify-otp', user_controller.verifyOtpp);

module.exports = user_route;