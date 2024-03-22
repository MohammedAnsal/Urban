//  Set env :-
const dotenv = require('dotenv').config();

//  Connect Mongoose :-
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);

const express = require('express');
const app = express();

//  Set Session :-
const session = require('express-session');
app.use(session({

    secret: "&##$",
    resave: false,
    saveUninitialized: true

}));

//  Set Nocache :-
const nocache = require('nocache');
app.use(nocache());

//  Set Path :-
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

//  Set View Engine :-
app.set('view engine', 'ejs');

//  Set Body-Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  Set flash :-
const flash = require('express-flash');
app.use(flash());

//  User route :-
const userRoute = require('./routers/user_route');
app.use('/', userRoute);

//  Admin route :-
const adminRoute = require('./routers/admin_router');
app.use('/admin', adminRoute);

//  404 Page :-
app.get('*', (req, res) => {
    
    res.redirect('/404');

});

const PORT = process.env.PORT || 7007;

app.listen(PORT, () => { console.log(`Server Running http://localhost:${PORT}`)});