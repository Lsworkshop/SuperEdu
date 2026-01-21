// menu.js — FINAL STABLE (no jitter, no logic change)
(function () {
  const nav = document.getElementById('topNav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const maxTransparent = 60;

  if (!nav) return;

  /* ===============================
     Mobile menu initial state
  =============================== */
  if (mobileMenu) {
    if (!mobileMenu.hasAttribute('aria-hidden')) {
      mobileMenu.setAttribute('aria-hidden', 'true');
    }

    const hidden = mobileMenu.getAttribute('aria-hidden') === 'true';
    mobileMenu.style.display = hidden ? 'none' : 'block';
    mobileMenu.style.opacity = hidden ? '0' : '1';
  }

  /* ===============================
     Hamburger toggle
  =============================== */
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.getAttribute('aria-hidden') === 'false';

      mobileMenu.setAttribute('aria-hidden', String(isOpen));
      mobileMenu.style.display = isOpen ? 'none' : 'block';
      mobileMenu.style.opacity = isOpen ? '0' : '1';

      hamburger.classList.toggle('open', !isOpen);

      if (isOpen) {
        mobileMenu.querySelectorAll('details').forEach(d => (d.open = false));
      }
    });
  }

  /* ===============================
     Close mobile menu on link click
  =============================== */
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (e) => {
        if (window.innerWidth >= 1024) return;

        e.preventDefault();
        const href = a.getAttribute('href');

        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenu.style.opacity = '0';
        hamburger && hamburger.classList.remove('open');

        mobileMenu.querySelectorAll('details').forEach(d => (d.open = false));

        setTimeout(() => {
          window.location.href = href;
        }, 120);
      });
    });
  }

  /* ===============================
     Scroll behavior (SAFE)
  =============================== */
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const y = window.scrollY || window.pageYOffset;

      if (y > maxTransparent) {
        nav.classList.remove('nav--transparent');
        nav.classList.add('nav--solid');
      } else {
        nav.classList.add('nav--transparent');
        nav.classList.remove('nav--solid');
      }

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll);

  // ⚠️ 延迟首次执行，避免首屏闪
  window.addEventListener('load', () => {
    onScroll();
  });

  /* ===============================
     Responsive padding + reset
  =============================== */
  function adjustForMobile() {
    const inner = document.querySelector('.nav-inner');
    if (!inner) return;

    if (window.innerWidth <= 720) {
      inner.style.padding = '12px 18px';
    } else {
      inner.style.padding = '14px 20px';

      if (mobileMenu) {
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenu.style.display = 'none';
        mobileMenu.style.opacity = '0';
        mobileMenu.querySelectorAll('details').forEach(d => (d.open = false));
      }
      hamburger && hamburger.classList.remove('open');
    }
  }

  window.addEventListener('resize', adjustForMobile);
  window.addEventListener('load', adjustForMobile);

  /* ===============================
     Brand text alignment
  =============================== */
  const brandText = document.querySelector('.brand-text');
  if (brandText) {
    brandText.style.transform = 'translateY(-2px)';
  }
})();

/* ===============================
   Mobile action buttons routing
=============================== */
document.addEventListener('DOMContentLoaded', () => {
  const mobileRegister = document.getElementById('mobileRegister');
  const mobileUnlock = document.getElementById('mobileUnlock');

  if (mobileRegister) {
    mobileRegister.addEventListener('click', () => {
      window.location.href = '/register.html';
    });
  }

  if (mobileUnlock) {
    mobileUnlock.addEventListener('click', () => {
      window.location.href = '/quick-unlock.html';
    });
  }
});

/* ===============================
   Anchor navigation (Desktop safe)
=============================== */
document.querySelectorAll('a[href^="/index.html#"], a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    const id = href.includes('#') ? href.split('#')[1] : null;
    const target = id && document.getElementById(id);

    if (target) {
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});

