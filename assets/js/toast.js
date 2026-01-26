/* =====================================================
   toast.js — Global Toast (EN/ZH) Production
   - Auto language via localStorage("superedu-lang") or <html lang="">
   - Mobile duration longer
   - No dependency
===================================================== */
(function () {
  const DEFAULTS = {
    durationDesktop: 3200,
    durationMobile: 5200,
    position: "top", // top | bottom
  };

  const DICT = {
    required: {
      en: "Please fill all required fields.",
      zh: "请填写所有必填项。",
    },
    email_invalid: {
      en: "Please enter a valid email address.",
      zh: "请输入正确的邮箱地址。",
    },
    submitting: {
      en: "Submitting...",
      zh: "提交中…",
    },
    success: {
      en: "Success!",
      zh: "成功！",
    },
    failed_try_again: {
      en: "Submission failed. Please try again.",
      zh: "提交失败，请重试。",
    },
    login_required: {
      en: "Please log in first.",
      zh: "请先登录。",
    },
  };

  function getLang() {
    const ls = (localStorage.getItem("superedu-lang") || "").toLowerCase();
    if (ls === "zh" || ls === "en") return ls;
    const htmlLang = (document.documentElement.lang || "").toLowerCase();
    if (htmlLang.startsWith("zh")) return "zh";
    return "en";
  }

  function isMobile() {
    return window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
  }

  function ensureHost() {
    let host = document.getElementById("se-toast-host");
    if (host) return host;

    host = document.createElement("div");
    host.id = "se-toast-host";
    host.style.position = "fixed";
    host.style.left = "0";
    host.style.right = "0";
    host.style.zIndex = "9999";
    host.style.pointerEvents = "none";
    host.style.display = "flex";
    host.style.justifyContent = "center";
    host.style.padding = "12px 14px";

    // default top
    host.style.top = "0";

    document.body.appendChild(host);
    return host;
  }

  function makeToastEl(message, type, position) {
    const el = document.createElement("div");
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");

    // container position
    const host = ensureHost();
    if (position === "bottom") {
      host.style.top = "";
      host.style.bottom = "0";
    } else {
      host.style.bottom = "";
      host.style.top = "0";
    }

    el.style.pointerEvents = "auto";
    el.style.maxWidth = "720px";
    el.style.width = "fit-content";
    el.style.margin = "0 auto";
    el.style.padding = "10px 14px";
    el.style.borderRadius = "999px";
    el.style.fontSize = "14.5px";
    el.style.fontWeight = "600";
    el.style.lineHeight = "1.2";
    el.style.backdropFilter = "blur(10px)";
    el.style.boxShadow = "0 12px 30px rgba(20,30,60,0.18)";
    el.style.transform = "translateY(-8px)";
    el.style.opacity = "0";
    el.style.transition = "opacity 180ms ease, transform 180ms ease";

    // colors
    if (type === "success") {
      el.style.background = "rgba(34,197,94,0.12)";
      el.style.border = "1px solid rgba(34,197,94,0.30)";
      el.style.color = "#166534";
    } else if (type === "error") {
      el.style.background = "rgba(239,68,68,0.10)";
      el.style.border = "1px solid rgba(239,68,68,0.25)";
      el.style.color = "#991b1b";
    } else if (type === "info") {
      el.style.background = "rgba(59,130,246,0.12)";
      el.style.border = "1px solid rgba(59,130,246,0.25)";
      el.style.color = "#1e3a8a";
    } else {
      // default
      el.style.background = "rgba(17,24,39,0.08)";
      el.style.border = "1px solid rgba(17,24,39,0.12)";
      el.style.color = "#111827";
    }

    el.textContent = message;

    // close on click
    el.addEventListener("click", () => {
      el.style.opacity = "0";
      el.style.transform = "translateY(-10px)";
      setTimeout(() => el.remove(), 180);
    });

    return el;
  }

  function resolveMessage(opts) {
    const lang = getLang();

    // 1) key from DICT
    if (opts && opts.key && DICT[opts.key]) {
      return DICT[opts.key][lang] || DICT[opts.key].en;
    }

    // 2) direct en/zh
    if (opts && (opts.en || opts.zh)) {
      return (lang === "zh" ? opts.zh : opts.en) || opts.en || opts.zh || "";
    }

    // 3) plain string
    if (typeof opts === "string") return opts;

    return "";
  }

  function showToast(opts) {
    const message = resolveMessage(opts);
    if (!message) return;

    const type = (opts && opts.type) || "info";
    const position = (opts && opts.position) || DEFAULTS.position;

    const host = ensureHost();

    // only keep 2 toasts max (avoid spam)
    while (host.children.length >= 2) host.removeChild(host.firstChild);

    const el = makeToastEl(message, type, position);
    host.appendChild(el);

    // animate in
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });

    const duration =
      (opts && opts.duration) ||
      (isMobile() ? DEFAULTS.durationMobile : DEFAULTS.durationDesktop);

    // auto dismiss
    setTimeout(() => {
      if (!el.isConnected) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(-10px)";
      setTimeout(() => el.remove(), 200);
    }, duration);
  }

  // expose
  window.showToast = showToast;
  window.__toastLang = getLang; // optional debug
})();
