const express = require("express");                           //Call dependencies needed
const {Product, Client, Category} = require('../schema.js');  //Call schemas for CRUD about table product, category and client

//------------------------------------- Inicialize -------------------------------------//

const router = express.Router();  
 
//------------------------------------- functions -------------------------------------//

async function usersearch(ID) {                           //Create function for search user in database
  let found = false;                                      //Inicialize "found" in false
  let client;                                             //create client variable
  const search = await Client.find();                     //storge all client in search array
  const IDcliente = ID;                                   //Storage ID from param funtion in "IDcliente"
  const allclients =  await Client.countDocuments();      //Count all clients

  if(allclients>0){                                       //If all clientes is major to zero then
    for (let i = 0; i < allclients; i++) {                //Inicialize a cycle for
      if(search[i]['IDcliente'] == ID){                   //Query all id clients search param ID, if user is found
        found = true;                                     //then exit for and return true
        i = allclients;
      }else{                  
        found = false;
      }
    }
    if(!found){                                           //if user not found, then return false and create a new client
      client = new Client({ IDcliente: IDcliente, carrito: [[],[]] });
      await client.save();
    }
  }else{                                                  //If allclients is zero, then create a new client and return false
    found = false;
    client = new Client({ IDcliente: IDcliente, carrito: [[],[]] });
    await client.save();
  }
  return found;
}

//------------------------------------- main route -------------------------------------//

router.get('/', async function(req, res) {                //if a unknown user into first time in this webpage then...
  const IDcliente = req.sessionID
  const finded = await usersearch(IDcliente);             //create a user using session ID
  const type = await Category.find(); 
  let amount = 0;

  if(finded){
    const client = await Client.find({IDcliente});
    for (let i = 0; i < client[0]['carrito'][0].length; i++) {
      amount += client[0]['carrito'][0][i];             //amount all product buying
    }
  }

  let limit =  await Product.countDocuments();           //count all products
  let products = await Product.find();                   //call all products

  for (let i = 0; i < limit; i++) {
    products[i] = products[i]['nombre'];                //extract all name product into array
  }

  limit = parseInt((limit-1)/12)+1;                    //calcule product limit for count all pages needed for 12 product for page

  let items = await Product                             //call first 12 products
                    .find()
                    //.sort({modified_at: 'desc'})
                    .limit(12)
                    .skip(0);
                                                        //render index.ejs
  res.render('index.ejs',{items,page: 1,limit, amount, type, products, finded});
});

router.get('/search/:yoursearch', async function(req, res) {    //if USER click btn search or click enter in searcher then...

  const IDcliente = req.sessionID                         
  const finded = await usersearch(IDcliente);
  const type = await Category.find();
  let amount = 0;
  if(finded){                                             //Count all product for navbar
    const client = await Client.find({IDcliente});
    for (let i = 0; i < client[0]['carrito'][0].length; i++) {
      amount += client[0]['carrito'][0][i];
    }
  }

  const nombre = req.params.yoursearch || '';
  const items = await Product.find({nombre});             //find product using the user search
  const itemsfinded = items.length || 0;

  const limit =  await Product.countDocuments();
  let products = await Product.find();

  for (let i = 0; i < limit; i++)                         //Excract all product name just for seach input navbar
    products[i] = products[i]['nombre'];
                                                          //render search.ejs
  res.render('search.ejs',{amount, type, products, items, itemsfinded, finded});
});

router.get('/about/everthing', async (req, res) => {      //If USER into tthis page then render about.ejs
  const IDcliente = req.sessionID                         //These lines using for navbar, searcher and cart count indicator
  const finded = await usersearch(IDcliente);
  const type = await Category.find();
  let amount = 0;

  if(finded){
    const client = await Client.find({IDcliente});
    for (let i = 0; i < client[0]['carrito'][0].length; i++) {
      amount += client[0]['carrito'][0][i];
    }
  }

  let limit =  await Product.countDocuments();
  let products = await Product.find();

  for (let i = 0; i < limit; i++) {
    products[i] = products[i]['nombre'];
  }

  res.render('about.ejs',{amount, type, products, finded});
});

router.get('/about/features', async (req, res) => {       //If USER into this page then render features.ejs
  const IDcliente = req.sessionID                         //These lines using for navbar, searcher and cart count indicator
  const finded = await usersearch(IDcliente);
  const type = await Category.find();
  let amount = 0;

  if(finded){
    const client = await Client.find({IDcliente});
    for (let i = 0; i < client[0]['carrito'][0].length; i++) {
      amount += client[0]['carrito'][0][i];
    }
    
  }

  let limit =  await Product.countDocuments();
  let products = await Product.find();

  for (let i = 0; i < limit; i++) {
    products[i] = products[i]['nombre'];
  }

  res.render('features.ejs',{amount, type, products, finded});
});

//------------------------------------- page routes -------------------------------------//

router.get('/:id',async function(req, res) {            //If USER type in explorer /anydata then...
  const IDcliente = req.sessionID                       
  const finded = await usersearch(IDcliente);
  const type = await Category.find();
  let amount = 0;

  if(finded){
    const client = await Client.find({IDcliente});
    for (let i = 0; i < client[0]['carrito'][0].length; i++) {
      amount += client[0]['carrito'][0][i];
    }
  }

  let limit =  await Product.countDocuments();
  let page = req.params.id;                           //extract "anydata" for indicate the page

  let products = await Product.find();

  for (let i = 0; i < limit; i++) {
    products[i] = products[i]['nombre'];
  }

  limit = parseInt((limit-1)/12)+1;
  
  if(page <= limit){
    let skip = (page-1) * 12;
    let items = await Product
                      .find()
                      .limit(12)
                      .skip(skip);                    //render pages.ejs with 12 products depend user page indicate
    res.render('pages.ejs',{items,page,limit,amount,type,products, finded});
  }else{
    res.redirect('/'+limit);
  }

});

router.get('/categoria/:id', async (req, res) => {    //if USER click buttton categorie option...
  const items = await Product.find({categoria: req.params.id});   //search all product with this categorie
  const IDcliente = req.sessionID
  const finded = await usersearch(IDcliente);
  const type = await Category.find();
  let amount = 0;

  if(finded){
    const client = await Client.find({IDcliente});
    for (let i = 0; i < client[0]['carrito'][0].length; i++) {
      amount += client[0]['carrito'][0][i];
    }
  }

  let limit =  await Product.countDocuments();
  let products = await Product.find();

  for (let i = 0; i < limit; i++) {
    products[i] = products[i]['nombre'];
  }
                                                      //render products with this categorie
  res.render('categories.ejs',{items,amount,type,products, finded});
});

router.get('/query/categories', async (req, res) => {   //only search all categories and send throw rest api
  let categories = await Category.find();
  res.json(categories);
});

//------------------------------------- export routes -------------------------------------//

module.exports = router;