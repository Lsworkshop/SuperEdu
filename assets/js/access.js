/* =====================================================
   Snova Unified Access Control — FINAL STABLE VERSION
   Authoritative source of truth: snovaRole
===================================================== */

(function () {

  /* =========================================
     1. Role Storage Core
  ========================================= */

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

  /* =========================================
     2. Page Guard (唯一入口，防闪退)
     依赖 body[data-page]
  ========================================= */

  document.addEventListener("DOMContentLoaded", () => {

    const pageType = document.body?.dataset?.page;
    if (!pageType) return;

    const isOnQuickUnlockPage =
      window.location.pathname.includes("quick-unlock");

    // —— Quick Required (EduCenter) ——
    if (pageType === "quick-required" && !isQuick) {
      if (!isOnQuickUnlockPage) {
        window.location.replace("/quick-unlock.html");
      }
      return;
    }

    // —— Lead Required ——
    if (pageType === "lead-required" && !isLead) {
      window.location.replace("/#tools");
      return;
    }

    // —— Member Only ——
    if (pageType === "member-only" && !isMember) {
      window.location.replace("/login.html");
      return;
    }
  });

  /* =========================================
     3. EduCenter Navigation Control
     （主菜单 & 移动端）
  ========================================= */

  function bindEduCenter(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("click", (e) => {
      e.preventDefault();

      if (isQuick) {
        window.location.href = "/education.html";
      } else {
        window.location.href = "/#tools";
      }
    });
  }

  bindEduCenter("navEduCenter");
  bindEduCenter("mobileEduCenter");

  /* =========================================
     4. Upgrade / Unlock APIs
     （供页面按钮调用）
  ========================================= */

  // Quick Unlock（一次性，session）
  window.unlockQuickSession = function (redirect = "/education.html") {
    setRole("quick", false);
    setTimeout(() => {
      window.location.replace(redirect);
    }, 30);
  };

  // Quick Unlock（多次性，local）
  window.unlockQuickPersistent = function () {
    setRole("quick", true);
    window.location.replace("/education.html");
  };

  // Express Interest / Join List（设备级，多次有效）
  window.upgradeToLead = function () {
    setRole("lead", true);
    window.location.replace("/education.html");
  };

  // Member
  window.upgradeToMember = function () {
    setRole("member", true);
    window.location.replace("/education.html");
  };

  // Logout
  window.logoutMember = function () {
    clearRole();
    window.location.replace("/");
  };

})();
