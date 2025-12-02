/* assets/js/lang.js
   Language module for SuperEdu V1.0
   Provides:
    - getLang(), setLang()
    - t(en, zh) simple translator
    - onChange(callback) subscribe to language change
*/
(function(global){
  const KEY = 'superedu-lang';
  let current = localStorage.getItem(KEY) || 'en';
  const listeners = [];

  function applyDOM(){
    document.querySelectorAll('[data-en]').forEach(el=>{
      const en = el.getAttribute('data-en');
      const zh = el.getAttribute('data-zh');
      if(!en && !zh) return;
      el.textContent = current === 'en' ? (en || zh) : (zh || en);
    });
    // ARIA and button label
    const togg = document.getElementById('langToggle');
    if(togg) togg.textContent = current === 'en' ? '中文' : 'EN';
    document.documentElement.lang = current;
  }

  function setLang(l){
    if(!l) return;
    current = l;
    localStorage.setItem(KEY, l);
    applyDOM();
    listeners.forEach(fn=>{ try{ fn(l); }catch(e){console.error(e);} });
  }

  function getLang(){ return current; }
  function onChange(fn){ if(typeof fn === 'function') listeners.push(fn); }

  // helper: choose between en/zh strings
  function t(en, zh){ return current === 'en' ? (en||zh) : (zh||en); }

  // init - attach toggle button
  document.addEventListener('DOMContentLoaded', ()=>{
    applyDOM();
    const btn = document.getElementById('langToggle');
    if(btn){
      btn.addEventListener('click', ()=>{
        setLang(current === 'en' ? 'zh' : 'en');
      });
    }
  });

  // export
  global.langModule = { getLang, setLang, onChange, t };
})(window);

