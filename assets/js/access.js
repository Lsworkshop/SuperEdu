/* =====================================================
   SnovaEdu Unified Access Control
   Roles:
   - visitor  (default)
   - quick    (Quick Unlock)
   - lead     (Express Interest / Join List)
   - member   (Registered & Logged in)
===================================================== */

(function () {
  document.addEventListener("DOMContentLoaded", () => {

    /* ===============================
       1. Role Utilities (CORE)
    =============================== */

    function getRole() {
      return (
        localStorage.getItem("snovaRole") ||
        sessionStorage.getItem("snovaRole") ||
        "visitor"
      );
    }

    function setRole(role, persistent = false) {
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

    /* ===============================
       2. Role Helpers (Hierarchy)
    =============================== */

    const isQuick  = role === "quick" || role === "lead" || role === "member";
    const isLead   = role === "lead"  || role === "member";
    const isMember = role === "member";

    /* ===============================
       3. Visibility Control (UI)
       Usage: data-auth="quick|lead|member"
    =============================== */

    document.querySelectorAll("[data-auth]").forEach(el => {
      const need = el.dataset.auth;

      if (
        (need === "quick"  && !isQuick) ||
        (need === "lead"   && !isLead)  ||
        (need === "member" && !isMember)
      ) {
        el.classList.add("hidden");
      }
    });

    /* ===============================
       4. Navigation Control
    =============================== */

    // Hide Register / Login after Member login
    document.querySelectorAll(".nav-register, .nav-login").forEach(el => {
      if (isMember) el.classList.add("hidden");
    });

    // Show Member Center only for member
    document.querySelectorAll(".nav-member").forEach(el => {
      if (!isMember) el.classList.add("hidden");
    });

    /* ===============================
       5. Page Guard (Route Protection)
       Usage:
       <body data-page="quick-required">
       <body data-page="lead-required">
       <body data-page="member-only">
    =============================== */

    const pageType = document.body.dataset.page;

    // Quick Unlock required
    if (pageType === "quick-required" && !isQuick) {
      window.location.href = "/quick-unlock.html";
      return;
    }

    // Express Interest required
    if (pageType === "lead-required" && !isLead) {
      window.location.href = "/#tools-express-interest";
      return;
    }

    // Member only
    if (pageType === "member-only" && !isMember) {
      window.location.href = "/login.html";
      return;
    }

    /* ===============================
       6. Upgrade Hooks (PUBLIC API)
       Centralized upgrade + redirect
    =============================== */

    // Homepage Quick Unlock (session-only)
    window.unlockQuickSession = function (redirect = null) {
      setRole("quick", false);
      if (redirect) window.location.href = redirect;
    };

    // Unlock Page Quick Unlock (device-level)
    window.unlockQuickPersistent = function (redirect = null) {
      setRole("quick", true);
      if (redirect) window.location.href = redirect;
    };

    // Express Interest / Join List (device-level)
    window.upgradeToLead = function (redirect = "/education.html") {
      setRole("lead", true);
      if (redirect) window.location.href = redirect;
    };

    // Register / Login → Member
    window.upgradeToMember = function (redirect = "/member-center.html") {
      setRole("member", true);
      if (redirect) window.location.href = redirect;
    };

    // Logout
    window.logoutMember = function () {
      clearRole();
      window.location.href = "/";
    };

    /* ===============================
       7. Debug (optional)
    =============================== */

    // console.log("Snova Role:", role);

  });
})();
