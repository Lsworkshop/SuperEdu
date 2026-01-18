// menu.js — FINAL STABLE VERSION
(function () {
  const nav = document.getElementById('topNav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const maxTransparent = 60;

  if (!nav) return;

  /* ===============================
     Scroll behavior (PURE & SIMPLE)
  =============================== */
  function onScroll() {
    const y = window.scrollY || window.pageYOffset;

    if (y <= 5) {
      // 顶部：完全透明
      nav.classList.add('nav--transparent');
      nav.classList.remove('nav--solid');
    } else if (y <= maxTransparent) {
      // 正常：半透明（由 CSS 控制）
      nav.classList.add('nav--transparent');
      nav.classList.remove('nav--solid');
    } else {
      // 下滑：更实
      nav.classList.remove('nav--transparent');
      nav.classList.add('nav--solid');
    }
  }

  window.addEventListener('scroll', onScroll);

  // 页面加载完成后同步一次（不锁、不延迟）
  window.addEventListener('load', onScroll);

  /* ===============================
     Mobile menu initial state
  =============================== */
  if (mobileMenu) {
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.style.display = 'none';
    mobileMenu.style.opacity = '0';
  }

  /* ===============================
     Hamburger toggle
  =============================== */
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.getAttribute('aria-hidden') === 'false';

      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      mobileMenu.style.display = isOpen ? 'none' : 'block';
      mobileMenu.style.opacity = isOpen ? '0' : '1';

      hamburger.classList.toggle('open', !isOpen);

      if (isOpen) {
        mobileMenu
          .querySelectorAll('details')
          .forEach(d => (d.open = false));
      }
    });
  }

  /* ===============================
     Close mobile menu on link click
     (NO animation interference)
  =============================== */
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth >= 1024) return;

        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenu.style.display = 'none';
        mobileMenu.style.opacity = '0';
        hamburger && hamburger.classList.remove('open');

        mobileMenu
          .querySelectorAll('details')
          .forEach(d => (d.open = false));
      });
    });
  }
})();
