

  const serviceItems = document.querySelector(".nav");
  const popup = document.querySelector(".popup-box")
  const popupCloseBtn = popup.querySelector(".popup-close-btnx");
  const popupRedirectBtn = popup.querySelector(".popup-close-btn");
  const popupCloseIcon = popup.querySelector(".popup-close-icon");

  serviceItems.addEventListener("click",function(event){
     var e = event.target;
     console.log('this is tagName : '+e.tagName.toLowerCase())
     console.log('this is ID : '+e.id)
     /*console.log(e.id=="enroll"&&e.id!=null)*/
    if(event.target.tagName.toLowerCase() == "a"&&e.id=="enroll"){
       console.log(event.target.classList)
       const item =event.target.parentElement;
       /*const h3 = item.querySelector("h3").innerHTML;*/
       /*const readMoreCont = item.querySelector(".read-more-cont").innerHTML;*/
       const readMoreCont = item.querySelector(".data").innerHTML;
       popup.querySelector("h3").innerHTML = 'ข้อตกลง';
       popup.querySelector(".popup-body").innerHTML = readMoreCont;
       popupBox();
    }

  })

  popupCloseBtn.addEventListener("click", popupBox);
  popupRedirectBtn.addEventListener("click", popupRedirect);
  popupCloseIcon.addEventListener("click", popupBox);

  popup.addEventListener("click", function(event){
     if(event.target == popup){
        popupBox();
     }
  })

  function popupBox(){
    popup.classList.toggle("open");
  }
  
  function popupRedirect(){
     location.href='/enroll_nor';
     /*location.href("enroll_nor")*/
  }

