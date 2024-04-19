//  import module (user Model) :-
const User = require('../models/user_model');

//  Import modal (category Model) :-
const Category = require('../models/category_model');

//  Import modal (Product Modal) :-
const Product = require('../models/product_model');

//  import module (otp Model) :-
const Otp = require('../models/otp_model');

//  import modal (address modal) ;-
const Address = require('../models/address_model');

//  Import Cart Modal :-
const Cart = require('../models/cart_model');

//  set nodeMailer :-
const nodemailer = require('nodemailer');

//  securely hash passwords :-
const bcrypt = require('bcrypt');

//  Import Wallet Modal :-
const Wallet = require('../models/wallet_model');


const securePassword = async (password) => {
    
    try {
        
        const passwordHash = await bcrypt.hash(password , 10);
        return passwordHash;
        
    } catch (error) {
        
        console.log(error.message);
        
    }
    
};

//===============================//

const secureToken = async (token) => {
    
    try {

        const tokenHash = await bcrypt.hash(token, 5);
        return tokenHash;
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//===============================//

//  Load Home (Get Method) :-

const loadhome = async (req, res) => {
    
    try {
        
        const categoryData = await Category.find({ is_Listed: true });

        if (req.session.user) {
            
            res.render("homepage", { login: req.session.user , categoryData });

        } else {

            res.render("homepage", { categoryData });

        }

    } catch (error) {

        console.log(error.message);
        
    }

};

//===============================//

//  User SignUp (Get Method) :-

const loadsignUp = async (req, res) => {
    
    try {

        //  Flash Messgae :-

        const emailexitss = req.flash("emailexits");
        const confirmPassWrong = req.flash("confirmPassWrong");

        const categoryData = await Category.find({ is_Listed: true });

        res.render('signUp' , {emailAlredyExits : emailexitss , confirmPassWrongg : confirmPassWrong , categoryData});
        
    } catch (error) {

        console.log(error.message);
        
    }
};

//  Fetch User data and store data in (DataBase) :- (Post of Signup)

const insertUser = async (req, res) => {
    
    try {

        const emailExists = await User.findOne({ email: req.body.email });

        if (emailExists) {

            req.flash('emailexits', "Email Already Exist");
            res.redirect('/signup');
            
        } else {

            const user = new User({

                fullName: req.body.fullName,
                email: req.body.email,
                phone: req.body.phone,
                password: req.body.password,
                is_admin: false,
                is_blocked: false
                
            });

            //  Password and Confirm Password Checkingn :-

            const bodyNorPass = req.body.password;
            const bodyConfrimPass = req.body.confirmPassword;

            if (bodyNorPass == bodyConfrimPass) {

                req.session.userSession = user  //  Save User Data in Session

                const userData = req.session.userSession;

                if (userData) {

                    const generatedOTP = generateOTP();    //  Assign OTP to Variable

                    req.session.otp = generatedOTP;     //  Otp Saving Session 

                    console.log(generatedOTP);
    
                    await sendOtpMail(req.body.fullName, req.body.email, generatedOTP, res);     // Sended Otp

                    setTimeout( async () => {   //  Deleting Otp in the Dbs

                        await Otp.findOneAndDelete({ userEmail: req.body.email });
                        
                    }, 60000);
    
                    // res.redirect('/otpVerification');
    
                } else {
    
                    res.redirect('/signup');
    
                };
                
            } else {

                req.flash("confirmPassWrong" , "Password Not Match...");
                res.redirect('/signup');

            }
    
        }

    } catch (error) {

        console.log(error.message);
        
    }

};

//===============================//

//  Load Verify Email (For Send Mail) (Function) :-

const sendOtpMail = async (name , email , otpp , res , token) => {
    
    try {

        //  Send Email Method :-
        const transporter = nodemailer.createTransport({

            service: 'gmail',
            
            auth: {
                
                user: process.env.EMAIL_USER,   //  (Email)
                pass:process.env.EMAIL_PASSWORD //  (App Password)
            }

        });

        //  Compose Email :-
        const mailOption = {

            from: 'ansalshaah786@gmail.com',
            to: email,
            subject: 'For Otp Verification',
            html: `<h3>Hello ${name}, Welcome to Urban</h3>
            <br><p>Enter ${otpp} on the Signup Page to Register</p>`
        };

        //  Send Email :-
        transporter.sendMail(mailOption, function (error, info) {

            if (error) {

                console.log('Error Sending Email:-' , error.message);

            } else {

                console.log("Email Has Been Sended:-" , info.response);
            }
        });

        //  Otp Schema Adding Dbs :-
        const newUserOtp = new Otp({

            userEmail: email,
            otp: otpp,
        
        });

        await newUserOtp.save();    //  (Otp Saved in Dbs)

        res.redirect(`/otpVerification?email=${email}`);  //  Calling Otp Pageee and also passing query to the page

        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  Function :- Generator OTP :-

const generateOTP = () => {
    
    const digits = '0123456789';

    let OTP = '';

    for (let i = 0; i < 4; i++) {

        OTP += digits[Math.floor(Math.random() * 10)];
    };

    return OTP;

};

//===============================//

//  Load Otp (Get Method) :-

const loadOtpp = async (req , res) => { 
    
    try {
        
        if (req.session.otp) {      //  Otp Checking

            const emailQuery = req.query.email;

            const tokkken = req.query.token || null;    //  Tokken 

            const otpMsg = req.flash("flash");

            const categoryData = await Category.find({ is_Listed: true });

            res.render("otp", { emailQuery , tokkken ,  msg: otpMsg , categoryData});

        } else {

            res.redirect('/login');

        }
        
    } catch (error) {

        console.log(error.message);
    
    }
};

//  Load Otp (Post Method) :-

const verifyOtpp = async (req , res) => {
    
    try {

        const userSessionn = req.session.userSession;   //  Assign Session in Variable
        const getQueryEMail = req.body.email;
        const getToken = req.body.token

        const bodyOtp = req.body.inp1 + req.body.inp2 + req.body.inp3 + req.body.inp4;

        if (getToken && getQueryEMail) {
            
            const verifyForgotEmail = await Otp.findOne({ otp: bodyOtp, userEmail: getQueryEMail });

            if (verifyForgotEmail) {
                
                res.redirect(`/confirmPass?email=${getQueryEMail}`);

            } else {

                req.flash('flash', "Invalid OTP!!!");
                res.redirect(`/otpVerification?email=${getQueryEMail}&&token=${getToken}`);

            }

        } else {
            
            const verifiedOtp = await Otp.findOne({ otp: bodyOtp, userEmail: getQueryEMail });

            if (verifiedOtp) {

                if (userSessionn.email == getQueryEMail) {

                    const hashPassword = await securePassword(req.session.userSession.password);
                    
                    const userSessionData = new User({

                        fullName: req.session.userSession.fullName,
                        email: req.session.userSession.email,
                        phone: req.session.userSession.phone,
                        password: hashPassword,
                        is_admin: false,
                        is_blocked: false,
                        
                    });

                    userSessionData.save();

                    req.session.otp = undefined;    //  Deleting The otp after login user

                    req.session.user = userSessionData; //  Save User Data in Session (Orginal)

                    await User.findByIdAndUpdate({ _id: userSessionData._id }, { $set: { is_verified: true } });

                    req.flash("flash", "Verified Successfully");    //  Sweet Alert
                    res.redirect('/otpVerification');
                    
                }
                
            } else {

                req.flash('flash', "Invalid OTP...!");      //  Sweet Alert
                res.redirect(`/otpVerification?email=${getQueryEMail}`);

            }

        }

    } catch (error) {

        console.log(error);
        
    }

};

//===============================//

//  Load Resend Otp (Get Method) :-

const loadResendOtp = async (req, res) => {
    
    try {

        const userdata = req.query.email;   //  Query Email

        const userSessionnn = req.session.userSession;  //  Session User Data

        if (userSessionnn.email == userdata) {
            
            const generatedotp = generateOTP();
            
            console.log(generatedotp + " Re-send Otp");

            await sendOtpMail(userSessionnn.fullName, userSessionnn.email, generatedotp, res);
            
            setTimeout(async () => {    //  This also Deleting the Otp in Dbs 
                
                await Otp.findOneAndDelete({ userEmail: userdata });
                
            }, 60000);

        }

    } catch (error) {

        console.log(error);
        
    }

};

//===============================//

//  Load Login (Get Method) :-

const loadlogin = async (req, res) => {
    
    try {

        //  Delete The Otp Session :-
        delete req.session.otp

        //  Flash Message :-
        
        const passwordWrongMsg = req.flash("passwordWrong");   
        const emailWrongMsg = req.flash("emailWrong");

        const categoryData = await Category.find({ is_Listed: true });
            
        res.render("login", { passWrong: passwordWrongMsg, emailMsg: emailWrongMsg , categoryData });

    } catch (error) {

        console.log(error.message);
        
    }

};

//  Load Login (Get Method) :-

const verifylogin = async (req, res) => {

    const emaill = req.body.email;
    const Password = req.body.password;
    
    try {

        const verifiedUser = await User.findOne({ email: emaill, is_verified: true, is_admin: false, is_blocked: false });
        
        if (verifiedUser) { 

            const matchPass = await bcrypt.compare(Password, verifiedUser.password);

            if (matchPass) {
                
                req.session.user = verifiedUser;
                res.redirect('/');

            } else {

                req.flash('passwordWrong', "Invalid Password...");
                res.redirect('/login');

            }

        } else {

            req.flash('emailWrong', "Invalid Email...");
            res.redirect('/login');

        }
        
    } catch (error) {

        console.log(error.message);
        
    }
};

//===============================//

//  Load Logout (Post Method) :-

const loadlogout = async (req, res) => {
    
    try {

        req.session.user = undefined;
        req.flash('logoutMsg', "Logout Sccessfully...");
        res.redirect('/');
        
    } catch (error) {

        console.log(error.message);
        
    }

};


//  Load About (Get Method) :-

const loadAbout = async (req, res) => {
    
    try {

        const categoryData = await Category.find({ is_Listed: true });

        if (req.session.user) {
            
            res.render("about", { login: req.session.user , categoryData });

        } else {

            res.render("about" , {categoryData});

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//===============================//

//  Load Contact (Get Method) :-

const loadContact = async (req, res) => {
    
    try {

        const categoryData = await Category.find({ is_Listed: true });

        if (req.session.user) {
            
            res.render("contactUs", { login: req.session.user , categoryData});

        } else {

            res.render("contactUs" , {categoryData});

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//===============================//

//  Load Category (Get Method) :-

const loadCategory = async (req, res) => {
    
    try {

        const categoryData = await Category.find({ is_Listed: true });

        //  Setting Catgory :-

        const productData = await Product.aggregate([
        
            {
                $match: {
                
                  status: true,
                    
                },
              
            },
          
            {
              $lookup: {
                
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
              
              },
              
            },
          
            {
              
                $unwind: "$category",
                
            },
            
            {

                $match: {
                  
                    'category.name': req.params.id

                }
                
            }
            
        ]);

        if (req.session.user) {
           
            res.render("category-1", { login: req.session.user, productData, categoryData });

        } else {

            res.render("category-1", { productData, categoryData });

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//===============================//

//  Load All-Product (Get Method) :-

const loadAllproduct = async (req, res ) => {
    
    try {

        const limit = 6;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const totalProCount = await Product.countDocuments({ status: true });
        const totalPages = Math.ceil(totalProCount / limit);

        const categoryData = await Category.find({ is_Listed: true });
        const productDataa = await Product.find({ status: true }).populate('category').skip(skip).limit(limit);

        const productData = productDataa.filter(product => product.category.is_Listed);
        
        if (req.session.user) {
            
            res.render("products", { login: req.session.user, categoryData, productData, currentPage: page, totalPages });

        } else {

            res.render("products", { categoryData, productData, currentPage: page, totalPages });

        }
        
    } catch (error) {

        console.log(error.mess);

        
    }

};

//===============================//

//  Load Product Details (Get Method) :-

const loadPrdctDetails = async (req, res , next) => {
    
    try {

        const id = req.query.id || req.query.proId

        const categoryData = await Category.find({ is_Listed: true });      //  Category

        const productData = await Product.findOne({ _id: id });     //  Product
        
        if (req.session.user) {
            
            res.render("productDetails", { login: req.session.user , categoryData , productData});

        } else {

            res.render("productDetails", { categoryData , productData});

        }
        
    } catch (error) {

        console.log(error.message);

        console.log('reached catch');

        next(error,req,res);
        
    }

}

//===============================//

// //  Load Cart Page (Get Method) :-

// const loadCart = async (req, res) => {
    
//     try {

//         const categoryData = await Category.find({ is_Listed: true });

//         if (req.session.user) {
            
//             res.render("cart", { login: req.session.user , categoryData});

//         } else {

//             res.render("cart" , {categoryData});

//         }
        
//     } catch (error) {

//         console.log(error.message);
        
//     }

// };

//===============================//

//    Load Checkout (Get Method) :-

// const loadCheckout = async (req, res) => {
    
//     try {

//         const categoryData = await Category.find({ is_Listed: true });

//         if (req.session.user) {

//             const addresData = await Address.findOne({ userId: req.session.user._id });
//             res.render("checkout", { login: req.session.user, categoryData, addres : addresData });

//         } else {

//             res.render('checkout', { categoryData });

//         }

//     } catch (error) {

//         console.log(error.message);
        
//     }

// };

//===============================//


//  load ForgotPassword (Get Method) :-

const loadForgotPassword = async (req, res) => {
    
    try {

        const flash = req.flash('flash');

        const categoryData = await Category.find({ is_Listed: true });
        res.render("forgotpass", { categoryData , msg : flash});
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//===============================//

//  verifyEmail (Forgot Password) (Post Method) :-

const verifyEmailForgottPass = async (req, res) => {
    
    try {

        const bodyEmail = req.body.email
        const checkEmail = await User.findOne({ email: bodyEmail });

        req.session.forgotData = checkEmail;    //  Inter Email In Session

        if (checkEmail) {

            const name = checkEmail.fullName;
            
            const OTPP = generateOTP();     //  Generate OTP
            const token = generateTokenForgottPassword();  //  Generate TOKEN
            console.log("Forgott Password :- " + OTPP);

            req.session.otp = OTPP;        //   Otp save in session

            sndMailForgotPassword(name , bodyEmail, OTPP, res , token);    

        } else {

            req.flash("flash", "Invalid Email!!!");
            res.redirect("/forgotPass");

        };
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//===============================//

//  SendMail For ForgotPassword :-

const sndMailForgotPassword = async (name , email, otpp, res , token) => {
    
    try {
        
        //  Send Email Method :-
        const transporter = nodemailer.createTransport({

            service: 'gmail',
            
            auth: {
                
                user: process.env.EMAIL_USER,   //  (Email)
                pass: process.env.EMAIL_PASSWORD //  (App Password)
        
            }
        });

        //  Compose Email :-
    
        const mailOption = {

            from: 'ansalshaah786@gmail.com',
            to: email,
            subject: 'For Forgot Password Verification',
            html: `<h3> Hello ${name} Welcome to Urban</h3>
            <br><p>Enter ${otpp} on the OTP Box to Change Your Forgotten Password</p>`
        };

        //  Send Email :-
    
        transporter.sendMail(mailOption, function (error, info) {

            if (error) {

                console.log('Error Sending Email:-', error.message);

            } else {

                console.log("Email Has Been Sended:-", info.response);
            }

        });

        const tokenHashed = await secureToken(token)

        const forgotpassdData = new Otp({

            otp: otpp,
            token : tokenHashed,
            userEmail: email,
            
        });

        forgotpassdData.save();
        res.redirect(`/otpVerification?email=${email}&&token=${token}`);
        
    } catch (error) {
        
        console.log(error.message);

    }
    
};

//===============================//

//  loadConfirmPassword (Get Method) :-

const loadConfirmPassword = async (req, res) => {
    
    try {

        const forgotEmail = req.query.email
        const forgotpassMsg = req.flash("passwordChanged");

        const categoryData = await Category.find({ is_Listed: true });
        res.render("confirmPass", { categoryData, forgotEmail , msg : forgotpassMsg });
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//===============================//

//  Genrate OTP For Forgot Password :-

const generateTokenForgottPassword = () => {
    
    
    const digits = '0123456789';

    let token = '';

    for (let i = 0; i < 4; i++) {

        token += digits[Math.floor(Math.random() * 10)];
    };

    return token;

}

//===============================//

//  verifyConfirmPassword (Post Method) :-

const verifyConfirmPassword = async (req , res) => {
    
    try {

        const bodyEmail = req.body.email;
        const passwordd = req.body.password;
        const confirmPassword = req.body.confirmPassword;

        const hashPasswordd = await securePassword(passwordd);

        if (passwordd == confirmPassword) {
 
            const emailData = await User.findOne({ email: bodyEmail });

            if (emailData) {
                
                await User.findOneAndUpdate({ email: bodyEmail }, { $set: { password: hashPasswordd } });
                req.flash('passwordChanged', "Password Changed Successfully");
                res.redirect('/confirmPass');

            } 
               
        } 

    } catch (error) {

        console.log(error.message);
        
    }

};

//===============================//

//  CartAction (Get Method) :-

const cartAction = async (req, res) => {
    
    try {

        if (req.session.user) {
            
            const userIdd = req.session.user._id;

            const cartAcction = await Cart.findOne({ userId: userIdd });

            const val = cartAcction.products.length;

            res.send({ success: val });

        } else {

            res.send({success : 0})

        }
       
    } catch (error) {

        console.log(error.message);
        
    }

};


//  Search Product  :-

const searchProduct = async (req, res) => {

    try {
      
        const findProduct = req.body.items
        
        const searchedItem = await Product.find({ name: { $regex: new RegExp(`.*${findProduct}.*`, 'i') } }).populate('category');
        res.send(searchedItem);
    
    } catch (error) {
        
        console.log(error.message);
      
    }
  
};

//===============================//

//  Price Filter (Put Metthod) :-

const priceFilter = async (req, res) => {
    
    try {

        const minn = req.body.min
        const maxx = req.body.max

        if (minn && maxx) {
                
            const productPrice = await Product.find({ $and: [{ price: { $lt: Number(maxx) } }, { price: { $gt: Number(minn) } }] }).populate('category')

            if (productPrice) {
                
                res.send({ success: productPrice });

            } else {

                res.send({fail : "failed"})

            }

        } else {

            res.send({fail : "failed"})

        }

    } catch (error) {

        console.log(error.message);
        
    }

};

//===============================//

//  Acending Order Product Name (Put Method) :-

const proNameSort = async (req, res) => {
    
    try {

        const { status } = req.body;

        if (status) {
            
            const product = await Product.find({ status: true }).sort({ name: 1 }).populate('category');

            res.send(product);

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//===============================//

//  Price Low to High (Put Method) :-

const lowToHigh = async (req, res) => {
    
    try {

        const { status } = req.body;

        if (status) {
            
            const product = await Product.find({ status: true }).sort({ price: 1 }).populate('category');

            res.send(product)

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//===============================//

//  Price High To Low (Put Method) :-

const highTolow = async (req, res) => {
    
    try {

        const { status } = req.body;

        if (status) {
            
            const product = await Product.find({ status: true }).sort({ price: -1 }).populate('category');

            res.send(product);
        }
        
    } catch (error) {

        console.log(error.message);
        
    }

}

//===============================//


//  LoadWallet (Get Method) :-

const loadWallet = async (req, res) => {
    
    try {

        const categoryData = await Category.find({ is_Listed: true });

        if (req.session.user) {

            const walletData = await Wallet.findOne({ userId: req.session.user._id });

            res.render('wallet', { login: req.session.user, categoryData, walletData });

        } else {

            res.redirect('/login')

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//===============================//

//  404 Page :-

// const catchAll = async (req, res) => {
    
//     try {

//         // const categoryData = await Category.find({ is_Listed: true });

//         if (req.session.user) {
            
//             res.render('404');

//         } else {

//             res.render('404', { categoryData });

//         }
        
//     } catch (error) {

//         console.log(error.message);
        
//     }

// };

//  500 Page :_

// const catch500 = async (req, res) => {
    
//     try {

//         const categoryData = await Category.find({ is_Listed: true });

//         if (req.session.user) {
            
//             res.render('500', { login: req.session.user, categoryData });

//         } else {

//             res.render('500', { categoryData });

//         }
        
//     } catch (error) {

//         console.log(error.message);
        
//     }

// };

module.exports = {

  loadhome,
  loadlogin,
  verifylogin,
  loadsignUp,
  insertUser,
  loadOtpp,
  verifyOtpp,
  loadAbout,
//   loadCheckout,
  loadContact,
  loadlogout,
  loadResendOtp,
  loadCategory,
  loadAllproduct,
  loadPrdctDetails,
//   loadCart,
//   loadWishlist,
  loadForgotPassword,
  verifyEmailForgottPass,
  loadConfirmPassword,
  verifyConfirmPassword,
  cartAction,
  searchProduct,
  priceFilter,
//   catchAll,
  proNameSort,
  lowToHigh,
  highTolow,
  loadWallet,
//   catch500,
  
};