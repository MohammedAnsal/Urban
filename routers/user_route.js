const express = require("express");
const user_route = express();

//  View Engine :-
user_route.set('view engine' , 'ejs');
user_route.set('views' , './views/user');

//  userController :-
const user_controller = require('../controllers/user_controller');

//  userMiddleware :-
const user_middilware = require('../middleware/user_middleware');

//  forgotPassword :-
const forgotPass_middilware = require('../middleware/forgottPassword');

//  User Profile :-
const profile_controller = require('../controllers/profile_controller');

//  UserCart :-
const cart_controller = require('../controllers/cart_controller');

//  User Address :-
const addres_controller = require('../controllers/address_controller');

//  User Checkout :-
const checkout_controller = require('../controllers/checkout_controller');

//  User Orders :-
const orders_controller = require('../controllers/orders_controller');

//  User Wishlist :-
const user_wishlist = require('../controllers/wishlist_controller');

//  User Coupen :-
const user_coupen = require('../controllers/coupen_controller');

//  404 Page :-
user_route.get('/404', user_controller.catchAll);

//  500 Page :-
// user_route.get('/500', user_controller.catch500);

//  home (get)
user_route.get('/', user_middilware.isBlocked , user_controller.loadhome);

//  login (get)
user_route.get('/login', user_middilware.loginTrue , user_controller.loadlogin);

//  login (post)
user_route.post('/login', user_controller.verifylogin);

//  signup (get)
user_route.get('/signup', user_middilware.loginTrue ,  user_controller.loadsignUp);

//  signup (post)
user_route.post('/signup', user_controller.insertUser);

//  otp (get)
user_route.get('/otpVerification', user_middilware.loginTrue , user_controller.loadOtpp);

//  otp (post)
user_route.post('/resOtp', user_middilware.loginTrue ,  user_controller.verifyOtpp);

//  re-send otp (get)
user_route.get('/resendOtp', user_controller.loadResendOtp);

//  about (get)
user_route.get("/about", user_middilware.isBlocked, user_controller.loadAbout);

//  contact (get)
user_route.get('/contact', user_middilware.isBlocked, user_controller.loadContact);

//  logout (post) 
user_route.post('/logout', user_controller.loadlogout);

//  category (get)
user_route.get('/category/:id', user_middilware.isBlocked, user_controller.loadCategory);

//  product (get)
user_route.get('/product', user_middilware.isBlocked, user_controller.loadAllproduct);

//  product-details (get)
user_route.get('/productDetails', user_middilware.isBlocked, user_controller.loadPrdctDetails);   

//  Search Producct (put)
user_route.put("/searchProduct", user_controller.searchProduct);

//  Price Filter (put)
user_route.put('/priceFilter', user_controller.priceFilter);

//  SortProName (put)
user_route.put("/aAzZ", user_controller.aAzZ);

//  SortProName (put)
user_route.put("/zZaA", user_controller.zZaA);

//  lowTohigh (put)
user_route.put("/lowToHigh", user_controller.lowToHigh);

//  highTolow (put)
user_route.put('/highTolow', user_controller.highTolow);

//  forgotPassword (get)
user_route.get('/forgotPass', user_controller.loadForgotPassword);

//  forgotPassword (post)
user_route.post('/forgotPass', user_controller.verifyEmailForgottPass);

//  confirmPassword (get)
user_route.get('/confirmPass', forgotPass_middilware.forgotPass , user_controller.loadConfirmPassword);

//  confirmPassword (post)
user_route.post('/confirmPass', user_controller.verifyConfirmPassword);

//  wallet (get)
user_route.get('/wallet', user_middilware.user, user_controller.loadWallet);

//  Profile Section :-

//  Profile (get)
user_route.get('/profile', user_middilware.user, user_middilware.isBlocked, profile_controller.loadProfile);

//  Edit Profile (post)
user_route.post('/editProfile', profile_controller.editProfile);

//  changePassword (post)
user_route.post('/changePassword', profile_controller.changePassword);

//   Address Section :-

//   address (get)
user_route.get('/address', user_middilware.user, addres_controller.loadAddress);

//   addAddress (post)
user_route.post('/addAddress', addres_controller.addAddress);

//  editAddress (put)
user_route.put('/editAddress', addres_controller.editAddress);

//  verifyEditAddress (post)
user_route.post('/verifyEditAddress', addres_controller.verifyEditAddress);

//  deleteAddress (post)
user_route.post('/deleteAdd', addres_controller.deleteAddress);

//  Choose Address (post)
user_route.post("/chooseAddress", checkout_controller.chooseAddress);

//  Orders Section :-

//  load Orders (get)
user_route.get('/orders', user_middilware.user, user_middilware.isBlocked, orders_controller.loadOrder);

//  orderDetails (get)
user_route.get("/orderDetails", user_middilware.user, user_middilware.isBlocked, orders_controller.orderView);

//  Order Kitty (post)
user_route.post('/getOrder', orders_controller.orderKitty);

//  thanksPage (get)
user_route.get('/thanks', user_middilware.user, user_middilware.isBlocked, orders_controller.loadThanks);

//  cancelOrder (post)
user_route.post('/cancelOrd', orders_controller.orderCancel);

//  returnOrder (post)
user_route.put('/returnOrd', orders_controller.returnOrd);

//  Download Invoice (put)
user_route.get("/downloadInvoice", orders_controller.downloadInvoice);

//  Cart Section :-

//  cart (get)
user_route.get('/cart', user_middilware.user, user_middilware.isBlocked, cart_controller.loadCart);

//  Add Cart (post)
user_route.post('/addCart', cart_controller.addCart);

//  Delete Cart (post)
user_route.post('/deleteCart', cart_controller.deleteCart);

//  Update Cart (put)
user_route.put('/cartUpdate', cart_controller.updateCart);

//  Cart Count (post)
user_route.post("/cartAction", user_controller.cartAction);

//  CheckOut Section :-

//  checkout (get)
user_route.get('/checkout', user_middilware.user, user_middilware.isBlocked, checkout_controller.loadCheckout);

//  verifychekout Add Address (post)
user_route.post("/verifyChekutAdss", checkout_controller.verifyCheckOutAddress);

//  editAddressCheckout (put)
user_route.put("/editAddressCheckout", checkout_controller.editAddress);

//  verifyEditAddressCheckout (post)
user_route.post('/verifyEditAddCheckout', checkout_controller.verifyEditAddress);

//  deleteAddress (post)
user_route.post('/deleteCheckAdd', checkout_controller.deleteAdd);

//  razorPay (post)
user_route.post("/razorPay", checkout_controller.RazorPay);

//  razorpPay Failed (post)
user_route.post("/failedRazorpay", checkout_controller.razorpayFailed);

//  razorpay for failedPayment (post)
user_route.post('/sucRazorpay', checkout_controller.failedRazorpay);

//  this one changing failedPayment statust changing (post)
user_route.post("/changeStatus", checkout_controller.changeProStatus);

//  Wishlist Section :-

//  wishList (get)
user_route.get('/wishlist', user_middilware.user, user_middilware.isBlocked, user_wishlist.loadWishlist);

//  addWishlist (post)
user_route.post('/addWishlist', user_wishlist.addWishlist);

//  removeWishlist (put)
user_route.put('/removeWishlist', user_wishlist.removeWishlist);

//  addCart (post)
user_route.post("/addCartt", user_wishlist.addCart);

//  Coupen Section :-

//  Coupen (get)
user_route.get('/coupen', user_middilware.user, user_middilware.isBlocked, user_coupen.loadCoupen);

//  coupenCheck (post)
user_route.post("/coupenCehck", user_coupen.coupenCheck);

//  useCoupen (post)
user_route.post('/useCoupen', user_coupen.useCoupen);

//  removeCouepn (put)
user_route.put('/removeCop', user_coupen.removeCop);

module.exports = user_route;