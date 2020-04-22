if (process.env.NODE_ENV !== 'production') {                    //if this project is in production mode, then...
    require('dotenv').config();                                 //load dotenv module
} 

const express = require('express');                             //Load express module for use server methos most easy                    
//const cors = require('cors');                                 //load cors module for share information between two local servers app.use(cors());
const multer = require('multer');                               //Load multer module for upload image
const session = require('express-session');                     //load session for use id throw cookie and share data between paths/routes
const passport = require('passport');                           //Load passport for use credencials
const path = require('path');                                   //Load path for join directory most easy
const { v4: uuidv4 } = require('uuid');                         //Load uuidv4 for create filenames
const ejs = require('ejs');                                     //Load ejs for use EJS engine tamplates

//------------------------------------- Inicialize -------------------------------------//
const app = express();                                          //Inicialize app as instance express
require('./database.js');                                       //Inicialize connection database
require('./passport.setup.js');                                 //Inicialize passport parameter as strategy, etc.

//------------------------------------- Settigns -------------------------------------//
app.set('port', process.env.PORT || 3000);                      //Config port
app.set('views', path.join(__dirname, '../frontend/views'));    //Config views route
app.set('view engine', 'ejs');                                  //Config engine use

//------------------------------------- Middleware -------------------------------------//
const storage = multer.diskStorage({                            //Config multer 
    destination: path.join(__dirname, '../public/upload'),
    filename(req, file, cb) {
        cb(null, uuidv4() + path.extname(file.originalname));
    }
})
app.use(multer({storage}).single('image'));                   
app.use(express.urlencoded({extended: false}));                 //Urlencoded help to send/receive info between forms and roputes
app.use(express.json());                                        //with this We can json format for send/receive data throw rest/api
app.use(session({                                               //Config sessions
    secret: 'secret',                                  
    resave: true,                                       
    saveUninitialized: true                             
}));
app.use(passport.initialize());                                 //Inicialize passport
app.use(passport.session()); 

//------------------------------------- Call routes -------------------------------------//
app.use('/', require('./routes/main.js'));
app.use('/cart', require('./routes/cart.js'));
app.use('/cart', require('./routes/checkout.js'));
app.use('/admin', require('./routes/admin.js'));

//------------------------------------- Static files -------------------------------------//

app.use(express.static(path.join(__dirname, '../public')));     //Inicialize route with static files

//------------------------------------- Error manage -------------------------------------//

app.use(function(req, res, next) {                              //If user access to route not declare, this is redirect with error message
    res.status(404).sendFile(path.join(__dirname, '../public/error/index.html'));
});
  
//------------------------------------- Start server -------------------------------------//
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);           //Print in console this message
});