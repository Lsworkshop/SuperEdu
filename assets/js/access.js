/* =====================================================
   SnovaEdu Unified Access Control
   Roles:
   - visitor
   - quick   (Unlock)
   - lead    (Express Interest)
   - member  (Registered & Logged in)
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
       2. Role Helpers
    =============================== */

    const isQuick  = role === "quick" || role === "lead" || role === "member";
    const isLead   = role === "lead"  || role === "member";
    const isMember = role === "member";

    /* ===============================
       3. Visibility Control
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

    document.querySelectorAll(".nav-register, .nav-login").forEach(el => {
      if (isMember) el.classList.add("hidden");
    });

    document.querySelectorAll(".nav-member").forEach(el => {
      if (!isMember) el.classList.add("hidden");
    });

    /* ===============================
       5. Page Guard
    =============================== */

    const pageType = document.body.dataset.page;

    if (pageType === "quick-required" && !isQuick) {
      window.location.href = "/quick-unlock.html";
    }

    if (pageType === "lead-required" && !isLead) {
       window.location.href = "/#tools";
    }

    if (pageType === "member-only" && !isMember) {
      window.location.href = "/login.html";
    }

    /* ===============================
       6. Upgrade Hooks (PUBLIC API)
    =============================== */

    // Homepage Quick Unlock (一次性)
    window.unlockQuickSession = function () {
      setRole("quick", false);
    };

    // Unlock Page (设备级)
    window.unlockQuickPersistent = function () {
      setRole("quick", true);
    };

    // Express Interest (设备级)
    window.upgradeToLead = function () {
      setRole("lead", true);
    };

    // Register / Login
    window.upgradeToMember = function () {
      setRole("member", true);
    };

    // Logout
    window.logoutMember = function () {
      clearRole();
      window.location.href = "/";
    };

    /* ===============================
       7. Debug
    =============================== */

    // console.log("Snova Role:", role);

  });
})();
