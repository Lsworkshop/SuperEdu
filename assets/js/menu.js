// menu.js — hamburger, nav scroll behavior, mobile menu
(function(){
  const nav = document.getElementById('topNav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const maxTransparent = 60; // px scrolled when nav becomes solid

  // toggle mobile menu
  if(hamburger){
    hamburger.addEventListener('click', function(){
      const open = mobileMenu.getAttribute('aria-hidden') === 'false';
      mobileMenu.setAttribute('aria-hidden', open ? 'true' : 'false');
      mobileMenu.style.display = open ? 'none':'block';
      // animate hamburger (simple)
      hamburger.classList.toggle('open', !open);
    });
  }

  // close mobile menu on link click
  mobileMenu && mobileMenu.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=> { mobileMenu.setAttribute('aria-hidden','true'); mobileMenu.style.display='none'; hamburger.classList.remove('open'); });
  });

  // nav scroll behavior: transparent → solid
  function onScroll(){
    const y = window.scrollY || window.pageYOffset;
    if(y > maxTransparent) {
      nav.classList.remove('nav--transparent'); nav.classList.add('nav--solid');
    } else {
      nav.classList.add('nav--transparent'); nav.classList.remove('nav--solid');
    }
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  // Improve mobile hamburger touch area & position: adjust padding on small screens
  function adjustForMobile(){
    if(window.innerWidth <= 720){
      // ensure hamburger isn't too close to edge by padding body via nav inner (CSS already handles but this ensures)
      document.querySelector('.nav-inner').style.padding = '12px 18px';
    } else {
      document.querySelector('.nav-inner').style.padding = '14px 20px';
    }
  }
  window.addEventListener('resize', adjustForMobile);
  adjustForMobile();

  // small tweak: align brand text vertically (if needed)
  const brandText = document.querySelector('.brand-text');
  if(brandText){
    // keep slightly lifted to visually match logo height
    brandText.style.transform = 'translateY(-2px)';
  }
})();
