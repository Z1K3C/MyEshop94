//------------------------------------- Indicate in browser console inicialization -------------------------------------//
console.log('edit product loaded');
//------------------------------------- Inicialize -------------------------------------//
const URI = '';
//------------------------------------- function -------------------------------------//
function readFile(input,preview) {                        //Function that create a label img whit base64 format
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
document.getElementById('edt_addform').addEventListener('submit', function(e) {      //this event listener trigger when user click button save

  let nombre = document.getElementById('edt_nombre');
  let marca = document.getElementById('edt_marca');
  let modelo = document.getElementById('edt_modelo');
  let categoria = document.getElementById('edt_categoria');
  let precio = document.getElementById('edt_precio');
  let descripcion = document.getElementById('edt_descripcion');
  let imagen = document.getElementById('edt_imagen');
  let filename = document.getElementById('edt_filename');
  let btns = document.getElementById('edt_addform').getElementsByClassName('btn');

  const formData = new FormData();                           //Create a FormData with all parameter from inputs
  formData.append("id",btns[0].id)
  formData.append("nombre", nombre.value);
  formData.append("marca", marca.value);
  formData.append("modelo", modelo.value);
  formData.append("categoria", categoria.value);
  formData.append("precio", precio.value);
  formData.append("descripcion", descripcion.value);
  if(imagen.files[0]){
    formData.append("image", imagen.files[0]);
    formData.append("filename", filename.innerHTML);
  }else{
    formData.append("image", false);
    formData.append("filename", false);
  }

  fetch(URI+'/admin/edit/editone', {
      method: 'POST',                                       //Using fetch send data to route addone
      body: formData
    }).then(response => {return response.json()}).catch(err => {console.log(err);})
    .then(data => {
      location.href='/admin/allproduct';                    //If the route return data then redirect to all products page
    });
    
  e.preventDefault();  
});
                                                            //Call function load image when user select a image to upload
let fileUpload = document.getElementById('edt_imagen');
fileUpload.onchange = function (e) {
    readFile(e.srcElement,'edt_preview');
    if(fileUpload.files[0].name){
      document.getElementById('edt_labeladd').innerText = "/" + fileUpload.files[0].name;
    }
};