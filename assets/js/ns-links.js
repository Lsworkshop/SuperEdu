(function () {
  const DEFAULT_NS = "NS12345";

  function getNsFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref && /^NS[0-9A-Za-z_-]+$/i.test(ref)) return ref.toUpperCase();
    return null;
  }

  function getStoredNs() {
    const fromUrl = getNsFromUrl();
    if (fromUrl) {
      sessionStorage.setItem("finova_ns", fromUrl);
      return fromUrl;
    }

    const stored = sessionStorage.getItem("finova_ns");
    if (stored) return stored.toUpperCase();

    sessionStorage.setItem("finova_ns", DEFAULT_NS);
    return DEFAULT_NS;
  }

  function addNsToUrl(href, ns) {
    if (!ns) return href;

    // 如果 href 是完整 URL
    const url = new URL(href, window.location.origin);

    // 已有 ref 就不覆盖
    if (!url.searchParams.get("ref")) {
      url.searchParams.set("ref", ns);
    }

    return url.pathname + url.search + url.hash;
  }

  function rewriteLinksAndForms() {
    const ns = getStoredNs();

    document.querySelectorAll("a[href]").forEach(a => {
      const href = a.getAttribute("href");
      if (!href) return;
      if (/^(http|mailto|tel)/.test(href)) return;

      a.setAttribute("href", addNsToUrl(href, ns));
    });

    document.querySelectorAll("form[action]").forEach(f => {
      const action = f.getAttribute("action");
      if (!action) return;
      if (/^(http|mailto|tel)/.test(action)) return;

      f.setAttribute("action", addNsToUrl(action, ns));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    rewriteLinksAndForms();

    document.addEventListener(
      "click",
      e => {
        const a = e.target.closest && e.target.closest("a");
        if (!a) return;

        const href = a.getAttribute("href");
        if (!href) return;
        if (/^(http|mailto|tel)/.test(href)) return;

        const ns = getStoredNs();
        const newHref = addNsToUrl(href, ns);
        if (newHref !== href) {
          e.preventDefault();
          window.location.assign(newHref);
        }
      },
      true
    );
  });
})();