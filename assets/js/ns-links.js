(function () {
  "use strict";

  const STORAGE_KEY = "finova_ns";

  // ===============================
  // 1️⃣ 读取当前 NS
  // ===============================
  function getNsFromPath() {
    const match = window.location.pathname.match(/^\/(ns[0-9a-z_-]+)(\/|$)/i);
    if (!match) return null;
    return match[1].toLowerCase();
  }

  function saveNs(ns) {
    if (ns) {
      sessionStorage.setItem(STORAGE_KEY, ns);
    }
  }

  function getSavedNs() {
    return sessionStorage.getItem(STORAGE_KEY);
  }

  // ===============================
  // 2️⃣ ?ref 启动器 → 强制转成 /nsXXXX/
  // ===============================
  function handleRefRedirect() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (!ref) return;

    const ns = ref.toLowerCase();
    const currentPath = window.location.pathname.toLowerCase();

    // 如果当前路径不是 /nsXXXX/，则跳转
    if (!currentPath.startsWith(`/${ns}`)) {
      window.location.replace(`/${ns}/`);
    }
  }

  // ===============================
  // 3️⃣ 统一小写路径
  // ===============================
  function normalizeCase() {
    const currentNs = getNsFromPath();
    if (!currentNs) return;

    const correctPath = `/${currentNs}/`;
    if (!window.location.pathname.startsWith(correctPath)) {
      window.location.replace(correctPath);
    }
  }

  // ===============================
  // 4️⃣ 重写链接
  // ===============================
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

  // ===============================
  // 5️⃣ 捕获点击（防止动态生成链接丢失 ns）
  // ===============================
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

  // ===============================
  // 6️⃣ 初始化
  // ===============================
  function init() {
    handleRefRedirect(); // 优先处理 ?ref

    const nsFromPath = getNsFromPath();
    if (nsFromPath) {
      saveNs(nsFromPath);
    }

    const ns = getSavedNs();
    if (!ns) return;

    normalizeCase();

    rewriteLinks(ns);
    rewriteForms(ns);
    attachClickInterceptor(ns);
  }

  document.addEventListener("DOMContentLoaded", init);
})();