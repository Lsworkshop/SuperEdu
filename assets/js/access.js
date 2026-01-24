/* =====================================================
   SnovaEdu Unified Access Control — PRODUCTION (Upgraded)
   Roles:
   - visitor
   - quick   (Quick Unlock)
   - lead    (Join List / Express Interest)
   - member  (Logged-in Member)  ✅ now synced with /api/me
===================================================== */

(function () {
  document.addEventListener("DOMContentLoaded", () => {

    /* ===============================
       1) Role Core (Quick/Lead stored locally)
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

    // Role flags (local, fast)
    let role = getRole();

    function recomputeFlags() {
      role = getRole();
      return {
        role,
        isQuick: ["quick", "lead", "member"].includes(role),
        isLead: ["lead", "member"].includes(role),
        isMember: role === "member",
      };
    }

    let flags = recomputeFlags();

    /* ===============================
   5. Nav UI Switch (Login / Logout / Dashboard)
=============================== */

const loginLink = document.querySelector(
  'a[href="/login.html"]'
);

const membershipLink = document.querySelector(
  'a[href="/membership.html"]'
);

// ---- MEMBER 状态 ----
if (isMember) {

  // Login -> Logout
  if (loginLink) {
    loginLink.textContent = "Logout";
    loginLink.dataset.en = "Logout";
    loginLink.dataset.zh = "退出登录";

    loginLink.href = "/logout.html";

    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      logoutMember();   // 你 access.js 里已经定义
    });
  }

  // Membership -> Dashboard
  if (membershipLink) {
    membershipLink.textContent = "Dashboard";
    membershipLink.dataset.en = "Dashboard";
    membershipLink.dataset.zh = "控制台";

    membershipLink.href = "/dashboard.html";
  }
}


    /* ===============================
       2) Sync member role from backend session
       - If /api/me success: upgrade to member silently
       - If not logged-in: keep current role (visitor/quick/lead)
    =============================== */

    async function syncMemberFromSession() {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data && data.success) {
          // ✅ Logged in => make them member (highest)
          if (getRole() !== "member") setRole("member");
          flags = recomputeFlags();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }

    /* ===============================
       3) Page Guard (redirects)
    =============================== */

    const pageType = document.body?.dataset?.page;

    async function guardPage() {
      // First sync member if possible
      const loggedIn = await syncMemberFromSession();

      // Refresh flags
      flags = recomputeFlags();

      if (!pageType) return;

      // EduCenter: quick+
      if (pageType === "quick-required" && !flags.isQuick) {
        window.location.replace("/quick-unlock.html");
        return;
      }

      // EduCommunity: lead+
      if (pageType === "lead-required" && !flags.isLead) {
        window.location.replace("/education.html");
        return;
      }

      // Member-only: must have backend session or member role
      // (we treat "member" role as logged-in)
      if ((pageType === "member-only" || pageType === "forum-required") && !loggedIn) {
        window.location.replace("/login.html");
        return;
      }
    }

    // Run guard
    guardPage();

    /* ===============================
       4) Navigation Control (block clicks only)
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
    guardNav("navEduCenter", () => recomputeFlags().isQuick, "Please unlock Education Center first.");
    guardNav("mobileEduCenter", () => recomputeFlags().isQuick, "Please unlock Education Center first.");

    // EduCommunity (lead+)
    guardNav("navEduCommunity", () => recomputeFlags().isLead, "EduCommunity requires Join List access.");
    guardNav("mobileEduCommunity", () => recomputeFlags().isLead, "EduCommunity requires Join List access.");

    // EduForum (member-only = logged-in)
    // ✅ Use backend session sync: if logged in, it will become member
    guardNav("navForum", () => recomputeFlags().isMember, "EduForum requires Member access. Please log in.");
    guardNav("mobileForum", () => recomputeFlags().isMember, "EduForum requires Member access. Please log in.");

    /* ===============================
       5) Upgrade APIs (global)
    =============================== */

    window.unlockQuick = function (redirect = "/education.html") {
      setRole("quick");
      window.location.replace(redirect);
    };

    window.upgradeToLead = function (redirect = "/education.html") {
      setRole("lead");
      window.location.replace(redirect);
    };

    // ✅ Member upgrade should not be used as "fake login"
    // but it is still useful after successful backend login.
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
