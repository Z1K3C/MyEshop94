console.log('bought loaded');
const URI = '';

//------------------------------------- Even listeners -------------------------------------//

let btns = document.getElementById("bgt_cartgroup").getElementsByClassName("btn");    //Create button array
for (let i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function(e) {

    let btnid = e.srcElement.id;
    let btntype = btnid.slice(3,4);
    btnid = btnid.substr(5);                                                       //extract id product from button and...
    const formData = new FormData();                                      
    formData.append("product", btnid);

    const holdernum = document.getElementById('Amt_'+btnid).value;
    if((holdernum == 1)&&(btntype == 'm'))                                        
      btntype = 't';

    if(btntype == 'p'){                                                           //if user clicked btn plus then add product in array client
      
      fetch(URI+'/cart/plus', {
        method: 'POST',
        body: formData
      }).then(response => {return response.json()}).catch(err => {console.log(err);})
      .then(data => {
        if(data){
          let total = data.total;
          total = Number(total);
          total = total.toFixed(2); 
          let subtotal = data.subtotal;
          subtotal = Number(subtotal);
          subtotal = subtotal.toFixed(2); 
          document.getElementById('bgt_subt').innerText = "$ " + subtotal; 
          document.getElementById('bgt_total').innerText = "$ " + total; 
          document.getElementById('Amt_'+btnid).value = data.plusreturn;
          document.getElementById('bgt_amount').innerText = data.amount;
        }
      });

    }else if(btntype == 'm'){                                                 //if user clicked btn minues then substract product in array client

      fetch(URI+'/cart/minus', {
        method: 'POST',
        body: formData
      }).then(response => {return response.json()}).catch(err => {console.log(err);})
      .then(data => {
        if(data){
          if(data.amount>0){
            let total = data.total;
            total = Number(total);
            total = total.toFixed(2); 
            let subtotal = data.subtotal;
            subtotal = Number(subtotal);
            subtotal = subtotal.toFixed(2); 
            document.getElementById('bgt_subt').innerText = "$ " + subtotal; 
            document.getElementById('bgt_total').innerText = "$ " + total; 
            document.getElementById('Amt_'+btnid).value = data.minusreturn;
            document.getElementById('bgt_amount').innerText = data.amount;
          }else{
            document.getElementById('bgt_cartall').innerHTML = "";
            document.getElementById('bgt_emptycart').style.display = "";
          }
        }
      });

    }else if(btntype == 't'){                                                 //if user clicked btn trash then erase product in array client

      fetch(URI+'/cart/trash', {
        method: 'POST',
        body: formData
      }).then(response => {return response.json()}).catch(err => {console.log(err);})
      .then(data => {
        if(data){
          if (data.amount>0) {
            let total = data.total;
            total = Number(total);
            total = total.toFixed(2); 
            let subtotal = data.subtotal;
            subtotal = Number(subtotal);
            subtotal = subtotal.toFixed(2); 
            document.getElementById('bgt_subt').innerText = "$ " + subtotal; 
            document.getElementById('bgt_total').innerText = "$ " + total; 
            document.getElementById(btnid).innerHTML = ""
            document.getElementById('bgt_amount').innerText = data.amount;  
          } else {
            document.getElementById('bgt_cartall').innerHTML = "";
            document.getElementById('bgt_emptycart').style.display = "";
          }
        }
      });

    }

  });
};

let inputs = document.getElementById("bgt_cartgroup").getElementsByClassName("form-control");   //if user edit field number in a product then
for (let i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('keydown',function (e) {
    let value = e.srcElement.value;
    value = parseInt(value);      
    let inputid = e.srcElement.id;
    inputid = inputid.substr(4);
    if ((e.key === 'Enter')&&(value >= 0)&&(inputid != "")) {                   //send this value to rest api

      const formData = new FormData();
      formData.append("product", inputid);
      formData.append("value", value);

      if(value > 0){
        fetch(URI+'/cart/edit', {
          method: 'POST',
          body: formData
        }).then(response => {return response.json()}).catch(err => {console.log(err);})
        .then(data => {
          if(data){
            if (data.amount>0) {
              let total = data.total;
              total = Number(total);
              total = total.toFixed(2); 
              let subtotal = data.subtotal;
              subtotal = Number(subtotal);
              subtotal = subtotal.toFixed(2); 
              document.getElementById('bgt_subt').innerText = "$ " + subtotal; 
              document.getElementById('bgt_total').innerText = "$ " + total; 
              document.getElementById('Amt_'+inputid).value = data.value;
              document.getElementById('bgt_amount').innerText = data.amount;  
            } else {
              document.getElementById('bgt_cartall').innerHTML = "";
              document.getElementById('bgt_emptycart').style.display = "";
            }
            
          }
  
        });
      }else{                                                        //if value is Zero then erase data throw rest api
        fetch(URI+'/cart/trash', {
          method: 'POST',
          body: formData
        }).then(response => {return response.json()}).catch(err => {console.log(err);})
        .then(data => {
          if(data){
            if (data.amount>0) {
              let total = data.total;
              total = Number(total);
              total = total.toFixed(2); 
              let subtotal = data.subtotal;
              subtotal = Number(subtotal);
              subtotal = subtotal.toFixed(2); 
              document.getElementById('bgt_subt').innerText = "$ " + subtotal; 
              document.getElementById('bgt_total').innerText = "$ " + total; 
              document.getElementById(inputid).innerHTML = ""
              document.getElementById('bgt_amount').innerText = data.amount;  
            } else {
              document.getElementById('bgt_cartall').innerHTML = "";
              document.getElementById('bgt_emptycart').style.display = "";
            }
          }
        });
      }

    }
  })
};

//------------------------------------- STRIPE Even listeners -------------------------------------//

let paybtn = document.getElementById('bgt_paybtn') || false;            //if exist the element then...
if(paybtn){ 

  document.getElementById('bgt_loginbtn').disabled = true;              //disable btn login and redirect to checkout
  
  fetch(URI+'/cart/payconfig').then(response => {return response.json()}).catch(err => {console.log(err);})
    .then(function (data) {
      var stripe = Stripe(data.publicKey);

      paybtn.addEventListener('click',function (e) {
        fetch(URI+'/cart/create-checkout-session').then(response => {return response.json()})
          .then(function (data) {
            stripe.redirectToCheckout({
              sessionId: data.sessionId
            }).then(handleResult);
          })
      });

    });

};

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