/* =====================================================
   SnovaEdu Unified Access Control — FINAL STABLE
   Roles:
   - visitor
   - quick   (Quick Unlock)
   - lead    (Join List / Express Interest)
   - member  (Logged-in Member)
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
       2. Page Guard (核心修正点)
    =============================== */

    const pageType = document.body?.dataset?.page;
    if (pageType) {
      const path = window.location.pathname;

      // Quick-required → EduCenter
      if (pageType === "quick-required" && !isQuick) {
        window.location.replace("/quick-unlock.html");
        return;
      }

      // Lead-required → EduCommunity
      if (pageType === "lead-required" && !isLead) {
        window.location.replace("/education.html");
        return;
      }

      // Member-only
      if (pageType === "member-only" && !isMember) {
        window.location.replace("/login.html");
        return;
      }
    }

    /* ===============================
       3. Navigation Control (主菜单)
    =============================== */

    function bindNav(id, target, condition, fallback) {
      const el = document.getElementById(id);
      if (!el) return;

      el.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = condition ? target : fallback;
      });
    }

    // EduCenter 菜单
    bindNav(
      "navEduCenter",
      "/education.html",
      isQuick,
      "/quick-unlock.html"
    );

    bindNav(
      "mobileEduCenter",
      "/education.html",
      isQuick,
      "/quick-unlock.html"
    );

    // EduCommunity 菜单（只读）
    bindNav(
      "navEduCommunity",
      "/educommunity.html",
      isLead,
      "/education.html"
    );

    bindNav(
      "mobileEduCommunity",
      "/educommunity.html",
      isLead,
      "/education.html"
    );

    /* ===============================
       4. Upgrade APIs（全站可用）
    =============================== */

    // Quick Unlock（一次或设备级都可）
    window.unlockQuick = function (redirect = "/education.html") {
      setRole("quick");
      window.location.replace(redirect);
    };

    // Join List / Express Interest
    window.upgradeToLead = function (redirect = "/education.html") {
      setRole("lead");
      window.location.replace(redirect);
    };

    // Member
    window.upgradeToMember = function (redirect = "/education.html") {
      setRole("member");
      window.location.replace(redirect);
    };

    // Logout
    window.logoutMember = function () {
      clearRole();
      window.location.replace("/");
    };

    // console.log("Snova Role:", role);

  });
})();
