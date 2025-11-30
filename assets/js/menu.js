/* Mobile Menu Toggle */
const ham = document.getElementById("hamburger");
const menu = document.getElementById("navMenu");

ham.onclick = ()=>{
  const isOpen = menu.style.display === "flex";
  menu.style.display = isOpen ? "none" : "flex";
};
