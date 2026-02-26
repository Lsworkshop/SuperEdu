(function () {
  "use strict";

  const DEFAULT_NS = "NS12345";
  const STORAGE_KEY = "finova_ns";

  // ===============================
  // 1️⃣ 读取 URL 中的 ?ref=NSxxxx
  // ===============================
  function getNsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && /^NS[0-9A-Za-z_-]+$/i.test(ref)) {
      return ref.toUpperCase();
    }
    return null;
  }

  // ===============================
  // 2️⃣ 获取当前有效 NS
  // 优先级：
  // URL > sessionStorage > 默认演示
  // ===============================
  function getCurrentNs() {
    const fromUrl = getNsFromUrl();

    if (fromUrl) {
      sessionStorage.setItem(STORAGE_KEY, fromUrl);
      return fromUrl;
    }

    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored.toUpperCase();
    }

    sessionStorage.setItem(STORAGE_KEY, DEFAULT_NS);
    return DEFAULT_NS;
  }

  // ===============================
  // 3️⃣ 给链接添加 ?ref=NSxxxx
  // 保留 hash (#home)
  // 不覆盖已有 ref
  // ===============================
  function addRefToUrl(href, ns) {
    if (!href) return href;

    // 忽略外部链接
    if (/^(https?:|mailto:|tel:)/i.test(href)) return href;

    const url = new URL(href, window.location.origin);

    if (!url.searchParams.get("ref")) {
      url.searchParams.set("ref", ns);
    }

    return url.pathname + url.search + url.hash;
  }

  // ===============================
  // 4️⃣ 重写所有内部链接和表单
  // ===============================
  function rewriteAllLinks() {
    const ns = getCurrentNs();

    // 处理 <a>
    document.querySelectorAll("a[href]").forEach((a) => {
      const original = a.getAttribute("href");
      if (!original) return;

      const updated = addRefToUrl(original, ns);
      if (updated !== original) {
        a.setAttribute("href", updated);
      }
    });

    // 处理 <form>
    document.querySelectorAll("form[action]").forEach((form) => {
      const original = form.getAttribute("action");
      if (!original) return;

      const updated = addRefToUrl(original, ns);
      if (updated !== original) {
        form.setAttribute("action", updated);
      }
    });
  }

  // ===============================
  // 5️⃣ 捕获点击，防止跳转丢 ref
  // ===============================
  function enableClickInterceptor() {
    document.addEventListener(
      "click",
      function (e) {
        const link = e.target.closest("a");
        if (!link) return;

        const href = link.getAttribute("href");
        if (!href) return;
        if (/^(https?:|mailto:|tel:)/i.test(href)) return;

        const ns = getCurrentNs();
        const updated = addRefToUrl(href, ns);

        if (updated !== href) {
          e.preventDefault();
          window.location.assign(updated);
        }
      },
      true
    );
  }

  // ===============================
  // 6️⃣ 如果首页没有 ?ref
  // 自动补上（演示或真实）
  // ===============================
  function ensureRefInAddressBar() {
    const ns = getCurrentNs();
    const params = new URLSearchParams(window.location.search);

    if (!params.get("ref")) {
      params.set("ref", ns);
      const newUrl =
        window.location.pathname +
        "?" +
        params.toString() +
        window.location.hash;

      window.history.replaceState({}, "", newUrl);
    }
  }

  // ===============================
  // 7️⃣ 初始化
  // ===============================
  document.addEventListener("DOMContentLoaded", function () {
    ensureRefInAddressBar();
    rewriteAllLinks();
    enableClickInterceptor();
  });
})();