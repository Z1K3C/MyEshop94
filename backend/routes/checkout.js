const express = require("express");                       //Call dependencies needed
const passport = require('passport');                     //Call passport module
const {Product, Client} = require('../schema.js');        //Call schemas for CRUD about table product and client
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);    //Call stripe module with its stripe secret key

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

router.get('/login',passport.authenticate('googleclient', { scope: ['email', 'profile']}));     //Call google strategy google login
  
router.get('/authcb',passport.authenticate('googleclient'),async function(req, res) {     //If USER logged succefuly with your google account then...
  if(req.isAuthenticated()){  
    const IDcliente = req.sessionID;
    const correo = req['user']['_json']['email'];
    const nombre = req['user']['_json']['given_name'];
    const verificado = req['user']['_json']['email_verified'];
    const imagePath = req['user']['_json']['picture'];

    let IDstripe ;                                                //extract information from profile google account and stripe id
    const finded = await usersearch(IDcliente);                   //update data in client table using id session client
    if(finded){
      const cliente = await Client.find({IDcliente});
      IDstripe = cliente[0]['IDstripe'] || false;
      if(IDstripe){
        IDstripe = await stripe.customers.retrieve(IDstripe);
        IDstripe = IDstripe.id || false;
      }else{
        IDstripe = await stripe.customers.create({
          name: nombre,
          email: correo
        });
        IDstripe = IDstripe.id || false;
      }
    }

    const update = await Client.findOneAndUpdate({IDcliente: IDcliente},{ IDstripe, correo, nombre, verificado, imagePath });
    res.redirect('/cart/all');                                    //redirect in cart main page
  }else{
    res.redirect('/cart/unauthorized');
  }
});

router.get('/payconfig', (req, res) => {                          //When stripe is called, I need public key
  res.send({                                                      //throw this route i send public key throw rest api
    publicKey: process.env.STRIPE_PUBLISHABLE_KEY,
    basePrice: process.env.BASE_PRICE,
    currency: process.env.CURRENCY,
  });
});

router.get('/create-checkout-session', async (req, res) => {      //Create a checkout session when the user click in buy button
  if(req.isAuthenticated()){
    const IDcliente = req.sessionID;
    const finded = await usersearch(IDcliente);                   //Extract carrito array for check all product
    let session;
    let line_items = [];                                          //create line_items empty array
    if(finded){
      const client = await Client.find({IDcliente});
      let carrito = client[0]['carrito'];
      if (carrito[1].length>0) {
        for (let i = 0; i < carrito[1].length; i++) {
          carrito[1][i] = await Product.findById({_id: carrito[1][i]});
          line_items.push({                                       //fill array with each product from carrito array 
            name: carrito[1][i]['nombre'],
            quantity: carrito[0][i],
            currency: 'mxn',
            amount: ((carrito[1][i]['precio'])*100),
            description: (carrito[1][i]['descripcion']) || ' '
          });
        };
      };
      let customer;
      if(client[0]['IDstripe']){
        customer = client[0]['IDstripe']
      }else{
        const name = req['user']['_json']['given_name'];
        const correo = req['user']['_json']['email'];
        const IDstripe = await stripe.customers.create({name: name, email: correo});
        const update = await Client.findOneAndUpdate({IDcliente: IDcliente},{ IDstripe: IDstripe.id });
        customer = IDstripe.id;
      }
      session = await stripe.checkout.sessions.create({           //create checkout session with
        payment_method_types: ['card'],                           //pay method, stripe client id, products buys, and OK/NOK URLs
        customer: customer,
        //customer_email: cliente[0]['correo'],
        line_items: line_items,
        locale: 'auto',
        success_url: 'https://myeshop94.herokuapp.com/cart/resume/{CHECKOUT_SESSION_ID}',
        cancel_url: 'https://myeshop94.herokuapp.com/cart/all',
      });
    };
    res.send({  sessionId: session.id  });                        //return session ID

  }else{
    res.redirect('/cart/unauthorized');
  }
});

router.get('/resume/:checkoutid', async (req, res) => {          //If client card passed, then...
  const session = await stripe.checkout.sessions.retrieve(req.params.checkoutid);   //redirect automatically in this route
  if(session){                                                  //and query checkout id for create a card with all products boughts
    const sclient = await stripe.customers.retrieve(session.customer);
    const IDstripe = session.customer;
    const IDcliente = req.sessionID;
    const client = await Client.find({IDcliente}) || false;
    let amount = 0;
    let imagePath;
    if(client){                                                //check this client
      const a_items = client[0]['carrito'][1].length || 0;     
      const b_items = session.display_items.length || 0;
      if((b_items>0)&&(a_items>0)&&(a_items == b_items)){       //erase cart after buy
        const update = await Client.findOneAndUpdate({IDcliente: IDcliente},{ carrito: [[],[]] });
      }
      imagePath = client[0]['imagePath'];                      //send path from google acount
    }
    for (let i = 0; i < session.display_items.length; i++) {    //amount about all product buy
      amount += (session.display_items[i]['amount'])*(session.display_items[i]['quantity']);
    }                                     
    amount = (amount/100.0).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
                                                                //render resume about all product buy
    res.render('resume.ejs',{products: session.display_items,id: session.id, name: sclient.name, amount, imagePath});
  }else{
    res.redirect('/cart/error');
  }
});

//------------------------------------- export routes -------------------------------------//

module.exports = router;