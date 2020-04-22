console.log('categories loaded');
const URI = '';

let inputname = document.getElementById('cat_inpname');
let checkbox = document.getElementById('cat_checkbox');
let inputpath = document.getElementById('cat_inppath');
let formbtns = document.getElementById('cat_formadd').getElementsByClassName('btn');
let btns = document.getElementById('cat_allcats').getElementsByClassName('btn');

function toastgenerate(par) {
  let bodytoast = '';
  par.forEach(function(inf,ind){

    bodytoast += '\
    <div id="card_'+ inf['_id'] +'" class="py-1"><div  class="toast" role="alert" aria-live="assertive" aria-atomic="true">\
      <div class="toast-header">\
        <strong class="mr-auto">'+ inf['nombre'] +'</strong>\
        <small>'+ inf['created_at'] +'</small>\
      </div>\
      <div class="toast-body py-1">\
        <section class="row justify-content-between">\
          <div class="col-6 text-left align-self-center">'+ inf['path'] +'</div>\
          <div class="col-6 text-right">\
            <div class="btn-group btn-block" role="group" aria-label="Basic example">\
              <button id="btne_'+ inf['_id'] +'" class="btn btn-outline-primary btn-sm w-50">\
                Editar  <i id="btne_'+ inf['_id'] +'" class="fas fa-tools"></i>\
              </button>\
              <button id="btnd_'+ inf['_id'] +'" class="btn btn-outline-danger btn-sm w-50">\
                Eliminar  <i id="btnd_'+ inf['_id'] +'" class="fas fa-dumpster-fire">\
              </i></button>\
            </div>\
          </div>\
        </section>\
      </div>\
    </div></div>'

  });
  
  return bodytoast;
}

function btnswatcher(arr_btns) {

  for (let i = 0; i < arr_btns.length; i++) {
    arr_btns[i].addEventListener("click", function(e) {

      let btnid = e.srcElement.id;
      let btntype = btnid.slice(3,4);
      btnid = btnid.substr(5);                                                       //extract id product from button and...
      const formData = new FormData();                                      
      formData.append("categorie", btnid);
  
      if(btntype == 'e'){                                                           //if user clicked btn edit then edit categorie
        
        fetch(URI+'/admin/categories/editone', {
          method: 'POST',
          body: formData
        }).then(response => {return response.json()}).catch(err => {console.log(err);})
        .then(data => {
          if(data.item){        
            inputname.value = data.item['nombre'];
            let path = data.item['path'];
            path = path.substr(11);
            inputpath.value = path;
  
            formbtns[0].style.display = 'none';
            formbtns[1].style.display = '';
            formbtns[1].id = data.item['_id'];
              
          }
        });
  
      }else if(btntype == 'd'){                                                 //if user clicked btn trash then delete categorie
  
        
        fetch(URI+'/admin/categories/launch', {
          method: 'DELETE',
          body: formData
        }).then(response => {return response.json()}).catch(err => {console.log(err);})
        .then(data => {
          if(data.item){
            document.getElementById('card_'+ btnid).innerText = "";
          }
        });

      }
  
    });
    
  }
  return null;

}

checkbox.addEventListener('click',function (e) {
  if(checkbox.checked){
    inputpath.value = " ";
    inputpath.readOnly = false;
  }else{
    inputpath.value = inputname.value;
    inputpath.readOnly = true;
  }
})

inputname.addEventListener('keyup',function(e) {
  if(!checkbox.checked){
    inputpath.value = inputname.value;
  }
});

formbtns[0].addEventListener('click',function (e) {

  const formData = new FormData();
  formData.append("nombre",inputname.value)
  formData.append("path", ('/categoria/' + inputpath.value));

  console.log('salvar');
  fetch(URI+'/admin/categories/addone', {
    method: 'POST',                                       //Using fetch send data to route addone
    body: formData
  }).then(response => {return response.json()}).catch(err => {console.log(err);})
  .then(data => {
    if(data){

      const alltoasts = toastgenerate(data.type);
      document.getElementById('cat_allcats').innerHTML = alltoasts;
      const execute_watcher = btnswatcher(btns);
      inputname.value = "";
      inputpath.value = "";
      checkbox.checked = false;

    }
  });
});

formbtns[1].addEventListener('click',function (e) {
  const formData = new FormData();
  formData.append("nombre",inputname.value)
  formData.append("path", ('/categoria/' + inputpath.value));
  console.log('actualizar');
  formData.append("id", formbtns[1].id);
  fetch(URI+'/admin/categories/edited', {
    method: 'POST',                                       //Using fetch send data to route addone
    body: formData
  }).then(response => {return response.json()}).catch(err => {console.log(err);})
  .then(data => {
    if(data){
      
      const alltoasts = toastgenerate(data.type);
      document.getElementById('cat_allcats').innerHTML = alltoasts;
      const execute_watcher = btnswatcher(btns);
      inputname.value = "";
      inputpath.value = "";
      checkbox.checked = false;

      formbtns[0].style.display = '';
      formbtns[1].style.display = 'none';
      formbtns[1].id = undefined;
      
    }
  });
});


const execute_watcher = btnswatcher(btns);

/*
for (let i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function(e) {

    let btnid = e.srcElement.id;
    let btntype = btnid.slice(3,4);
    btnid = btnid.substr(5);                                                       //extract id product from button and...
    const formData = new FormData();                                      
    formData.append("categorie", btnid);

    if(btntype == 'e'){                                                           //if user clicked btn edit then edit categorie
      
      fetch(URI+'/admin/categories/editone', {
        method: 'POST',
        body: formData
      }).then(response => {return response.json()}).catch(err => {console.log(err);})
      .then(data => {
        if(data.item){        
          inputname.value = data.item['nombre'];
          let path = data.item['path'];
          path = path.substr(11);
          inputpath.value = path;

          formbtns[0].style.display = 'none';
          formbtns[1].style.display = '';
          formbtns[1].id = data.item['_id'];
            
        }
      });

    }else if(btntype == 't'){                                                 //if user clicked btn trash then delete categorie

      fetch(URI+'/admin/categories/launch', {
        method: 'DELETE',
        body: formData
      }).then(response => {return response.json()}).catch(err => {console.log(err);})
      .then(data => {
        if(data){

        }
      });
    }

  });
};
*/


