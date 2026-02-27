(function () {
  "use strict";

  const DEFAULT_NS = "NS12345";
  const STORAGE_KEY = "finova_ns";

  // ===============================
  // 1️⃣ 读取 URL 中的 ?ref
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
  // 2️⃣ 获取当前有效 NS（安全版本）
  // ===============================
  function getCurrentNs() {
    const fromUrl = getNsFromUrl();

    // 优先 URL
    if (fromUrl) {
      sessionStorage.setItem(STORAGE_KEY, fromUrl);
      return fromUrl;
    }

    // 再 sessionStorage
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored.toUpperCase();
    }

    // 只有真正裸访问才使用默认
    return null;
  }

  // ===============================
  // 3️⃣ 确保地址栏带 ref
  // ===============================
  function ensureRefInUrl() {
    let ns = getCurrentNs();

    // 如果完全没有 NS（裸访问）
    if (!ns) {
      ns = DEFAULT_NS;
      sessionStorage.setItem(STORAGE_KEY, ns);
    }

    const params = new URLSearchParams(window.location.search);

    // 只有当 URL 没有 ref 时才补充
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
  // 4️⃣ 给链接加 ref（不覆盖）
  // ===============================
  function addRefToUrl(href, ns) {
    if (!href) return href;

    if (/^(https?:|mailto:|tel:)/i.test(href)) return href;

    const url = new URL(href, window.location.origin);

    if (!url.searchParams.get("ref")) {
      url.searchParams.set("ref", ns);
    }

    return url.pathname + url.search + url.hash;
  }

  // ===============================
  // 5️⃣ 重写所有链接
  // ===============================
  function rewriteLinks() {
    const ns = getCurrentNs();
    if (!ns) return;

    document.querySelectorAll("a[href]").forEach((a) => {
      const original = a.getAttribute("href");
      if (!original) return;

      const updated = addRefToUrl(original, ns);
      if (updated !== original) {
        a.setAttribute("href", updated);
      }
    });

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
  // 6️⃣ 捕获点击（双保险）
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
        if (!ns) return;

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
  // 初始化
  // ===============================
  document.addEventListener("DOMContentLoaded", function () {
    ensureRefInUrl();   // 先保证地址栏正确
    rewriteLinks();     // 再重写链接
    enableClickInterceptor();
  });
})();


(function () {
  // ---------------------------
  // 获取当前 NS
  // ---------------------------
  function getNs() {
    const m = location.pathname.match(/^\/(ns[0-9A-Za-z_-]+)(\/|$)/);
    if (m) {
      sessionStorage.setItem("finova_ns", m[1]);
      return m[1];
    }
    return sessionStorage.getItem("finova_ns");
  }

  // ---------------------------
  // 给所有内部链接和表单增加 NS 路径
  // ---------------------------
  function addNsToPath(path, ns) {
    if (!ns) return path;
    if (!path.startsWith("/")) return path;
    if (path === `/${ns}` || path.startsWith(`/${ns}/`)) return path;
    // 排除接口路径
    if (path.startsWith("/functions/") || path.startsWith("/api/")) return path;
    return `/${ns}${path}`;
  }

  function rewriteLinks() {
    const ns = getNs();
    if (!ns) return;

    // 修改 <a href>
    document.querySelectorAll("a[href]").forEach(a => {
      const href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("http://") || href.startsWith("https://")) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const path = href.startsWith("/") ? href : "/" + href;
      if (path === `/${ns}` || path.startsWith(`/${ns}/`)) return;
      if (path.startsWith("/functions/") || path.startsWith("/api/")) return;

      a.setAttribute("href", addNsToPath(path, ns));
    });

    // 修改 <form action>
    document.querySelectorAll("form[action]").forEach(f => {
      const action = f.getAttribute("action");
      if (!action) return;
      if (action.startsWith("http://") || action.startsWith("https://")) return;

      const path = action.startsWith("/") ? action : "/" + action;
      if (path.startsWith(`/${ns}/`) || path === `/${ns}`) return;
      if (path.startsWith("/functions/") || path.startsWith("/api/")) return;

      f.setAttribute("action", addNsToPath(path, ns));
    });
  }

  // 捕获 a 点击，支持动态生成的链接
  document.addEventListener(
    "click",
    function (e) {
      const a = e.target.closest && e.target.closest("a");
      if (!a) return;

      const href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("http://") || href.startsWith("https://")) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const ns = getNs();
      if (!ns) return;

      const path = href.startsWith("/") ? href : "/" + href;
      const newPath = addNsToPath(path, ns);
      if (newPath !== path) {
        e.preventDefault();
        window.location.assign(newPath);
      }
    },
    true
  );

  document.addEventListener("DOMContentLoaded", rewriteLinks);
})();

// =========================================================
// 替换表单中 Promotion Code / Referral Code 显示
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  const nsId = (function() {
    const m = location.pathname.match(/^\/(ns[0-9A-Za-z_-]+)/);
    if (m) return m[1];
    return sessionStorage.getItem("finova_ns") || "ns12345";
  })();

  // 1️⃣ 修改 placeholder / data-en / data-zh，**不覆盖用户输入**
  document.querySelectorAll('input[name="ref"], input[placeholder*="NS12345"], input[name="referral_code"]').forEach(input => {
    // placeholder 替换
    if (input.placeholder.includes("NS12345")) {
      input.placeholder = input.placeholder.replace("NS12345", nsId);
    }
    // data-en / data-zh 替换
    if (input.dataset.en && input.dataset.en.includes("NS12345")) {
      input.dataset.en = input.dataset.en.replace("NS12345", nsId);
    }
    if (input.dataset.zh && input.dataset.zh.includes("NS12345")) {
      input.dataset.zh = input.dataset.zh.replace("NS12345", nsId);
    }
  });

  // 2️⃣ 修改 <label> 显示文本
  document.querySelectorAll('label[data-en][data-zh]').forEach(label => {
    if (label.dataset.en.includes("NS12345")) {
      label.dataset.en = label.dataset.en.replace("NS12345", nsId);
    }
    if (label.dataset.zh.includes("NS12345")) {
      label.dataset.zh = label.dataset.zh.replace("NS12345", nsId);
    }
  });
});