const { Schema, model } = require('mongoose');              //Call methods schema and model from mongoose for create tables that after
const moment = require('moment');                           //storage in database

//------------------------------------- Product schema -------------------------------------//

const prodschema = new Schema({
    nombre: { type: String, required: true },
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    categoria: { type: String, required: true },
    precio: { type: String, required: true },
    descripcion: { type: String, default: '' },
    imagePath: { type: String, required: true },
    filename: { type: String, required: true },
    created_at: { type: String, default: function() {  return moment().format(); } },
    modified_at: { type: String, default: function() {  return moment().format(); } }
});

//------------------------------------- Client schema -------------------------------------//

const clientschema = new Schema({
    IDcliente: { type: String, required: true },
    IDstripe: { type: String, default: ""},
    carrito: { type: Array, default: [[],[]] },
    correo: { type: String, default: ""},
    nombre: { type: String, default: ""},
    verificado: { type: Boolean, default: false},
    imagePath: { type: String, default: ""},
});

//------------------------------------- Category schema -------------------------------------//

const categschema = new Schema ({
    nombre: {type: String, required: true},
    path: {type: String, default: '/'},
    created_at: { type: String, default: function() {  return moment().format(); } },
});

//------------------------------------- Export Schemas -------------------------------------//

module.exports.Product = model('Product', prodschema);
module.exports.Client = model('Client', clientschema);
module.exports.Category = model('Category', categschema);