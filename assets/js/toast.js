/* =====================================================
   SuperEdu Toast — Unified (White Card + Progress Bar)
   - showToast(message, type, options)
   - type: "info" | "success" | "error" | "warning"
   - auto duration adapts on mobile
===================================================== */
(function () {
  const DEFAULTS = {
    duration: 3200,      // desktop default
    mobileDuration: 5200, // mobile default (longer to read)
    position: "top-center", // "top-center" | "top-right" | "bottom-center"
    maxWidth: 520,
    closable: true,
  };

  function isMobile() {
    return window.matchMedia && window.matchMedia("(max-width: 640px)").matches;
  }

  function ensureRoot(position) {
    const id = "superedu-toast-root";
    let root = document.getElementById(id);

    if (!root) {
      root = document.createElement("div");
      root.id = id;
      document.body.appendChild(root);
    }

    // apply root styles every time (in case page CSS overrides)
    root.style.position = "fixed";
    root.style.zIndex = "99999";
    root.style.pointerEvents = "none";
    root.style.display = "flex";
    root.style.flexDirection = "column";
    root.style.gap = "10px";
    root.style.padding = "12px";
    root.style.width = "100%";
    root.style.boxSizing = "border-box";
    root.style.alignItems = "center";

    if (position === "top-right") {
      root.style.top = "12px";
      root.style.right = "12px";
      root.style.left = "auto";
      root.style.bottom = "auto";
      root.style.alignItems = "flex-end";
      root.style.width = "auto";
      root.style.maxWidth = "calc(100vw - 24px)";
    } else if (position === "bottom-center") {
      root.style.bottom = "12px";
      root.style.left = "0";
      root.style.right = "0";
      root.style.top = "auto";
      root.style.alignItems = "center";
    } else {
      // top-center default
      root.style.top = "12px";
      root.style.left = "0";
      root.style.right = "0";
      root.style.bottom = "auto";
      root.style.alignItems = "center";
    }

    return root;
  }

  function iconFor(type) {
    // simple unicode icons; can be replaced with svg later
    if (type === "success") return "✅";
    if (type === "error") return "⛔";
    if (type === "warning") return "⚠️";
    return "ℹ️";
  }

  function accentColor(type) {
    // progress bar color
    if (type === "success") return "#22c55e";
    if (type === "error") return "#ef4444";
    if (type === "warning") return "#f59e0b";
    return "#3b82f6";
  }

  function makeToastEl(message, type, opts) {
    const wrap = document.createElement("div");
    wrap.className = "superedu-toast";
    wrap.style.pointerEvents = "auto";
    wrap.style.width = "min(" + (opts.maxWidth || DEFAULTS.maxWidth) + "px, calc(100vw - 24px))";
    wrap.style.background = "rgba(255,255,255,0.92)";
    wrap.style.backdropFilter = "blur(10px)";
    wrap.style.border = "1px solid rgba(0,0,0,0.08)";
    wrap.style.borderRadius = "14px";
    wrap.style.boxShadow = "0 12px 30px rgba(15, 23, 42, 0.12)";
    wrap.style.overflow = "hidden";

    // entrance animation
    wrap.style.transform = "translateY(-6px)";
    wrap.style.opacity = "0";
    wrap.style.transition = "transform 180ms ease, opacity 180ms ease";

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "flex-start";
    row.style.gap = "10px";
    row.style.padding = "12px 12px 10px";

    const icon = document.createElement("div");
    icon.textContent = iconFor(type);
    icon.style.flex = "0 0 auto";
    icon.style.width = "28px";
    icon.style.height = "28px";
    icon.style.display = "flex";
    icon.style.alignItems = "center";
    icon.style.justifyContent = "center";
    icon.style.borderRadius = "10px";
    icon.style.background = "rgba(0,0,0,0.04)";

    const text = document.createElement("div");
    text.style.flex = "1";
    text.style.fontSize = "14.5px";
    text.style.lineHeight = "1.4";
    text.style.color = "#111827";
    text.style.wordBreak = "break-word";
    text.textContent = String(message || "");

    row.appendChild(icon);
    row.appendChild(text);

    if (opts.closable !== false) {
      const close = document.createElement("button");
      close.type = "button";
      close.textContent = "×";
      close.setAttribute("aria-label", "Close");
      close.style.marginLeft = "6px";
      close.style.flex = "0 0 auto";
      close.style.border = "0";
      close.style.background = "transparent";
      close.style.cursor = "pointer";
      close.style.fontSize = "18px";
      close.style.lineHeight = "18px";
      close.style.color = "rgba(17,24,39,0.55)";
      close.style.padding = "4px 8px";
      close.style.borderRadius = "10px";
      close.addEventListener("mouseenter", () => {
        close.style.background = "rgba(0,0,0,0.06)";
        close.style.color = "rgba(17,24,39,0.85)";
      });
      close.addEventListener("mouseleave", () => {
        close.style.background = "transparent";
        close.style.color = "rgba(17,24,39,0.55)";
      });
      row.appendChild(close);

      wrap.__closeBtn = close;
    }

    // progress bar
    const bar = document.createElement("div");
    bar.style.height = "3px";
    bar.style.background = "rgba(0,0,0,0.06)";
    bar.style.position = "relative";

    const barFill = document.createElement("div");
    barFill.style.height = "100%";
    barFill.style.width = "100%";
    barFill.style.background = accentColor(type);
    barFill.style.transformOrigin = "left";
    barFill.style.transform = "scaleX(1)";
    barFill.style.transition = "transform linear";
    bar.appendChild(barFill);

    wrap.appendChild(row);
    wrap.appendChild(bar);

    wrap.__barFill = barFill;

    return wrap;
  }

  function showToast(message, type = "info", options = {}) {
    const opts = { ...DEFAULTS, ...(options || {}) };

    // if user passes duration, respect it, but allow mobile override if not explicit
    const explicitDuration = typeof options?.duration === "number";
    const duration = explicitDuration ? options.duration : (isMobile() ? opts.mobileDuration : opts.duration);

    const root = ensureRoot(opts.position);
    const toast = makeToastEl(message, type, opts);

    root.appendChild(toast);

    // close handler
    const close = () => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-6px)";
      setTimeout(() => {
        toast.remove();
      }, 180);
    };

    if (toast.__closeBtn) {
      toast.__closeBtn.addEventListener("click", close);
    }

    // start animation next tick
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    // progress bar animation
    if (toast.__barFill) {
      toast.__barFill.style.transitionDuration = duration + "ms";
      requestAnimationFrame(() => {
        toast.__barFill.style.transform = "scaleX(0)";
      });
    }

    // auto close
    const timer = setTimeout(close, duration);

    // pause on hover (desktop nice-to-have)
    toast.addEventListener("mouseenter", () => {
      clearTimeout(timer);
      // stop bar at current position by computing current scaleX
      // (simple approach: just freeze by removing transition)
      if (toast.__barFill) toast.__barFill.style.transitionDuration = "0ms";
    });

    // resume on leave: restart remaining time is complex; keep it simple: close after short delay
    toast.addEventListener("mouseleave", () => {
      // small extra time after hover
      setTimeout(close, 900);
    });

    return { close };
  }

  // expose
  window.showToast = showToast;
})();
