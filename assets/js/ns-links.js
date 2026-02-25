(function () {
  const DEFAULT_NS = "ns12345";

  // 获取 Member ID：优先 ?ref=NSxxxx，其次 sessionStorage，否则默认演示
  function getNsFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref && /^NS[0-9A-Za-z_-]+$/i.test(ref)) return ref.toUpperCase();

    return null;
  }

  function getValidNs() {
    let stored = sessionStorage.getItem("finova_ns");
    const fromUrl = getNsFromUrl();
    if (fromUrl) {
      sessionStorage.setItem("finova_ns", fromUrl);
      return fromUrl;
    }
    if (stored) return stored;

    sessionStorage.setItem("finova_ns", DEFAULT_NS.toUpperCase());
    return DEFAULT_NS.toUpperCase();
  }

  function addNsToQuery(href, ns) {
    if (!ns) return href;

    // 完整 URL 对象处理
    const url = new URL(href, window.location.origin);
    if (!url.searchParams.get("ref")) {
      url.searchParams.set("ref", ns);
    }
    return url.pathname + url.search + url.hash;
  }

  function rewriteLinks() {
    const ns = getValidNs();

    document.querySelectorAll("a[href]").forEach(a => {
      let href = a.getAttribute("href");
      if (!href) return;
      if (/^(http|mailto|tel):/.test(href)) return;

      a.setAttribute("href", addNsToQuery(href, ns));
    });

    document.querySelectorAll("form[action]").forEach(f => {
      let action = f.getAttribute("action");
      if (!action) return;
      if (/^(http|mailto|tel):/.test(action)) return;

      f.setAttribute("action", addNsToQuery(action, ns));
    });
  }

  function captureClicks() {
    document.addEventListener(
      "click",
      function (e) {
        const a = e.target.closest && e.target.closest("a");
        if (!a) return;

        const href = a.getAttribute("href");
        if (!href) return;
        if (/^(http|mailto|tel):/.test(href)) return;

        const ns = getValidNs();
        const newHref = addNsToQuery(href, ns);

        if (newHref !== href) {
          e.preventDefault();
          window.location.assign(newHref);
        }
      },
      true
    );
  }

  document.addEventListener("DOMContentLoaded", () => {
    rewriteLinks();
    captureClicks();
  });
})();