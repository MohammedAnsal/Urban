const forgotPass = async (req, res, next) => {
    
    try {

        if (req.session.forgotData) {
            
            next();

        } else {

            return res.redirect("/forgotPass");

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

module.exports = {

    forgotPass,  

}