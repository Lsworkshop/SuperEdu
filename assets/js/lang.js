// lang.js — simple language toggler (data-en / data-zh)
(function(){
  const KEY = 'superedu-lang';
  let lang = localStorage.getItem(KEY) || (document.documentElement.lang || 'en');
  // expose for other scripts
  window.supereduLang = lang;

  function applyLang(l){
    lang = l;
    localStorage.setItem(KEY, l);
    document.documentElement.lang = l;
    // text nodes
    document.querySelectorAll('[data-en]').forEach(el=>{
      const en = el.getAttribute('data-en');
      const zh = el.getAttribute('data-zh');
      if(!en && !zh) return;
      // inputs/textarea placeholders handled elsewhere; here set innerText for elements
      if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        // use data attributes as placeholder if present
        if(en || zh) el.placeholder = (l==='en') ? en || '' : zh || '';
      } else {
        el.innerText = (l==='en') ? en || zh || el.innerText : zh || en || el.innerText;
      }
    });

    // ensure nav lang button text
    const btn = document.getElementById('langToggle');
    if(btn) btn.innerText = (lang==='en') ? '中文' : 'EN';
    // remember globally
    window.supereduLang = lang;
  }

  // initial apply
  applyLang(lang);

  // attach to toggle button
  const btn = document.getElementById('langToggle');
  if(btn){
    btn.addEventListener('click', function(){
      const next = (localStorage.getItem(KEY) === 'en') ? 'zh' : 'en';
      applyLang(next);
    });
  }
})();
