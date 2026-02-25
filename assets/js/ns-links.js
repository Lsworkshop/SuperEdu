(function () {
  const DEFAULT_NS = "ns12345";

  // 从 URL path 或 query 获取 NS
  function getNsFromUrl() {
    // query string ?ref=NSxxxx
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref && /^ns[0-9A-Za-z_-]+$/.test(ref)) return ref.toLowerCase();

    // path /nsxxxx/
    const m = location.pathname.match(/^\/(ns[0-9A-Za-z_-]+)(\/|$)/);
    if (m) return m[1].toLowerCase();

    return null;
  }

  // 获取当前有效 NS
  function getValidNs() {
    // 优先 sessionStorage
    const stored = sessionStorage.getItem("finova_ns");
    if (stored) return stored;

    const ns = getNsFromUrl();
    if (ns) {
      sessionStorage.setItem("finova_ns", ns);
      return ns;
    }

    // 默认演示 NS
    sessionStorage.setItem("finova_ns", DEFAULT_NS);
    return DEFAULT_NS;
  }

  // 给 path 增加 NS 前缀
  function addNsToPath(path, ns) {
    if (!ns) return path;
    if (!path.startsWith("/")) path = "/" + path;
    if (path === `/${ns}` || path.startsWith(`/${ns}/`)) return path;
    if (path.startsWith("/functions/") || path.startsWith("/api/")) return path;
    return `/${ns}${path}`;
  }

  // 重写 <a href> 和 <form action>
  function rewriteLinks() {
    const ns = getValidNs();

    document.querySelectorAll("a[href]").forEach(a => {
      let href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("http://") || href.startsWith("https://")) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href.startsWith("/functions/") || href.startsWith("/api/")) return;

      const newHref = addNsToPath(href, ns);
      if (newHref !== href) a.setAttribute("href", newHref);
    });

    document.querySelectorAll("form[action]").forEach(f => {
      let action = f.getAttribute("action");
      if (!action) return;
      if (action.startsWith("http://") || action.startsWith("https://")) return;
      if (action.startsWith("/functions/") || action.startsWith("/api/")) return;

      const newAction = addNsToPath(action, ns);
      if (newAction !== action) f.setAttribute("action", newAction);
    });
  }

  // 捕获点击，动态处理 NS
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
        const newPath = addNsToPath(path, ns);

        if (newPath !== path) {
          e.preventDefault();
          window.location.assign(newPath);
        }
      },
      true
    );
  }

  // 根路径处理：默认演示 NS
  function handleRootPath() {
    const ns = getValidNs();
    if (window.location.pathname === "/" && ns === DEFAULT_NS) {
      window.history.replaceState({}, "", `/${DEFAULT_NS}/`);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    handleRootPath();
    rewriteLinks();
    captureClicks();
  });
})();