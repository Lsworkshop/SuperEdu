/* assets/js/menu.js
   Navigation & utilities module for SuperEdu V1.0
   Exposes `menu` global with:
     - toggleMobile()
     - enterEdu()
     - validateEmail(email)
*/
(function(global){
  const mobileBtn = document.getElementById('hamburger');
  const mobilePanel = document.getElementById('mobilePanel') || document.getElementById('mobilePanel');
  let mobileOpen = false;

  function toggleMobile(){
    const panel = document.getElementById('mobilePanel');
    if(!panel) return;
    mobileOpen = !mobileOpen;
    panel.style.display = mobileOpen ? 'block' : 'none';
    panel.setAttribute('aria-hidden', !mobileOpen);
  }

  if(mobileBtn){
    mobileBtn.addEventListener('click', (e)=>{ e.stopPropagation(); toggleMobile(); });
    // close when clicking outside
    document.addEventListener('click', (e)=>{
      const panel = document.getElementById('mobilePanel');
      if(!panel) return;
      if(mobileOpen && !panel.contains(e.target) && !mobileBtn.contains(e.target)){
        toggleMobile();
      }
    });
    // close on ESC
    document.addEventListener('keydown', (ev)=>{
      if(ev.key === 'Escape' && mobileOpen){ toggleMobile(); }
    });
  }

  // simple email validator (used on front-end)
  function validateEmail(email){
    if(!email || typeof email !== 'string') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }

  // Education center access check
  function enterEdu(){
    try{
      const token = JSON.parse(localStorage.getItem('edu_unlocked_token') || 'null');
      const lang = (window.langModule && window.langModule.getLang && window.langModule.getLang()) || 'en';
      if(!token){
        alert(lang === 'en' ? 'Please unlock access first.' : '请先解锁教育中心');
        window.location = '/unlock.html';
        return;
      }
      // token exists => open education center
      window.location = '/education.html';
    }catch(e){
      console.error(e);
      window.location = '/unlock.html';
    }
  }

  // scroll behaviour: shrink nav on scroll
  function initScrollNav(){
    const nav = document.getElementById('siteNav');
    if(!nav) return;
    const shrinkAt = 20;
    window.addEventListener('scroll', ()=>{
      if(window.scrollY > shrinkAt) nav.classList.add('nav-scrolled');
      else nav.classList.remove('nav-scrolled');
    });
  }
  document.addEventListener('DOMContentLoaded', initScrollNav);

  // expose
  global.menu = { toggleMobile, enterEdu, validateEmail };
})(window);
