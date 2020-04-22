const passport = require('passport');                               //Call passport module     
const GoogleStrategy = require('passport-google-oauth20').Strategy; //Call google passport module with authenticate protocol oauth2.0

passport.use('googleadmin',new GoogleStrategy({                     //Inicialize first google strategy for use in admin routes
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/admin/authcb/"
  },function(accessToken, refreshToken, profile, cb) {
    cb(null, profile);
}));

passport.use('googleclient',new GoogleStrategy({                    //Inicialize second strategy for that just clients
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/cart/authcb/"
},function(accessToken, refreshToken, profile, cb) {
  cb(null, profile);
}));

passport.serializeUser((user, cb) => {                              //Serialize sessin ID with google authentification
  cb(null, user);
});
passport.deserializeUser((obj, cb) => {                             //Deserialize sessin ID with google authentification
  cb(null, obj);
});