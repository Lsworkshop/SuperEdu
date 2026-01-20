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
       2. Page Guard（唯一跳转源）
    =============================== */

    const pageType = document.body?.dataset?.page;

    if (pageType) {
      // EduCenter
      if (pageType === "quick-required" && !isQuick) {
        window.location.replace("/quick-unlock.html");
        return;
      }

      // EduCommunity（lead 以上）
      if (pageType === "lead-required" && !isLead) {
        window.location.replace("/education.html");
        return;
      }

      // Member-only
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
       3. Navigation Control（只拦截，不跳转）
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

    // EduCenter
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

    // EduCommunity
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

    // EduForum (Members only)
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
       4. Upgrade APIs（全站调用）
    =============================== */

    window.unlockQuick = function (redirect = "/education.html") {
      setRole("quick");
      window.location.replace(redirect);
    };

    window.upgradeToLead = function (redirect = "/education.html") {
      setRole("lead");
      window.location.replace(redirect);
    };

    window.upgradeToMember = function (redirect = "/education.html") {
      setRole("member");
      window.location.replace(redirect);
    };

    window.logoutMember = function () {
      clearRole();
      window.location.replace("/");
    };

    // console.log("Snova Role:", role);
  });
})();
