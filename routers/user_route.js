const express = require("express");

const user_route = express();


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


// user_route.get('/verify', user_controller.verifyLogin);

module.exports = user_route;