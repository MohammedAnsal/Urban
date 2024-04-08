
const errorHandler = (err, req, res, next) => {
    
    if (err instanceof SyntaxError) {
      
        res.status(400).send("Invalid JSON in request body");
        
    } else if (err.name === "ValidationError") {
        
        res.status(500).render('500')
        
    } else {
                
        res.status(404).render("404", { error: err });
        
    }
    
};

module.exports = errorHandler;
