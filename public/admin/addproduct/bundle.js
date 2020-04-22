//------------------------------------- Import css' -------------------------------------//
//import "./app.css";
//------------------------------------- Indicate in browser console inicialization -------------------------------------//
console.log('bundle loaded');
//------------------------------------- Inicialize -------------------------------------//
const URI = '';
let inspearch = document.getElementById('nav_inpsearch');

//------------------------------------- function -------------------------------------//

function fcn_alertsw(type) {                        //Function that load a alert message at button form
  
  if (type == 1) {
    document.getElementById('adm_cardokzone').innerHTML = '\
    <div id="adm_cardok" class="alert alert-success mt-3 alert-dismissible fade show" role="alert">\
      Producto almacenado correctamente.\
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
      <span aria-hidden="true">&times;</span>\
      </button>\
    </div>';
    let cardokalert = document.getElementById('adm_cardok');
    let cardokalertInit = new Alert(cardokalert);
    setTimeout(() => {cardokalertInit.close();}, 2000);
  }else if (type == 2) {
    document.getElementById('adm_cardnokzone').innerHTML = '\
    <div id="adm_cardnok" class="alert alert-danger mt-3 alert-dismissible fade show" role="alert">\
      No se pudo almacenar el producto.\
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
      <span aria-hidden="true">&times;</span>\
      </button>\
    </div>';
    let cardnokalert = document.getElementById('adm_cardnok');
    let cardnokalertInit = new Alert(cardnokalert);
    setTimeout(() => {cardnokalertInit.close();}, 2000);
  }
  return null;
}

function readFile(input,preview) {                      //Function that create a label img whit base64 format
  if (input.files && input.files[0]) {
    let reader = new FileReader();
    reader.onload = function (e) {
      let previewZone = document.getElementById(preview);
      previewZone.innerHTML= '          \
        <img src="'+e.target.result+'"  \
          style="align-self: center;    \
          overflow: hidden;             \
          height: 175px;                \
          max-width: 200px;             \
          width: auto;" alt="">';
    }
    reader.readAsDataURL(input.files[0]);
  }
};

//------------------------------------- Even listeners -------------------------------------//

document.getElementById('adm_addform').addEventListener('submit', function(e) {   //this event listener trigger when user click button save

  let nombre = document.getElementById('adm_nombre');
  let marca = document.getElementById('adm_marca');
  let modelo = document.getElementById('adm_modelo');
  let categoria = document.getElementById('adm_categoria');
  let precio = document.getElementById('adm_precio');
  let descripcion = document.getElementById('adm_descripcion');
  let imagen = document.getElementById('adm_imagen');

  const formData = new FormData();                          //Create a FormData with all parameter from inputs
  formData.append("nombre", nombre.value);
  formData.append("marca", marca.value);
  formData.append("modelo", modelo.value);
  formData.append("categoria", categoria.value);
  formData.append("precio", precio.value);
  formData.append("descripcion", descripcion.value);
  formData.append("image", imagen.files[0]);
  
  fetch(URI+'/admin/addproduct/addone', {
      method: 'POST',                                     //Using fetch send data to route addone
      body: formData
    }).then(response => {return response.json()}).catch(err => {console.log(err);})
    .then(data => {                                       //If the route return data then inicialize all forms and show respective message
      if(data == undefined){
        const message2 = fcn_alertsw(2);
      }else{
        nombre.value = "";
        nombre.value = "";
        marca.value = "";
        modelo.value = "";
        categoria.value = "";
        precio.value = "";
        descripcion.value = "";
        imagen = undefined;
        document.getElementById('adm_labeladd').innerText = "Seleccionar imagen...";
        document.getElementById('adm_preview').innerHTML = "";
        const message1 = fcn_alertsw(1);
      }
    });
  e.preventDefault();                                     //With this function dosn't reload page

});
                                                          //Call function load image when user select a image to upload
let fileUpload = document.getElementById('adm_imagen');
fileUpload.onchange = function (e) {
    readFile(e.srcElement,'adm_preview');
    if(fileUpload.files[0].name){
      document.getElementById('adm_labeladd').innerText = "/" + fileUpload.files[0].name;
    }
};
                                                          //When user type a seach in input, then execute search
document.getElementById('nav_inpsearch').addEventListener('keydown',function (e) {
  if((e.key === 'Enter')&&(inspearch.value != '')){
    location.href = "/search/"+ inspearch.value;
  }
});
document.getElementById('nav_btnsearch').addEventListener('click',function (e) {
  if(inspearch.value != ''){
    location.href = "/search/"+ inspearch.value;
  }
});