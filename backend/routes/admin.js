const express = require("express");                       //Call dependencies needed
const moment = require('moment');  
const passport = require('passport');
const path = require('path');
const cloudinary = require('cloudinary');
const { remove } = require('fs-extra');
const {Product, Category} = require('../schema.js');      //Call schemas for CRUD about table product and category

//------------------------------------- Inicialize -------------------------------------//

const router = express.Router();  
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});
 
//------------------------------------- routes -------------------------------------//

router.get('/login',passport.authenticate('googleadmin', { scope: ['email', 'profile']}));    //Call google strategy google login

router.get('/authcb',passport.authenticate('googleadmin'),(req, res) => {   //If USER is authorized, redirect route main
  if(req.isAuthenticated()){
    if((req['user']['_json']['given_name'] === process.env.USERAUTH_NAME) 
    && (req['user']['_json']['email'] === process.env.USERAUTH_EMAIL) 
    && (req['user']['_json']['email_verified'])){
      res.redirect('/admin/main');
    }else{                                                                        //if USER is unauthotized this user redirect
      req.logout();                                                               //error message
      res.redirect('/admin/unauthorized');
    }
  }else{
    res.redirect('/admin/unauthorized');
  }
});

router.get('/logout', async (req, res) => {                                 //If USER wish logged, this redirect about route
  if(req.isAuthenticated()){
    req.logout();
    res.redirect('/about/everthing');
  }else{
    res.redirect('/admin/unauthorized');
  }
});

router.get('/main', async (req, res) => {                                   //if USER is authorized, render admin main page
  if(req.isAuthenticated()
    && (req['user']['_json']['given_name'] === process.env.USERAUTH_NAME) 
    && (req['user']['_json']['email'] === process.env.USERAUTH_EMAIL) 
    && (req['user']['_json']['email_verified'])){
    res.render('admin/admin.ejs', {user: req['user']['_json']});
  }else{
    res.redirect('/admin/unauthorized');
  }
});

router.get('/addproduct', async (req, res) => {                             //if USER is authorized, render add product form
  if(req.isAuthenticated()
    && (req['user']['_json']['given_name'] === process.env.USERAUTH_NAME) 
    && (req['user']['_json']['email'] === process.env.USERAUTH_EMAIL) 
    && (req['user']['_json']['email_verified'])){

      const type = await Category.find() || false;
      let limit =  await Product.countDocuments();
      let products = await Product.find() || false;
      for (let i = 0; i < limit; i++) {
        products[i] = products[i]['nombre'];
      }
      res.render('admin/addproduct.ejs', {type , products});                  //Load all categories and products names in addproduct.ejs

  }else{
    res.redirect('/admin/unauthorized');
  }
});

router.get('/allproduct', async (req, res) => {                             //if USER is authorized, render all product pages
  if(req.isAuthenticated()
    && (req['user']['_json']['given_name'] === process.env.USERAUTH_NAME) 
    && (req['user']['_json']['email'] === process.env.USERAUTH_EMAIL) 
    && (req['user']['_json']['email_verified'])){

    const type = await Category.find() || false;
    res.render('admin/allproduct.ejs', {type});                               //Load all categories in allproduct.ejs

  }else{
    res.redirect('/admin/unauthorized');
  }
});

router.get('/allproduct/query', async (req, res) => {                       //if USER is authorized, send data throw restapi

  if(req.isAuthenticated()
    && (req['user']['_json']['given_name'] === process.env.USERAUTH_NAME) 
    && (req['user']['_json']['email'] === process.env.USERAUTH_EMAIL) 
    && (req['user']['_json']['email_verified'])){

      let arr_categories = [];                                                //inicialize a array when will storage all categories
      let arr_alleachcat = await Category.countDocuments();
      arr_alleachcat = new Array(arr_alleachcat);                             //Inicialize arrays when will storage all products
      const query1 = await Category.find();                                   //separate for categories
      query1.forEach(function(inf,ind){ 
        arr_categories.push(inf['nombre']);
        arr_alleachcat[ind] = [];
      });
      const query2 = await Product.find();                                    
      query2.forEach(function(inf,ind){                                       //for each product storaged, divide for categorie and
        for (let i = 0; i < arr_categories.length; i++) {                     //save in arr_alleachcat
          if(arr_categories[i] == inf['categoria'] ){
            arr_alleachcat[i].push(inf);
          }
        }
      });
      res.json({query1: arr_categories,query2: arr_alleachcat});              //send information throw restapi

  }else{
    res.json({query1: false,query2: false});
  }

});

router.post('/addproduct/addone', async (req, res) => {                     //if USER is authorized, send data throw restapi
  if(req.isAuthenticated()
    && (req['user']['_json']['given_name'] === process.env.USERAUTH_NAME) 
    && (req['user']['_json']['email'] === process.env.USERAUTH_EMAIL) 
    && (req['user']['_json']['email_verified'])){

      const { nombre, marca, modelo, categoria, precio } = req.body;          //Storage data from form and storage in table product
      const descripcion = req.body.descripcion || '';
      const created_at = moment().format("hh:mma DD[/]MMM[/]YY");
      const modified_at = moment().format("hh:mma DD[/]MMM[/]YY");          
      const newItem = new Product({ nombre, marca, modelo, categoria, precio, descripcion, created_at, modified_at });
      if(req.file != undefined){                                              //if user sended image, then save filename in database
        newItem.imagePath = req.file.path || false;
        if(newItem.imagePath){
          const cloudinaryU = await cloudinary.v2.uploader.upload(newItem.imagePath);
          const erase = await remove(path.resolve('./public/upload/' + req.file.filename));
          newItem.imagePath = cloudinaryU.url;
          newItem.filename = cloudinaryU.public_id + '.' + cloudinaryU.format;
        }
      }
      const saved = await newItem.save();
      res.json({'message': 'producto almacenado','items': null});

  }else{
    res.json({'message': false,'items': false});
  }
});

router.get('/edit/:id', async (req, res) => {                               //if USER is authorized, render editproduct page

  if(req.isAuthenticated()
    && (req['user']['_json']['given_name'] === process.env.USERAUTH_NAME) 
    && (req['user']['_json']['email'] === process.env.USERAUTH_EMAIL) 
    && (req['user']['_json']['email_verified'])){

      const item = await Product.findById(req.params.id);                   //Search product using id
      const type = await Category.find();
      if(item){
        res.render('admin/editproduct.ejs', {item, type});
      }

  }else{
    res.redirect('/admin/unauthorized');
  }

});

router.post('/edit/editone', async (req, res) => {                          //if USER ended edit product then it updated this product

  if(req.isAuthenticated()
    && (req['user']['_json']['given_name'] === process.env.USERAUTH_NAME) 
    && (req['user']['_json']['email'] === process.env.USERAUTH_EMAIL) 
    && (req['user']['_json']['email_verified'])){

      const { nombre, marca, modelo, categoria, precio } = req.body;
      const descripcion = req.body.descripcion || '';
      const modified_at = moment().format("hh:mma DD[/]MMM[/]YY");
      const updated = await Product.findByIdAndUpdate(req.body.id, { nombre, marca, modelo, categoria, precio, descripcion, modified_at });
      if(req.file != undefined){                                            //If USER selected a image, then update filename and erase old image
        let imagePath = req.file.path || false;
        if(imagePath){
          let filename = req.body.filename;
          filename = filename.slice(0,20);
          const cloudinaryD = await cloudinary.v2.uploader.destroy(filename);
          const cloudinaryU = await cloudinary.v2.uploader.upload(imagePath);
          const erase = await remove(path.resolve('./public/upload/' + req.file.filename));
          imagePath = cloudinaryU.url;
          filename = cloudinaryU.public_id + '.' + cloudinaryU.format;
          const imageup = await Product.findByIdAndUpdate(req.body.id, { imagePath, filename });
        }
      }
      res.json({message: 'product edited'});

    }else{
      res.json(false);
    }

});

router.delete('/launch/', async (req, res) => {                             //If USER push delete button, then erase this product
                                                                            //from table product and erase image from uplad folder
  if(req.isAuthenticated()
    && (req['user']['_json']['given_name'] === process.env.USERAUTH_NAME) 
    && (req['user']['_json']['email'] === process.env.USERAUTH_EMAIL) 
    && (req['user']['_json']['email_verified'])){

      const item = await Product.findByIdAndDelete(req.body.id);
      let filename = item.filename;
      filename = filename.slice(0,20);
      const cloudinaryD = await cloudinary.v2.uploader.destroy(filename);
      res.json({message: 'product deleted'});

  }else{
    res.json(false);
  }

});

router.get('/addcategorie', async (req, res) => {                           //if USER is authorized, send data throw restapi
  const categories = await Category.find(); 
  res.render('admin/addcategorie.ejs',{categories});
});

router.post('/categories/addone', async (req, res) => {                     //If USER add a categorie in form, then add these value 
                                                                            //in categorie table
  if(req.isAuthenticated()
  && (req['user']['_json']['given_name'] === process.env.USERAUTH_NAME) 
  && (req['user']['_json']['email'] === process.env.USERAUTH_EMAIL) 
  && (req['user']['_json']['email_verified'])){

    const { nombre, path } = req.body;
    if(nombre && path){
      const newcat = new Category({ nombre, path });
      const catsaved = await newcat.save();
      const type = await Category.find();
      res.json({message: 'categoria almacenada', type: type});
    }else{
      res.json({message: 'error al almacenar', type: false});
    }

  }else{
    res.json({message: 'error', type: false});
  }

});

router.post('/categories/editone', async (req, res) => {                    //If USER push edit btn, then these values are sending to form

  if(req.isAuthenticated()
  && (req['user']['_json']['given_name'] === process.env.USERAUTH_NAME) 
  && (req['user']['_json']['email'] === process.env.USERAUTH_EMAIL) 
  && (req['user']['_json']['email_verified'])){

    const { categorie } = req.body;
    const item = await Category.findOne({_id: categorie});
    if(item){
      res.json({message: 'categoria encontrada', item: item});
    }else{
      res.json({message: 'categoria no encontrada', item: false});
    }

  }else{
    res.json({message: false, item: false});
  }

});

router.post('/categories/edited', async (req, res) => {                     //If USER end edit the categorie, then these values change in
                                                                            //categorie table
  if(req.isAuthenticated()
  && (req['user']['_json']['given_name'] === process.env.USERAUTH_NAME) 
  && (req['user']['_json']['email'] === process.env.USERAUTH_EMAIL) 
  && (req['user']['_json']['email_verified'])){

    const { id, nombre, path } = req.body;
    if(id && nombre && path){
      const updated = await Category.findByIdAndUpdate({_id: id}, { nombre, path });
      const type = await Category.find();
      res.json({message: 'categoria actualizada', type: type});
    }else{
      res.json({message: 'error al actualizar', type: false});
    }

  }else{
    res.json({message: false, type: false});
  }

});

router.delete('/categories/launch', async (req, res) => {                   //If USER push delete btn, then these values are erase from 
                                                                            //categorie table
  if(req.isAuthenticated()
  && (req['user']['_json']['given_name'] === process.env.USERAUTH_NAME) 
  && (req['user']['_json']['email'] === process.env.USERAUTH_EMAIL) 
  && (req['user']['_json']['email_verified'])){

    const { categorie } = req.body;
    if(categorie){
      const item = await Category.findByIdAndDelete({_id: categorie});
      res.json({message: 'producto eliminado', item: item});
    }else{
      res.json({message: 'error al eliminar', item: false});
    }

  }else{
    res.json({message: false, item: false});
  }

});

//------------------------------------- export routes -------------------------------------//

module.exports = router;