/* =====================================================
   SnovaEdu Unified Access Control — TOAST + MOBILE STABLE
   Roles:
   - visitor
   - quick   (Quick Unlock)
   - lead    (Join List / Express Interest)
   - member  (Logged-in Member)
===================================================== */

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    /* ===============================
       i18n (toast)
    =============================== */
    function getLang() {
      return localStorage.getItem("superedu-lang") || localStorage.getItem("snova-lang") || "en";
    }
    function t(key) {
      const lang = getLang();
      const dict = {
        accessRequired: { en: "Access required", zh: "需要权限" },

        quickNeed: { en: "Please unlock EduCenter first.", zh: "请先完成 Quick Unlock 才能进入 EduCenter。" },
        leadNeed: { en: "EduCommunity requires Join List access.", zh: "EduCommunity 需要 Join List 权限。" },
        memberNeed: { en: "Members only. Please log in.", zh: "仅限会员。请先登录。" },

        goUnlock: { en: "Go to Quick Unlock", zh: "前往 Quick Unlock" },
        goJoin: { en: "Go to Join List", zh: "前往 Join List" },
        goLogin: { en: "Go to Login", zh: "前往登录" }
      };
      return (dict[key] && dict[key][lang]) || (dict[key] && dict[key].en) || key;
    }

    /* ===============================
       1. Role Core
    =============================== */

    function getRole() {
      return (
        localStorage.getItem("snovaRole") ||
        sessionStorage.getItem("snovaRole") ||
        "visitor"
      );
    }

    function setRole(role, persistent = true) {
      if (persistent) {
        localStorage.setItem("snovaRole", role);
        sessionStorage.removeItem("snovaRole");
      } else {
        sessionStorage.setItem("snovaRole", role);
      }
    }

    function clearRole() {
      localStorage.removeItem("snovaRole");
      sessionStorage.removeItem("snovaRole");
    }

    const role = getRole();
    const isQuick  = ["quick", "lead", "member"].includes(role);
    const isLead   = ["lead", "member"].includes(role);
    const isMember = role === "member";

    /* ===============================
       2. Page Guard（允许直接访问时跳转）
       说明：这是“访问页面本身”的守卫
       - 如果用户直接打开受限页面，必须跳走（正常）
    =============================== */

    const pageType = document.body?.dataset?.page;

    if (pageType) {
      // EduCenter
      if (pageType === "quick-required" && !isQuick) {
        window.location.replace("/quick-unlock.html");
        return;
      }

      // EduCommunity（lead 以上）
      if (pageType === "lead-required" && !isLead) {
        window.location.replace("/education.html");
        return;
      }

      // Member-only
      if ((pageType === "member-only" || pageType === "forum-required") && !isMember) {
        window.location.replace("/login.html");
        return;
      }
    }

    /* ===============================
       3. Toast UI (Homepage-like)
    =============================== */

    function ensureToastStyles() {
      if (document.getElementById("snovaToastStyles")) return;

      const style = document.createElement("style");
      style.id = "snovaToastStyles";
      style.textContent = `
        #snovaToastHost{
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 20px;
          z-index: 9999;
          width: min(520px, calc(100vw - 24px));
          pointer-events: none;
        }
        .snova-toast{
          pointer-events: auto;
          display: grid;
          grid-template-columns: 40px 1fr 32px;
          gap: 12px;
          align-items: start;
          background: linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%);
          border: 1px solid rgba(59,130,246,.18);
          border-radius: 16px;
          padding: 12px 12px 10px;
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.18);
          animation: snovaToastIn 180ms ease-out;
          overflow: hidden;
        }
        .snova-toast--danger{ border-color: rgba(220,38,38,.22); }
        .snova-toast--warn{ border-color: rgba(245,158,11,.22); }
        .snova-toast--info{ border-color: rgba(59,130,246,.18); }

        .snova-toast__icon{
          width: 40px; height: 40px;
          border-radius: 12px;
          display:flex; align-items:center; justify-content:center;
          background: rgba(59,130,246,.10);
          font-size: 18px;
        }
        .snova-toast--danger .snova-toast__icon{ background: rgba(220,38,38,.10); }
        .snova-toast--warn .snova-toast__icon{ background: rgba(245,158,11,.12); }

        .snova-toast__title{
          margin: 2px 0 2px;
          font-weight: 700;
          font-size: 14px;
          color: #111827;
        }
        .snova-toast__msg{
          margin: 0;
          font-size: 13px;
          color: rgba(17,24,39,.78);
          line-height: 1.4;
        }
        .snova-toast__close{
          appearance:none;
          border:none;
          background: transparent;
          color: rgba(17,24,39,.55);
          font-size: 16px;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 10px;
        }
        .snova-toast__close:hover{ background: rgba(17,24,39,.06); }

        .snova-toast__bar{
          grid-column: 1 / -1;
          height: 3px;
          background: rgba(99,102,241,.14);
          border-radius: 999px;
          overflow: hidden;
          margin-top: 8px;
        }
        .snova-toast__bar i{
          display:block;
          height:100%;
          width:100%;
          transform-origin: left;
          background: linear-gradient(90deg,#3b82f6,#8b5cf6);
          animation: snovaToastBar linear forwards;
        }

        @keyframes snovaToastIn{
          from{ transform: translateY(8px); opacity: 0; }
          to{ transform: translateY(0); opacity: 1; }
        }
        @keyframes snovaToastOut{
          from{ transform: translateY(0); opacity: 1; }
          to{ transform: translateY(8px); opacity: 0; }
        }
        @keyframes snovaToastBar{
          from{ transform: scaleX(1); }
          to{ transform: scaleX(0); }
        }

        @media (max-width: 640px){
          #snovaToastHost{ bottom: 16px; }
          .snova-toast{
            grid-template-columns: 36px 1fr 30px;
            padding: 12px 12px 10px;
            border-radius: 14px;
          }
          .snova-toast__icon{
            width: 36px; height: 36px;
            border-radius: 12px;
          }
          .snova-toast__title{ font-size: 14px; }
          .snova-toast__msg{ font-size: 13px; }
        }
      `;
      document.head.appendChild(style);

      const host = document.createElement("div");
      host.id = "snovaToastHost";
      document.body.appendChild(host);
    }

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, (m) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#039;"
      }[m]));
    }

    function showToast(message, opts = {}) {
      ensureToastStyles();

      const isMobile =
        (window.matchMedia && window.matchMedia("(max-width: 640px)").matches) ||
        window.innerWidth <= 640;

      const {
        title = t("accessRequired"),
        type = "warn",
        icon = type === "danger" ? "⛔" : type === "info" ? "ℹ️" : "🔒",
        duration = isMobile ? 9000 : 3600
      } = opts;

      const host = document.getElementById("snovaToastHost");
      if (!host) return;

      const toast = document.createElement("div");
      toast.className = `snova-toast snova-toast--${type}`;

      const barDuration = Math.max(2000, Math.min(15000, duration));

      toast.innerHTML = `
        <div class="snova-toast__icon" aria-hidden="true">${icon}</div>
        <div>
          <p class="snova-toast__title">${escapeHtml(title)}</p>
          <p class="snova-toast__msg">${escapeHtml(message)}</p>
        </div>
        <button class="snova-toast__close" aria-label="Close">✕</button>
        <div class="snova-toast__bar" aria-hidden="true"><i style="animation-duration:${barDuration}ms"></i></div>
      `;

      const closeBtn = toast.querySelector(".snova-toast__close");

      const remove = () => {
        toast.style.animation = "snovaToastOut 180ms ease forwards";
        setTimeout(() => toast.remove(), 200);
      };

      closeBtn?.addEventListener("click", remove);

      host.appendChild(toast);

      setTimeout(remove, barDuration);
    }

    /* ===============================
       4. Navigation Control（只拦截，不跳转）
       ⭐关键：capture=true + stopImmediatePropagation
       防止 menu.js / 其它脚本在手机端继续触发导航
    =============================== */

    function guardNav(id, allowFn, denyMessageKey) {
      const el = document.getElementById(id);
      if (!el) return;

      el.addEventListener(
        "click",
        (e) => {
          if (allowFn()) return;

          // ✅ 完全阻止默认导航 + 阻止其它监听器
          e.preventDefault();
          e.stopPropagation();
          if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();

          showToast(t(denyMessageKey), {
            type: "warn",
            icon: "🔒"
          });

          // ✅ 不做任何 replace/redirect（手机就不会“秒跳走”）
          return false;
        },
        true // ✅ capture: 先于其它脚本拦截
      );
    }

    // EduCenter
    guardNav("navEduCenter", () => isQuick, "quickNeed");
    guardNav("mobileEduCenter", () => isQuick, "quickNeed");

    // EduCommunity
    guardNav("navEduCommunity", () => isLead, "leadNeed");
    guardNav("mobileEduCommunity", () => isLead, "leadNeed");

    // EduForum (Members only)
    guardNav("navForum", () => isMember, "memberNeed");
    guardNav("mobileForum", () => isMember, "memberNeed");

    /* ===============================
       5. Upgrade APIs（全站调用）
    =============================== */

    window.unlockQuick = function (redirect = "/education.html") {
      setRole("quick");
      window.location.replace(redirect);
    };

    window.upgradeToLead = function (redirect = "/education.html") {
      setRole("lead");
      window.location.replace(redirect);
    };

    window.upgradeToMember = function (redirect = "/education.html") {
      setRole("member");
      window.location.replace(redirect);
    };

    window.logoutMember = function () {
      clearRole();
      window.location.replace("/");
    };
  });
})();
