// /assets/js/access.js
document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     1. Role Core
  =============================== */

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
    }
    updateButtons();
  }

  function clearRole() {
    localStorage.removeItem("snovaRole");
    sessionStorage.removeItem("snovaRole");
    updateButtons();
  }

  const role = getRole();
  const isQuick  = ["quick", "lead", "member"].includes(role);
  const isLead   = ["lead", "member"].includes(role);
  const isMember = role === "member";

  /* ===============================
     2. Page Guard
  =============================== */

  const pageType = document.body?.dataset?.page;
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

  // 页面可见
  document.body.style.visibility = "visible";

  /* ===============================
     3. EduCenter & Menu Button Control
  =============================== */

  function bindEduCenter(id) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("click", (e) => {
      e.preventDefault();
      if (isLead || isMember) {
        window.location.href = "/education.html";
      } else if (role === "quick") {
        window.location.href = "/quick-unlock.html";
      } else {
        window.location.href = "/#tools";
      }
    });
  }

  bindEduCenter("navEduCenter");
  bindEduCenter("mobileEduCenter");

  function updateButtons() {
    const joinBtn = document.getElementById("joinClubBtn");
    const eduCommunityBtn = document.getElementById("eduCommunityBtn");

    if (joinBtn) {
      if (isLead || isMember || role === "quick") {
        joinBtn.textContent = "进入 EduCenter";
        joinBtn.onclick = () => { window.location.href = "/education.html"; };
      } else {
        joinBtn.textContent = joinBtn.dataset.en || "Join the Club";
      }
    }

    if (eduCommunityBtn) {
      eduCommunityBtn.style.display = (isLead || isMember || role === "quick") ? "inline-block" : "none";
      eduCommunityBtn.onclick = () => { window.location.href = "/educommunity.html"; };
    }
  }

  updateButtons();

  /* ===============================
     4. Upgrade APIs
  =============================== */

  window.unlockQuickSession = function (redirect = "/education.html") {
    setRole("quick", false);
    setTimeout(() => {
      window.location.replace(redirect);
    }, 50);
  };

  window.unlockQuickPersistent = function () {
    setRole("quick", true);
    window.location.href = "/education.html";
  };

  window.expressInterestJoin = function () {
    // 加入名单成功 → 直接设置 lead 权限
    setRole("lead", true);
    alert("加入名单成功！现在可以进入 EduCenter 和 EduCommunity。");
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
