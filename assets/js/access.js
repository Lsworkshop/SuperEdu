/* =====================================================
   SnovaEdu Unified Access Control — PRODUCTION (Toast i18n)
   Priority:
   1) If /api/me confirms session => role = "member"
   2) Else fallback to local/session storage role:
      visitor | quick | lead
   UI:
   - Replace alert() with homepage-style toast
   i18n:
   - Reads localStorage "superedu-lang" ("en" | "zh")
===================================================== */

(function () {
  document.addEventListener("DOMContentLoaded", async () => {
    /* ===============================
       0) i18n helper
    =============================== */
    function getLang() {
      const raw = (localStorage.getItem("superedu-lang") || "en").toLowerCase();
      return raw.startsWith("zh") ? "zh" : "en";
    }

    const I18N = {
      en: {
        accessRequired: "Access Required",
        eduCenterTitle: "EduCenter",
        eduCommunityTitle: "EduCommunity",
        eduForumTitle: "EduForum",
        msgQuick: "Please unlock Education Center first.",
        msgLead: "EduCommunity requires Join List access.",
        msgMemberForum: "EduForum requires Member access. Please log in."
      },
      zh: {
        accessRequired: "需要权限",
        eduCenterTitle: "EduCenter 教育中心",
        eduCommunityTitle: "EduCommunity 教育社区",
        eduForumTitle: "EduForum 教育论坛",
        msgQuick: "请先完成 Quick Unlock 才能进入 EduCenter。",
        msgLead: "EduCommunity 需要 Join List（Lead）权限。",
        msgMemberForum: "EduForum 仅限会员（Member）访问，请先登录。"
      }
    };

    function t(key) {
      const lang = getLang();
      return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
    }

    /* ===============================
       1) Toast (homepage-style)
    =============================== */

    function ensureToastStyles() {
      if (document.getElementById("snova-toast-style")) return;

      const style = document.createElement("style");
      style.id = "snova-toast-style";
      style.textContent = `
        :root{
          --snova-toast-bg: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          --snova-toast-text: #111827;
          --snova-toast-muted: #4b5563;
          --snova-toast-border: rgba(59, 130, 246, 0.22);
          --snova-toast-shadow: 0 18px 50px rgba(17, 24, 39, 0.16), 0 6px 18px rgba(17, 24, 39, 0.08);
          --snova-toast-radius: 16px;
        }

        #snovaToastHost{
          position: fixed;
          top: 88px;
          right: 16px;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }

        .snova-toast{
          width: min(360px, calc(100vw - 32px));
          background: var(--snova-toast-bg);
          color: var(--snova-toast-text);
          border: 1px solid var(--snova-toast-border);
          border-radius: var(--snova-toast-radius);
          box-shadow: var(--snova-toast-shadow);
          padding: 12px;
          display: grid;
          grid-template-columns: 28px 1fr auto;
          gap: 10px;
          align-items: start;
          pointer-events: auto;
          transform: translateY(-8px);
          opacity: 0;
          animation: snovaToastIn 220ms ease forwards;
          backdrop-filter: blur(8px);
        }

        .snova-toast__icon{
          width: 28px;
          height: 28px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: rgba(59,130,246,0.10);
          border: 1px solid rgba(59,130,246,0.16);
          font-size: 16px;
          line-height: 1;
          margin-top: 2px;
        }

        .snova-toast__title{
          font-weight: 650;
          font-size: 14px;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .snova-toast__msg{
          margin: 4px 0 0;
          font-size: 13.5px;
          color: var(--snova-toast-muted);
          line-height: 1.35;
        }

        .snova-toast__close{
          appearance: none;
          border: none;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 10px;
          font-size: 16px;
          line-height: 1;
          transition: background 150ms ease, color 150ms ease, transform 150ms ease;
        }
        .snova-toast__close:hover{
          background: rgba(17,24,39,0.06);
          color: #111827;
          transform: translateY(-1px);
        }

        .snova-toast__bar{
          grid-column: 1 / -1;
          height: 3px;
          margin-top: 10px;
          border-radius: 999px;
          background: rgba(59,130,246,0.15);
          overflow: hidden;
        }
        .snova-toast__bar > i{
          display: block;
          height: 100%;
          width: 100%;
          transform-origin: left;
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
          animation: snovaToastBar linear forwards;
        }

        .snova-toast--warn{
          --snova-toast-border: rgba(245, 158, 11, 0.25);
        }
        .snova-toast--warn .snova-toast__icon{
          background: rgba(245,158,11,0.12);
          border-color: rgba(245,158,11,0.18);
        }
        .snova-toast--warn .snova-toast__bar > i{
          background: linear-gradient(90deg, #f59e0b 0%, #f97316 100%);
        }

        .snova-toast--danger{
          --snova-toast-border: rgba(239, 68, 68, 0.24);
        }
        .snova-toast--danger .snova-toast__icon{
          background: rgba(239,68,68,0.10);
          border-color: rgba(239,68,68,0.16);
        }
        .snova-toast--danger .snova-toast__bar > i{
          background: linear-gradient(90deg, #ef4444 0%, #f97316 100%);
        }

        @keyframes snovaToastIn{
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes snovaToastOut{
          to { transform: translateY(-10px); opacity: 0; }
        }
        @keyframes snovaToastBar{
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }

        @media (max-width: 640px){
          #snovaToastHost{
            top: 76px;
            right: 12px;
            left: 12px;
            align-items: stretch;
          }
          .snova-toast{ width: 100%; }
        }
      `;
      document.head.appendChild(style);

      let host = document.getElementById("snovaToastHost");
      if (!host) {
        host = document.createElement("div");
        host.id = "snovaToastHost";
        document.body.appendChild(host);
      }
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
    duration = isMobile ? 6000 : 3600
  } = opts;

  const host = document.getElementById("snovaToastHost");
  if (!host) return;

  const toast = document.createElement("div");
  toast.className = `snova-toast snova-toast--${type}`;

  const barDuration = Math.max(1800, Math.min(12000, duration));

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

  // ✅ 手机端不会被 hover 逻辑影响，稳定显示足够久
  setTimeout(remove, barDuration);
}


    function escapeHtml(str) {
      return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    /* ===============================
       2) Local Role Core (quick/lead)
    =============================== */

    function getStoredRole() {
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

    /* ===============================
       3) Server Auth Check (member)
    =============================== */

    async function isLoggedInMember() {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        return !!(res.ok && data && data.success);
      } catch (err) {
        console.warn("access.js: /api/me check failed:", err);
        return false;
      }
    }

    async function getEffectiveRole() {
      const loggedIn = await isLoggedInMember();
      if (loggedIn) return "member";
      return getStoredRole();
    }

    const role = await getEffectiveRole();

    const isQuick = ["quick", "lead", "member"].includes(role);
    const isLead = ["lead", "member"].includes(role);
    const isMember = role === "member";

    /* ===============================
       4) Page Guard
    =============================== */

    const pageType = document.body?.dataset?.page;

    if (pageType) {
      if (pageType === "quick-required" && !isQuick) {
        window.location.replace("/quick-unlock.html");
        return;
      }

      if (pageType === "lead-required" && !isLead) {
        window.location.replace("/education.html");
        return;
      }

      if (pageType === "member-only" && !isMember) {
        window.location.replace("/login.html");
        return;
      }

      // Forum: members only
      if (pageType === "forum-required" && !isMember) {
        window.location.replace("/login.html");
        return;
      }
    }

    /* ===============================
       5) Navigation Control (Toast)
    =============================== */

    function guardNav(id, allowFn, messageKey, titleKey, toastType) {
      const el = document.getElementById(id);
      if (!el) return;

      el.addEventListener("click", (e) => {
        if (!allowFn()) {
          e.preventDefault();
          showToast(t(messageKey), {
            title: t(titleKey),
            type: toastType || "warn",
            icon: "🔒",
            duration: 3600
          });
        }
      });
    }

    // EduCenter (quick+)
    guardNav("navEduCenter", () => isQuick, "msgQuick", "eduCenterTitle", "warn");
    guardNav("mobileEduCenter", () => isQuick, "msgQuick", "eduCenterTitle", "warn");

    // EduCommunity (lead+)
    guardNav("navEduCommunity", () => isLead, "msgLead", "eduCommunityTitle", "warn");
    guardNav("mobileEduCommunity", () => isLead, "msgLead", "eduCommunityTitle", "warn");

    // EduForum (member only)
    guardNav("navForum", () => isMember, "msgMemberForum", "eduForumTitle", "danger");
    guardNav("mobileForum", () => isMember, "msgMemberForum", "eduForumTitle", "danger");

    /* ===============================
       6) Upgrade APIs (optional)
    =============================== */

    window.unlockQuick = function (redirect = "/education.html") {
      setRole("quick");
      window.location.replace(redirect);
    };

    window.upgradeToLead = function (redirect = "/education.html") {
      setRole("lead");
      window.location.replace(redirect);
    };

    window.upgradeToMember = function (redirect = "/dashboard.html") {
      // fallback only; true member determined by /api/me
      setRole("member");
      window.location.replace(redirect);
    };

    window.logoutMember = function () {
      clearRole();
      window.location.replace("/");
    };
  });
})();
