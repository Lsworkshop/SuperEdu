/* Mobile Menu Toggle */
const ham = document.getElementById("hamburger");
const menu = document.getElementById("navMenu");

ham.onclick = ()=>{
  if(menu.style.display === "flex"){
    menu.style.display = "none";
  } else {
    menu.style.display = "flex";
  }
};
