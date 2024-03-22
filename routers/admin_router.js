const express = require('express');
const admin_route = express();

//  View Engine :-
admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin'); 

//  Path :-
const path = require('path');

//  Multer :-
const multer = require('multer');

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        
        cb(null, path.join(__dirname, '../public/productImage'));
    },
    
    filename: (req, file, cb) => {
      
        const name = Date.now() + ' - ' + file.originalname;
        cb(null, name);
        
    },
    
});

const upload = multer({

    storage: storage,
    
    fileFilter: (req, file, cb) => {
      
        cb(null, true);
        
    },
    
}); 

//  Admin Middilware :-
const admin_middilware = require('../middleware/admin_middleware');

//  Admin Controller :-
const admin_controller = require('../controllers/admin_controller');

//  Category Controller :-
const admin_category = require('../controllers/category_controller');

//  Product Controller :-
const admin_product = require('../controllers/product_controller');

//  Orders Controller :-
const admin_orders = require('../controllers/admin_orders');

//  dashbord (get)
admin_route.get('/dashbord', admin_middilware.isLogin ,  admin_controller.loadDashbord);

//  login (get)
admin_route.get('/', admin_middilware.isLogout ,  admin_controller.loadLogin);
admin_route.get('/login', admin_middilware.isLogout ,  admin_controller.loadLogin);

//  login (post)
admin_route.post('/', admin_controller.verifyLogin);
admin_route.post('/login', admin_controller.verifyLogin);

//  userList (get)
admin_route.get('/users', admin_middilware.isLogin , admin_controller.loadListUser);

//  userAction (get)
admin_route.get('/users/:id', admin_middilware.isLogin , admin_controller.verifyUserAction);

//  logout (post)
admin_route.post('/logout', admin_controller.loadLogout);

//  Category Section :-

//  Admin Category (get)
admin_route.get('/category', admin_middilware.isLogin, admin_category.loadAdminCategory);

//  Admin AddCategory (post)
admin_route.post('/addCategory',  admin_category.addCategory);

//  Admin categoryAction (post)
admin_route.put('/categoryAction', admin_category.categoryAction);

//  Admin categoryEdit (put)
admin_route.put('/categoryEdit', admin_category.categoryEdit);

//  Product Section :-

//  Admin Product (get)
admin_route.get('/product', admin_middilware.isLogin ,  admin_product.loadProduct);

//  Admin AddProduct (get)
admin_route.get('/addProduct', admin_middilware.isLogin ,  admin_product.loadAddProduct);

//  Admin AddProduct (post)
admin_route.post('/addProduct', upload.array('images', 3), admin_product.verifyAddProduct);

//  Admin ProductAction (post)
admin_route.put('/productAction', admin_product.productAction);

//  Admin Edit Product (get)
admin_route.get('/editProduct', admin_product.productEdit);

//  Admin Edit Product (post)
admin_route.post('/editProduct/:id', upload.fields([{ name: 'image0', maxCount: 1 }, { name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), admin_product.verifyProductEdit);

//  Brand Section :-

//  Admin BrandAdd (Post)
admin_route.post('/addBrand', admin_category.BrandAdd);

//  Admin Orders Section :-

//  Admin Orders List (get)
admin_route.get('/orders', admin_orders.loadOrders);

//  Admin Orders Details (post)
admin_route.get('/ordDetails', admin_orders.ordersDetails);

//  Admin OrderStatus Handling (put)
admin_route.put("/orderStatusHandling", admin_orders.orderProstatus);

module.exports = admin_route;