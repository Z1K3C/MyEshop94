//------------------------------------- Indicate in browser console inicialization -------------------------------------//
console.log('all product loaded');
//------------------------------------- Inicialize -------------------------------------//
const URI = '';
//------------------------------------- function -------------------------------------//
function navgen(par) {            //Whit this function generate a navbar whit a tab for each categorie
  let all_onavs = '';
  let all_otabs = '';
  par.forEach(function(inf,ind){
    if(ind == 0){
      all_onavs += '\
      <li class="nav-item">\
        <a class="nav-link active" id="'+ inf +'-tab" data-toggle="tab" href="#'+ inf +'" role="tab" aria-controls="'+ inf + '" aria-selected="true">\
          '+ inf +'\
        </a>\
      </li>';
      all_otabs += '<div class="tab-pane fade show active" id="'+ inf +'" role="tabpanel" aria-labelledby="'+ inf +'-tab"> '+ ind + ' dato </div>';
    }else{
      all_onavs += '\
      <li class="nav-item">\
        <a class="nav-link" id="'+ inf +'-tab" data-toggle="tab" href="#'+ inf +'" role="tab" aria-controls="'+ inf + '" aria-selected="false">\
          '+ inf +'\
        </a>\
      </li>';
      all_otabs += '<div class="tab-pane fade" id="'+ inf +'" role="tabpanel" aria-labelledby="'+ inf +'-tab"> '+ ind + ' dato </div>';
    }
  });
  return '<ul class="nav nav-tabs nav-pills nav-fill" id="all_onavs" role="tablist">'+ all_onavs +'</ul><div class="tab-content" id="all_otabs">'+ all_otabs +'</div>';
          
}

function fillpanels(par) {        //Whit this function generate a body whit each tab, in each body include all product with a same categorie

  let arr_panels = [];
  if((par.query1.length>0)&&(par.query2.length>0)){
    for (let i = 0; i < par.query1.length; i++) 
      arr_panels.push('');

    for (let i = 0; i < par.query1.length; i++) {
      
      for (let j = 0; j < par.query2[i].length; j++) {
        arr_panels[i] += '\
          <div id="crd_'+ par.query2[i][j]['_id'] +'" class="col-xl-3 col-lg-4 col-md-6 col-12 p-2 animated fadeIn slow">\
            <section class="card Mys_cardgnral">\
              <div class="Mys_cardimgheader">\
                <img src="'+ par.query2[i][j]['imagePath'] +'" class="card-img-top p-2 Mys_cardimg" >\
              </div>\
              <div class="card-body py-2 Mys_cardbdyheader">\
                <p class="card-title m-0 Mys_cardsold"> $ '+ par.query2[i][j]['precio'] +'</p>\
                <p class="card-text m-0 Mys_cardtitle"> '+ par.query2[i][j]['nombre'] +'</p>\
                <p class="card-text m-0 Mys_cardnote">'+ par.query2[i][j]['descripcion'] +'</p>\
                <p class="card-text m-0 Mys_cardbrand">'+ par.query2[i][j]['marca'] +'</p>\
              </div>\
              <div class="p-2 cardmyfooter">\
                <div class="btn-group btn-block" role="group" aria-label="Basic example">\
                  <a type="button" class="btn btn-outline-primary" href="/admin/edit/'+ par.query2[i][j]['_id'] +'">\
                    Editar <i class="fas fa-tools" /></i> \
                  </a>\
                  <button id="btn_'+ par.query2[i][j]['_id'] +'" type="button" class="btn btn-outline-danger">\
                    Borrar <i id="btn_'+ par.query2[i][j]['_id'] +'" class="fas fa-dumpster-fire" /></i>\
                  </button>\
                </div>\
              </div>\
            </section>\
          </div>';
      }
    }

    for (let i = 0; i < par.query1.length; i++) {
      document.getElementById(par.query1[i]).innerHTML = '\
        <section ><div id="all_'+ par.query1[i] + i + '" class="row"> '+ arr_panels[i] +'</div></section>';
    }
  }
  return null;
}

function buttonack(){       //Whit this delete product when user pulse the respective delete button
  let btns = document.getElementById("all_otabs").getElementsByClassName("btn");
  for (let i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function(e) {

      let btnid = e.srcElement.id;
      btnid = btnid.substr(4);

      if(btnid){
        const formData = new FormData();
        formData.append("id",btnid);

        fetch(URI+'/admin/launch/', {
          method: 'DELETE',
          body: formData
        }).then(response => {return response.json()}).catch(err => {console.log(err);})
        .then(data => {
          document.getElementById("crd_"+btnid).innerHTML = "";
        });
      }

    });
  };
  return null;
}

//Inicialize this page call a fetch for fill all tabs with all categories, then call fill each tab with all product separete for categorie
fetch(URI+'/admin/allproduct/query').then(response => {return response.json();}).catch(err => {console.log(err);})
  .then(data => {
    if(data){
      document.getElementById('all_navs').innerHTML = navgen(data.query1);
      const panel = fillpanels(data);
      let myTabs = document.getElementById('all_onavs');
      let myTabsCollection = myTabs.getElementsByTagName('A');
      for (let i = 0; i < myTabsCollection.length; i++) 
        new Tab(myTabsCollection[i], {height: true} );

      const btndel = buttonack();
    }
  });
