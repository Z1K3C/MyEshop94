//------------------------------------- Indicate in browser console inicialization -------------------------------------//
console.log('app loaded');
//------------------------------------- Inicialize -------------------------------------//
const URI = '';
if(window.innerWidth<1000){                                   //When user move page minus 1000px
  document.getElementById('sld_inner').style.height = ((window.innerWidth)/4) + "px";
}

let myDropdown = document.getElementById('nav_dropdown1');    //inicialize dropdown
let myDropdownInit = new Dropdown( myDropdown, true );

let myCarousel = document.getElementById('sld_carousel');     //Inicialize carousel
let myCarouselInit = new Carousel(myCarousel, { 
  interval: false,  pause: false, keyboard: false
});

let inspearch = document.getElementById('nav_inpsearch');     //Inicialize search input

//------------------------------------- Even listeners -------------------------------------//

let btns = document.getElementById("sqr_cards").getElementsByClassName("btn");  //Create button array
for (let i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function(e) {

    let btnid = e.srcElement.id;                            //extract id product from button and send throw rest api
    if(btnid){
      btnid = btnid.substr(4);
      const formData = new FormData();
      formData.append("product", btnid);
  
      fetch(URI+'/cart/add', {
        method: 'POST',
        body: formData
      }).then(response => {return response.json()}).catch(err => {console.log(err);})
      .then(data => {
        if(data.amount){                                  //if rest api response, then update amount data
          document.getElementById('nav_counts1').innerText = data.amount;
        }
      });
    };

  });
};

window.addEventListener('resize',function() {                     //When user move page minus 1000px
  if(window.innerWidth<1000){
    document.getElementById('sld_inner').style.height = ((window.innerWidth)/4) + "px";
  }
});
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

let btn1 = document.getElementById('ind_btn1') || false;
if(btn1){
  btn1.addEventListener('click',function (e) {
    document.getElementById('ind_modalC').className = "fade modal animated fadeOut"
    setTimeout(() => {
      document.getElementById('ind_modalC').style.display = "none";
      document.getElementById('ind_modalC').style.opacity = "1";
    }, 500);
  });
}
let btn2 = document.getElementById('ind_btn2') || false;
if(btn2){
  btn2.addEventListener('click',function (e) {
    document.getElementById('ind_modalC').className = "fade modal animated fadeOut"
    setTimeout(() => {
      document.getElementById('ind_modalC').style.display = "none";
      document.getElementById('ind_modalC').style.opacity = "1";
    }, 500);
  });
}