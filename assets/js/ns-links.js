(function () {
  // 获取当前 NS ID
  function getNs() {
    // 从 URL path 提取 /nsxxxx
    const m = location.pathname.match(/^\/(ns[0-9A-Za-z_-]+)(\/|$)/);
    if (m) {
      sessionStorage.setItem("finova_ns", m[1]);
      return m[1];
    }
    // 从 sessionStorage 取
    return sessionStorage.getItem("finova_ns");
  }

  // 保存默认演示 NS
  const DEFAULT_NS = "ns12345";

  // 返回有效的 NS（演示或真实会员）
  function getValidNs() {
    return getNs() || DEFAULT_NS;
  }

  // 给 path 增加 NS 前缀
  function addNsToPath(path, ns) {
    if (!ns) return path;
    if (!path.startsWith("/")) path = "/" + path;
    if (path === `/${ns}` || path.startsWith(`/${ns}/`)) return path;
    // 排除接口路径
    if (path.startsWith("/functions/") || path.startsWith("/api/")) return path;
    return `/${ns}${path}`;
  }

  // 重写页面所有 <a href> 和 <form action>
  function rewriteLinks() {
    const ns = getValidNs();

    // <a href>
    document.querySelectorAll("a[href]").forEach(a => {
      let href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("http://") || href.startsWith("https://")) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href.startsWith("/functions/") || href.startsWith("/api/")) return;

      const newHref = addNsToPath(href, ns);
      if (newHref !== href) a.setAttribute("href", newHref);
    });

    // <form action>
    document.querySelectorAll("form[action]").forEach(f => {
      let action = f.getAttribute("action");
      if (!action) return;
      if (action.startsWith("http://") || action.startsWith("https://")) return;
      if (action.startsWith("/functions/") || action.startsWith("/api/")) return;

      const newAction = addNsToPath(action, ns);
      if (newAction !== action) f.setAttribute("action", newAction);
    });
  }

  // 裸访问 / 时默认跳转到演示 NS
  function handleRootPath() {
    if (window.location.pathname === "/" && !getNs()) {
      window.location.replace(`/${DEFAULT_NS}/`);
    }
  }

  // 捕获点击，拦截所有 a，动态处理 NS
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

  document.addEventListener("DOMContentLoaded", () => {
    handleRootPath();
    rewriteLinks();
    captureClicks();
  });
})();