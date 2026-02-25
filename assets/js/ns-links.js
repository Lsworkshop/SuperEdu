(function () {
  "use strict";

  const STORAGE_KEY = "finova_ns";

  // ============================
  // 🔥 0️⃣ 最先执行：处理 ?ref
  // ============================
  (function handleRefImmediately() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (!ref) return;

    const ns = ref.toLowerCase();
    const currentPath = window.location.pathname.toLowerCase();

    if (!currentPath.startsWith(`/${ns}`)) {
      window.location.replace(`/${ns}/`);
    }
  })();

  // ============================
  // 1️⃣ 读取 ns
  // ============================
  function getNsFromPath() {
    const match = window.location.pathname.match(/^\/(ns[0-9a-z_-]+)(\/|$)/i);
    if (!match) return null;
    return match[1].toLowerCase();
  }

  function saveNs(ns) {
    if (ns) sessionStorage.setItem(STORAGE_KEY, ns);
  }

  function getSavedNs() {
    return sessionStorage.getItem(STORAGE_KEY);
  }

  // ============================
  // 2️⃣ rewrite 逻辑
  // ============================
  function shouldSkip(href) {
    if (!href) return true;
    if (/^(https?:)?\/\//i.test(href)) return true;
    if (/^(#|mailto:|tel:)/i.test(href)) return true;
    if (href.startsWith("/api/") || href.startsWith("/functions/")) return true;
    return false;
  }

  function rewriteLinks(ns) {
    document.querySelectorAll("a[href]").forEach(a => {
      const href = a.getAttribute("href");
      if (shouldSkip(href)) return;

      let path = href.startsWith("/") ? href : "/" + href;

      if (path === `/${ns}` || path.startsWith(`/${ns}/`)) return;

      a.setAttribute("href", `/${ns}${path}`);
    });
  }

  function rewriteForms(ns) {
    document.querySelectorAll("form[action]").forEach(form => {
      const action = form.getAttribute("action");
      if (shouldSkip(action)) return;

      let path = action.startsWith("/") ? action : "/" + action;

      if (path === `/${ns}` || path.startsWith(`/${ns}/`)) return;

      form.setAttribute("action", `/${ns}${path}`);
    });
  }

  function attachClickInterceptor(ns) {
    document.addEventListener(
      "click",
      function (e) {
        const a = e.target.closest && e.target.closest("a");
        if (!a) return;

        const href = a.getAttribute("href");
        if (shouldSkip(href)) return;

        let path = href.startsWith("/") ? href : "/" + href;

        if (path === `/${ns}` || path.startsWith(`/${ns}/`)) return;

        e.preventDefault();
        window.location.assign(`/${ns}${path}`);
      },
      true
    );
  }

  // ============================
  // 3️⃣ 初始化
  // ============================
  function init() {
    const nsFromPath = getNsFromPath();
    if (nsFromPath) saveNs(nsFromPath);

    const ns = getSavedNs();
    if (!ns) return;

    rewriteLinks(ns);
    rewriteForms(ns);
    attachClickInterceptor(ns);
  }

  document.addEventListener("DOMContentLoaded", init);
})();