const User = require('../models/user_model');

const user = async (req, res, next) => {
    
    try {

        if (!req.session.user) {

            return res.redirect('/login');

        } else {

            next();

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

const  loginTrue = async (req, res, next) => {
    
    try {
    
        if (req.session.user) {
            
            return res.redirect('/');

        }

        next()
        
    } catch (error) {

        console.log(error.message);
        
    }

};

//  User login after blocking admin :-

const isBlocked = async (req, res, next) => {
    
    try {

        if (req.session.user) {
            
            const userData = await User.findOne({ _id: req.session.user._id });

            if (userData.is_blocked == true) {
                
                delete req.session.user;
                return res.redirect('/login');

            } else {

                next()

            }

        } else {

            next()

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

}

module.exports = {

    user,
    loginTrue,
    isBlocked,

}