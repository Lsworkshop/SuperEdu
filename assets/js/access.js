// /assets/js/access.js

document.addEventListener("DOMContentLoaded", () => {

  const body = document.body;
  const pageType = body.dataset.page; // quick-required

  if (pageType !== "quick-required") return;

  // ===== 1. 判断登录 =====
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    // 未登录
    window.location.replace("/login.html");
    return;
  }

  // ===== 2. 判断 Edu 权限 =====
  if (!user.educationUnlocked) {
    // 已登录但没解锁
    window.location.replace("/membership.html");
    return;
  }

  // ===== 3. 有权限，才显示页面 =====
  body.style.visibility = "visible";
});



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
   Page Guard — MUST RUN IMMEDIATELY
================================ */

(function () {
  const pageType = document.body?.dataset?.page;
  if (!pageType) return;

  const role =
    localStorage.getItem("snovaRole") ||
    sessionStorage.getItem("snovaRole") ||
    "visitor";

  const isQuick  = ["quick", "lead", "member"].includes(role);
  const isLead   = ["lead", "member"].includes(role);
  const isMember = role === "member";

  const isOnQuickUnlockPage =
    window.location.pathname.includes("quick-unlock");

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
})();

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

   window.unlockQuickSession = function (redirect = "/education.html") {
  setRole("quick", false);

  // 确保 role 已写入
  setTimeout(() => {
    window.location.replace(redirect);
  }, 50);
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

   
  });
})();
