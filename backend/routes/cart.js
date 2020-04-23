const express = require("express");                       //Call dependencies needed
const {Product, Client} = require('../schema.js');        //Call schemas for CRUD about table product and client

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

router.post('/add', async (req, res) => {               //if USER clicked button add then...
  const IDcliente = req.sessionID
  const finded = await usersearch(IDcliente);           //Search client in table client
  let amount = 0;
  let equalprod;

  if(finded){                                           
    let client = await Client.find({IDcliente});        
    let cart = client[0]['carrito'];                    //Check array "carrito" from client
    equalprod = false;

    if(cart[1].length > 0){
      for (let i = 0; i < cart[1].length; i++) {
        if(cart[1][i] == req.body.product){             //if the product sended for client exist in array carrito, then
          cart[0][i]++;                                 //increase the value
          equalprod =true;
        }
      }
      if(!equalprod){                                   //If the product sended for cliente dosn't exist in array carrito, then
        cart[0].push(1);                                //add product in array and set the quantity in 1
        cart[1].push(req.body.product);
      }
    }else{
      cart[0].push(1);
      cart[1].push(req.body.product);
    }
    const updated = await Client.findOneAndUpdate({IDcliente: IDcliente},{carrito: cart});  //Update information in table client
    client = await Client.find({IDcliente});
    for (let i = 0; i < client[0]['carrito'][0].length; i++) {    //Send client all amount for your products in cart counter
      amount += client[0]['carrito'][0][i];
    }
    
  }
  res.json({'message': 'Producto agregado al carrito','items': null, amount});
  
});
  
router.get('/all', async (req, res) => {                //If USER clicked button cart, then...
  const IDcliente = req.sessionID;
  const finded = await usersearch(IDcliente);           //Search this client...
  let cart = [[],[]];                                   //Inicialize empty variables
  let amount = 0;
  let subtotal = 0;
  let total = 0;
  let logged = req.isAuthenticated() || false;          //Check if USER loggin previusly
  let email = false;

  if(finded){
    const client = await Client.find({IDcliente});      //Check carrito array from client
    cart = client[0]['carrito'];                        //In array carrito only save ID product, then
    if (cart[1].length>0) {
      for (let i = 0; i < cart[1].length; i++) {
        cart[1][i] = await Product.findById({_id: cart[1][i]});   //Call complete product and save in array carrito, only save in this
        amount += cart[0][i];                                     //variable, in database table client dosn't change
        subtotal += (cart[0][i])*(cart[1][i]['precio']);
        total += (cart[0][i])*(cart[1][i]['precio']);
      }
    }
  }

  if(logged){
      email = req['user']['_json']['email'];              
  }
  res.render('bought.ejs',{cart,amount,subtotal,total,logged,email,finded});     //Send all product that USER selected previously and render bought page
  
});

router.post('/plus', async (req, res) => {             //If USER clicked button plus into cart page, then...
  const IDcliente = req.sessionID;
  const finded = await usersearch(IDcliente);          //Search this client...
  const product = req.body.product;                    //Search specify product
  let cart = [[],[]];                                  //Inicialize empty variables
  let productONE;
  let amount = 0;
  let subtotal = 0;
  let total = 0;
  let plusreturn = 0;

  if(finded){
    const client = await Client.find({IDcliente});    //Check carrito array from client
    cart = client[0]['carrito'];
    if(cart[1].length>0){
      for (let i = 0; i < cart[1].length; i++) {
        if(cart[1][i] == product){
          cart[0][i]++;                               //Increace value for this product
          plusreturn = cart[0][i];
          const updated = await Client.findOneAndUpdate({IDcliente: IDcliente},{carrito: cart});    //Update carrito array
        }
        productONE = await Product.findById({_id: cart[1][i]});
        amount += cart[0][i];
        subtotal += (cart[0][i])*(productONE['precio']);
        total += (cart[0][i])*(productONE['precio']);
      }
    }
    res.json({plusreturn,amount,subtotal,total});     //Response throw rest api and update value in cart page
  }

});

router.post('/minus', async (req, res) => {           //If USER clicked button minus into cart page, then...
  const IDcliente = req.sessionID;
  const finded = await usersearch(IDcliente);         //Search this client...
  const product = req.body.product;                   //Search specify product
  let cart = [[],[]];                                 //Inicialize empty variables
  let productONE;
  let amount = 0;
  let subtotal = 0;
  let total = 0;
  let minusreturn = 0;

  if(finded){
    const client = await Client.find({IDcliente});    //Check carrito array from client
    cart = client[0]['carrito'];
    if(cart[1].length>0){
      for (let i = 0; i < cart[1].length; i++) {
        if(cart[1][i] == product){
          if(cart[0][i] > 0){
            cart[0][i]--;                             //Decrease value for this product
              minusreturn = cart[0][i];
          }else{
            cart[0][i] = 0;
              minusreturn = cart[0][i];           
          }
          const updated = await Client.findOneAndUpdate({IDcliente: IDcliente},{carrito: cart});    ///Update carrito array
        }
        productONE = await Product.findById({_id: cart[1][i]});
        amount += cart[0][i];
        subtotal += (cart[0][i])*(productONE['precio']);
        total += (cart[0][i])*(productONE['precio']);
      }
    }
    res.json({minusreturn,amount,subtotal,total});    //Response throw rest api and update value in cart page
  }

});

router.post('/trash', async (req, res) => {           //If USER clicked button trash into cart page, then...
  const IDcliente = req.sessionID;
  const finded = await usersearch(IDcliente);         //Search this client...
  const product = req.body.product;                   //Search specify product
  let cart = [[],[]];                                 //Inicialize empty variables
  let productONE;
  let amount = 0;
  let subtotal = 0;
  let total = 0;

  if(finded){
    let client = await Client.find({IDcliente});      //Check carrito array from client
    cart = client[0]['carrito'];
    if(cart[1].length>0){
      for (let i = 0; i < cart[1].length; i++) {
        if(cart[1][i] == product){
          cart[0].splice(i,1);                        //remove product id and quantity in carrito array
          cart[1].splice(i,1);
          const updated = await Client.findOneAndUpdate({IDcliente: IDcliente},{carrito: cart});    //update this in table client
          i = cart[1].length + 1;
        }
      }
    }
    client = await Client.find({IDcliente});          //Search actual carrito client for...
    cart = client[0]['carrito'];                      //send values about total and quantity products in carrito array
    if(cart[1].length>0){
      for (let i = 0; i < cart[1].length; i++) {
        productONE = await Product.findById({_id: cart[1][i]});
        amount += cart[0][i];
        subtotal += (cart[0][i])*(productONE['precio']);
        total += (cart[0][i])*(productONE['precio']);
      }
    }
    res.json({amount,subtotal,total});                //Response throw rest api
  }

});

router.post('/edit', async (req, res) => {            //If USER modified field value into cart page, then..
  const IDcliente = req.sessionID;
  const finded = await usersearch(IDcliente);         //Search this client...
  const product = req.body.product;                   //Search specify product
  const value = req.body.value;                       //Inicialize empty variables
  let cart = [[],[]];
  let productONE;
  let amount = 0;
  let subtotal = 0;
  let total = 0;

  if(finded){
    let client = await Client.find({IDcliente});      //Check carrito array from client
    cart = client[0]['carrito'];
    if(cart[1].length>0){
      for (let i = 0; i < cart[1].length; i++) {
        if(cart[1][i] == product){
          if(value>0){
            cart[0][i] = Number(value);               //Update value from form
          }else{
            cart[0][i] = 0;
          }
        const updated = await Client.findOneAndUpdate({IDcliente: IDcliente},{carrito: cart});    //update this in table client
        }
      }
    }
    client = await Client.find({IDcliente});          //Search actual carrito client for...
    cart = client[0]['carrito'];                      //send values about total and quantity products in carrito array
    if(cart[1].length>0){
      for (let i = 0; i < cart[1].length; i++) {
        productONE = await Product.findById({_id: cart[1][i]});
        amount += cart[0][i];
        subtotal += (cart[0][i])*(productONE['precio']);
        total += (cart[0][i])*(productONE['precio']);
      }
    }
    res.json({amount,subtotal,total,value});           //Response throw rest api
  }
});
  
//------------------------------------- export routes -------------------------------------//

module.exports = router;