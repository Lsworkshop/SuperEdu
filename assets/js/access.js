/* =====================================================
   SnovaEdu Unified Access Control — PRODUCTION
   Priority:
   1) If /api/me confirms session => role = "member"
   2) Else fallback to local/session storage role:
      visitor | quick | lead
   Notes:
   - Member (logged in) is the highest privilege.
   - quick/lead are for pre-login gated access (Quick Unlock / Join List).
===================================================== */

(function () {
  document.addEventListener("DOMContentLoaded", async () => {
    /* ===============================
       1) Local Role Core (quick/lead)
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
       2) Server Auth Check (member)
    =============================== */

    async function isLoggedInMember() {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        return !!(res.ok && data && data.success);
      } catch (err) {
        // Network / blocked / temporary error: treat as not logged-in
        console.warn("access.js: /api/me check failed:", err);
        return false;
      }
    }

    async function getEffectiveRole() {
      // If server session is valid, treat as "member"
      const loggedIn = await isLoggedInMember();
      if (loggedIn) return "member";

      // Else fallback to stored role (quick/lead/visitor)
      return getStoredRole();
    }

    const role = await getEffectiveRole();

    const isQuick = ["quick", "lead", "member"].includes(role);
    const isLead = ["lead", "member"].includes(role);
    const isMember = role === "member";

    /* ===============================
       3) Page Guard (唯一跳转源)
       Use <body data-page="...">
       - quick-required
       - lead-required
       - member-only
       - forum-required
    =============================== */

    const pageType = document.body?.dataset?.page;

    if (pageType) {
      // EduCenter: quick+
      if (pageType === "quick-required" && !isQuick) {
        window.location.replace("/quick-unlock.html");
        return;
      }

      // EduCommunity: lead+
      if (pageType === "lead-required" && !isLead) {
        window.location.replace("/education.html");
        return;
      }

      // Member-only pages
      if (pageType === "member-only" && !isMember) {
        window.location.replace("/login.html");
        return;
      }

      // EduForum (Members Only)
      if (pageType === "forum-required" && !isMember) {
        window.location.replace("/login.html");
        return;
      }
    }

    /* ===============================
       4) Navigation Control
       - Only intercept; do NOT redirect automatically
       - Keep IDs consistent with your nav HTML
    =============================== */

    function guardNav(id, allowFn, denyMsg) {
      const el = document.getElementById(id);
      if (!el) return;

      el.addEventListener("click", (e) => {
        if (!allowFn()) {
          e.preventDefault();
          if (denyMsg) alert(denyMsg);
        }
      });
    }

    // EduCenter (quick+)
    guardNav(
      "navEduCenter",
      () => isQuick,
      "Please unlock Education Center first."
    );
    guardNav(
      "mobileEduCenter",
      () => isQuick,
      "Please unlock Education Center first."
    );

    // EduCommunity (lead+)
    guardNav(
      "navEduCommunity",
      () => isLead,
      "EduCommunity requires Join List access."
    );
    guardNav(
      "mobileEduCommunity",
      () => isLead,
      "EduCommunity requires Join List access."
    );

    // EduForum (member)
    guardNav(
      "navForum",
      () => isMember,
      "EduForum requires Member access. Please log in."
    );
    guardNav(
      "mobileForum",
      () => isMember,
      "EduForum requires Member access. Please log in."
    );

    /* ===============================
       5) Upgrade APIs (全站调用)
       Note:
       - upgradeToMember sets local role but server session is the truth.
       - After login via cookie, role becomes member automatically.
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
      // Optional fallback; true member is defined by /api/me
      setRole("member");
      window.location.replace(redirect);
    };

    window.logoutMember = function () {
      // Local quick/lead cleanup
      clearRole();
      // Real logout should be /logout.html -> /api/logout
      window.location.replace("/");
    };

    // Debug (optional)
    // console.log("Effective Role:", role);
  });
})();
