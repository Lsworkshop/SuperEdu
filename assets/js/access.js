/* =====================================================
   Snova Unified Access Control — FINAL STABLE VERSION
   Authoritative source of truth: snovaRole
===================================================== */

(function () {

  /* =========================================
     1. Role Storage Core
  ========================================= */
  function getRole() {
    return localStorage.getItem("snovaRole") ||
           sessionStorage.getItem("snovaRole") ||
           "visitor";
  }

  function setRole(role, persistent = false) {
    if (persistent) {
      localStorage.setItem("snovaRole", role);
      sessionStorage.removeItem("snovaRole");
    } else {
      sessionStorage.setItem("snovaRole", role);
      localStorage.removeItem("snovaRole");
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
     2. Page Guard (防闪退)
  ========================================= */
  document.addEventListener("DOMContentLoaded", () => {

    const pageType = document.body?.dataset?.page;
    if (!pageType) return;

    const isOnQuickUnlockPage = window.location.pathname.includes("quick-unlock");

    if (pageType === "quick-required" && !isQuick) {
      if (!isOnQuickUnlockPage) {
        window.location.replace("/quick-unlock.html");
      }
      return;
    }

    if (pageType === "lead-required" && !isLead) {
      window.location.replace("/#tools");
      return;
    }

    if (pageType === "member-only" && !isMember) {
      window.location.replace("/login.html");
      return;
    }

    // 页面权限验证通过后显示
    document.body.style.visibility = "visible";
  });

  /* =========================================
     3. EduCenter Menu 控制
  ========================================= */
  function bindEduCenter(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("click", (e) => {
      e.preventDefault();

      const currentRole = getRole();
      if (["quick", "lead", "member"].includes(currentRole)) {
        window.location.href = "/education.html";
      } else {
        window.location.href = "/quick-unlock.html";
      }
    });
  }

  bindEduCenter("navEduCenter");
  bindEduCenter("mobileEduCenter");

  /* =========================================
     4. Unlock / Upgrade API
  ========================================= */

  // 一次性 Quick Unlock（session）
  window.unlockQuickSession = function (redirect = "/education.html") {
    setRole("quick", false);
    // 等待写入完成再跳转
    setTimeout(() => window.location.replace(redirect), 30);
  };

  // 持久 Quick Unlock（localStorage）
  window.unlockQuickPersistent = function () {
    setRole("quick", true);
    setTimeout(() => window.location.replace("/education.html"), 30);
  };

  // Express Interest / 加入名单（Lead）
  window.upgradeToLead = function () {
    setRole("lead", true);
    setTimeout(() => window.location.replace("/education.html"), 30);
  };

  // Member
  window.upgradeToMember = function () {
    setRole("member", true);
    setTimeout(() => window.location.replace("/education.html"), 30);
  };

  // Logout
  window.logoutMember = function () {
    clearRole();
    window.location.replace("/");
  };

})();
