/* =====================================================
   SnovaEdu Unified Access Control (STABLE FINAL)
===================================================== */

(function () {
  document.addEventListener("DOMContentLoaded", () => {

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

    const isQuick  = ["quick", "lead", "member"].includes(role);
    const isLead   = ["lead", "member"].includes(role);
    const isMember = role === "member";

    /* ===============================
       2. Page Guard
    =============================== */

    const pageType = document.body.dataset.page;

    if (pageType === "quick-required" && !isQuick) {
      window.location.replace("/quick-unlock.html");
      return;
    }

    if (pageType === "lead-required" && !isLead) {
      window.location.replace("/quick-unlock.html");
      return;
    }

    if (pageType === "member-only" && !isMember) {
      window.location.replace("/login.html");
      return;
    }

    /* ===============================
       3. EduCenter Navigation Control
    =============================== */

    function bindEduCenter(id) {
      const el = document.getElementById(id);
      if (!el) return;

      el.addEventListener("click", (e) => {
        e.preventDefault();

        if (isLead) {
          window.location.href = "/education.html";
        } else if (isQuick) {
          window.location.href = "/quick-unlock.html";
        } else {
          window.location.href = "/#tools";
        }
      });
    }

    bindEduCenter("navEduCenter");
    bindEduCenter("mobileEduCenter");

    /* ===============================
       4. Upgrade APIs
    =============================== */

    window.unlockQuickSession = function () {
      setRole("quick", false);
      window.location.href = "/education.html";
    };

    window.unlockQuickPersistent = function () {
      setRole("quick", true);
      window.location.href = "/education.html";
    };

    window.upgradeToLead = function () {
      setRole("lead", true);
      window.location.href = "/education.html";
    };

    window.upgradeToMember = function () {
      setRole("member", true);
      window.location.href = "/education.html";
    };

    window.logoutMember = function () {
      clearRole();
      window.location.href = "/";
    };

    // console.log("Snova Role:", role);
  });
})();
