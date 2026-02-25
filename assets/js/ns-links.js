(function () {
  const DEFAULT_NS = "ns12345";

  function getNsFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref && /^ns[0-9A-Za-z_-]+$/.test(ref)) return ref.toLowerCase();

    const m = location.pathname.match(/^\/(ns[0-9A-Za-z_-]+)(\/|$)/);
    if (m) return m[1].toLowerCase();

    return null;
  }

  function getValidNs() {
    const stored = sessionStorage.getItem("finova_ns");
    if (stored) return stored;

    const ns = getNsFromUrl();
    if (ns) {
      sessionStorage.setItem("finova_ns", ns);
      return ns;
    }

    sessionStorage.setItem("finova_ns", DEFAULT_NS);
    return DEFAULT_NS;
  }

  function addNsToPath(path, ns) {
    if (!ns) return path;
    if (!path.startsWith("/")) path = "/" + path;
    if (path === `/${ns}` || path.startsWith(`/${ns}/`)) return path;
    if (path.startsWith("/functions/") || path.startsWith("/api/")) return path;
    return `/${ns}${path}`;
  }

  function addNsToQuery(href, ns) {
    if (!ns) return href;
    const url = new URL(href, window.location.origin);
    if (!url.searchParams.get("ref")) {
      url.searchParams.set("ref", ns.toUpperCase());
    }
    return url.pathname + url.search + url.hash;
  }

  function rewriteLinks() {
    const ns = getValidNs();

    document.querySelectorAll("a[href]").forEach(a => {
      let href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("http://") || href.startsWith("https://")) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href.startsWith("/functions/") || href.startsWith("/api/")) return;

      const newHref = addNsToQuery(addNsToPath(href, ns), ns);
      if (newHref !== href) a.setAttribute("href", newHref);
    });

    document.querySelectorAll("form[action]").forEach(f => {
      let action = f.getAttribute("action");
      if (!action) return;
      if (action.startsWith("http://") || action.startsWith("https://")) return;
      if (action.startsWith("/functions/") || action.startsWith("/api/")) return;

      const newAction = addNsToQuery(addNsToPath(action, ns), ns);
      if (newAction !== action) f.setAttribute("action", newAction);
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
        if (href.startsWith("http://") || href.startsWith("https://")) return;
        if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

        const ns = getValidNs();
        const path = href.startsWith("/") ? href : "/" + href;
        const newPath = addNsToQuery(addNsToPath(path, ns), ns);

        if (newPath !== path) {
          e.preventDefault();
          window.location.assign(newPath);
        }
      },
      true
    );
  }

  function handleRootPath() {
    const ns = getValidNs();
    if (window.location.pathname === "/" && ns === DEFAULT_NS) {
      const newUrl = `/${DEFAULT_NS}/?ref=${ns.toUpperCase()}`;
      window.history.replaceState({}, "", newUrl);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    handleRootPath();
    rewriteLinks();
    captureClicks();
  });
})();