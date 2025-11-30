// lang.js
(function(){
  const KEY = 'superedu-lang';
  const saved = localStorage.getItem(KEY) || 'en';
  window.supereduLang = saved;

  function applyLang(lang){
    window.supereduLang = lang;
    localStorage.setItem(KEY, lang);
    document.querySelectorAll('[data-en]').forEach(el=>{
      const en = el.getAttribute('data-en');
      const zh = el.getAttribute('data-zh');
      if(!en && !zh) return;
      if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'){
        // prefer placeholder if exists
        if(zh || en) el.placeholder = (lang==='en'?en:zh) || '';
      } else {
        el.innerText = (lang==='en'?en:zh) || el.innerText;
      }
    });

    // placeholders for inputs without data attributes
    const pfirst = document.querySelectorAll('input[placeholder]');
    // (most placeholders already have English/Chinese combined; we skip)
  }

  // init
  applyLang(saved);

  // lang toggle button (simple toggle)
  const btn = document.getElementById('langToggle');
  if(btn){
    btn.addEventListener('click', ()=>{
      const newLang = window.supereduLang === 'en' ? 'zh' : 'en';
      applyLang(newLang);
      btn.innerText = newLang === 'en' ? 'EN / 中文' : 'EN / 中文';
    });
  }

  window.supereduSetLang = applyLang;
})();
