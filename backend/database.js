const mongoose = require('mongoose');                              //Call mongoose module for create connection with mongodb

mongoose.connect(process.env.MONGO_DB_URI,{                       //Call connect method with URI and configuration             
  useNewUrlParser: true,                                          
  useUnifiedTopology: true,
  useFindAndModify: false 
}).catch(function (err) { console.log('error',err.message)})      //If exist a error, print message
  .then(function (db) { if(db){console.log('DB connected')} });   //if connection complety succefully, then print OK message
  