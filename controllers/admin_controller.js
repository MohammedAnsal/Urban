//  import module (user Model) :-
const Admin = require("../models/user_model");

//  securely hash passwords :-
const bcrypt = require('bcrypt');

const sceurePassword = async (password) => {
    
    try {

        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
        
    } catch (error) {

        console.log(error.message);

    }

};

//  Load Login (Get Method) :-

const loadLogin = async (req, res , next) => {
    
    try {

        //  Flash Message :-

        const invlidUserr = req.flash("userWrong");
        const passWrongg = req.flash("passWrong");
        const logout = req.flash("logout");

        res.render('login' , {invalidUser : invlidUserr , passwrong : passWrongg , logoutAdmin : logout});
        
    } catch (error) {

        next(error,req,res);

    }

};

//  VerifyLogin (Post Method) :-

const verifyLogin = async (req, res , next) => {
    
    try {

        const Email = req.body.email;
        const Password = req.body.password;

        const adminData = await Admin.findOne({ email: Email, is_admin : true });
        
        if (adminData) {

            const comparePassword = await bcrypt.compare(Password, adminData.password);

            if (comparePassword) {
                
                req.session.admin_id = adminData._id;
                res.redirect("/admin/loadDashboard");
            
            } else {

                req.flash('passWrong', "Password Is Wrong...");
                res.redirect('/admin/login')

            }
            
        } else {
            
            req.flash("userWrong", "Unauthorized User!!!");
            res.redirect('/admin/login');

        }

    } catch (error) {

        next(error,req,res);
        
    }

};

//  Load ListUser (Get Method) :-

const loadListUser = async (req, res , next) => {
    
    try {

        //  Page Navigation :-

        const limit = 5;
        const page = parseInt(req.query.page) || 1
        const skip = (page - 1) * limit;

        const totaluserCount = await Admin.countDocuments({ is_admin : false });
        const totalPages = Math.ceil(totaluserCount / limit);

        const userData = await Admin.find({ is_admin: false })
            
            .skip(skip)
            .limit(limit);

            res.render('userList', { users: userData, currentPage: page, totalPages });      //  Fetch UserData in dbs and passing to userList ejs
        
        // res.render('admin/userList', { admin: req.session.admin, use, user: 'user' , currentPage: page, totalPages})

        // const userData = await Admin.find({ is_admin: false });    
        
    } catch (error) {

        next(error,req,res);
        
    }

};

//  Load verifyUser BlockandUnblock (Post Method) :-

const verifyUserAction = async (req, res , next) => {
    
    try {
        
        const user = await Admin.findOne({ _id: req.params.id });
        user.is_blocked =! user.is_blocked;
        user.save();
        
    } catch (error) {
 
        next(error,req,res);

    }

};

//  Load Logout (Post Method) :-

const loadLogout = async (req, res , next) => {
    
    try {

        req.session.admin_id = undefined;
        req.flash('logout', "Logout Successfully...");
        res.redirect('/admin');

        
    } catch (error) {

        next(error,req,res);
        
    }

};

module.exports = {
    
  loadLogin,
  verifyLogin,
  loadListUser,
  verifyUserAction,
  loadLogout,

};