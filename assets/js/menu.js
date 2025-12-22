// menu.js — improved: ensure mobile menu is hidden by default and toggle uses aria-hidden
(function(){
  const nav = document.getElementById('topNav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const maxTransparent = 60; // px scrolled when nav becomes more opaque

  // Safety: if elements missing, bail gracefully
  if(!nav) return;

  // Ensure mobileMenu exists and has initial hidden state
  if(mobileMenu) {
    // If not explicitly set in HTML, set it now
    if(!mobileMenu.hasAttribute('aria-hidden')) mobileMenu.setAttribute('aria-hidden','true');
    // Ensure visual state matches aria on load
    if(mobileMenu.getAttribute('aria-hidden') === 'true') {
      mobileMenu.style.display = 'none';
      mobileMenu.style.opacity = '0';
    } else {
      mobileMenu.style.display = 'block';
      mobileMenu.style.opacity = '1';
    }
  }

  // toggle mobile menu on hamburger click
  if(hamburger && mobileMenu){
    hamburger.addEventListener('click', function(){
      const isOpen = mobileMenu.getAttribute('aria-hidden') === 'false';
      if(isOpen){
        mobileMenu.setAttribute('aria-hidden','true');
        mobileMenu.style.display = 'none';
        mobileMenu.style.opacity = '0';
      } else {
        mobileMenu.setAttribute('aria-hidden','false');
        mobileMenu.style.display = 'block';
        mobileMenu.style.opacity = '1';
      }
      // animate hamburger (toggle class)
      hamburger.classList.toggle('open', !isOpen);
    });
  }

  // close mobile menu on link click (if open)
  if(mobileMenu){
    mobileMenu.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>{
        mobileMenu.setAttribute('aria-hidden','true');
        mobileMenu.style.display = 'none';
        hamburger && hamburger.classList.remove('open');
      });
    });
  }

  // nav scroll behavior: semi-transparent -> more opaque on scroll
  function onScroll(){
    const y = window.scrollY || window.pageYOffset;
    if(y > maxTransparent) {
      nav.classList.remove('nav--transparent');
      nav.classList.add('nav--solid'); // nav--solid should be the "more opaque" state
    } else {
      nav.classList.add('nav--transparent');
      nav.classList.remove('nav--solid');
    }
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  // Adjust padding for mobile touch area
  function adjustForMobile(){
    const inner = document.querySelector('.nav-inner');
    if(!inner) return;
    if(window.innerWidth <= 720){
      inner.style.padding = '12px 18px';
    } else {
      inner.style.padding = '14px 20px';
      // When resized to desktop, ensure mobile menu is hidden and hamburger reset
      if(mobileMenu){
        mobileMenu.setAttribute('aria-hidden','true');
        mobileMenu.style.display = 'none';
      }
      if(hamburger) hamburger.classList.remove('open');
    }
  }
  window.addEventListener('resize', adjustForMobile);
  adjustForMobile();

  // Align brand text visually
  const brandText = document.querySelector('.brand-text');
  if(brandText){
    brandText.style.transform = 'translateY(-2px)';
  }
})();

document.addEventListener("DOMContentLoaded", () => {

  const mobileRegister = document.getElementById("mobileRegister");
  const mobileUnlock = document.getElementById("mobileUnlock");

  if (mobileRegister) {
    mobileRegister.addEventListener("click", () => {
      window.location.href = "/membership.html";
    });
  }

  if (mobileUnlock) {
    mobileUnlock.addEventListener("click", () => {
      window.location.href = "/quick-unlock.html";
    });
  }

});

// ===============================
// Mobile action buttons routing
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  const mobileRegister = document.getElementById("mobileRegister");
  const mobileUnlock = document.getElementById("mobileUnlock");

  if (mobileRegister) {
    mobileRegister.addEventListener("click", () => {
      window.location.href = "/register.html";
    });
  }

  if (mobileUnlock) {
    mobileUnlock.addEventListener("click", () => {
      window.location.href = "/quick-unlock.html";
    });
  }

});
