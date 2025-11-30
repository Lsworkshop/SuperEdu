// menu.js
(function(){
  const ham = document.getElementById('hamburger');
  const mobile = document.getElementById('mobileMenu');
  if(!ham || !mobile) return;
  ham.addEventListener('click', function(){
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', (!expanded).toString());
    mobile.setAttribute('aria-hidden', expanded.toString());
  });
})();
