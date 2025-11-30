/* Language Switch */
let currentLang = localStorage.getItem("lang") || "en";

function applyLang(){
  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-en]").forEach(el=>{
    el.innerText = (currentLang === "en") ? el.dataset.en : el.dataset.zh;
  });

  const btn = document.getElementById("langToggle");
  if(btn) btn.innerText = (currentLang==="en" ? "中文" : "EN");
}

document.getElementById("langToggle").onclick = ()=>{
  currentLang = (currentLang === "en"? "zh":"en");
  localStorage.setItem("lang", currentLang);
  applyLang();
};

applyLang();
