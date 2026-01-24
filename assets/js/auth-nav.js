/* =====================================================
   Auth Nav Switch — Production
   - Switch top nav Login <-> Logout based on /api/me
   - Keep language attributes for lang.js
===================================================== */

(async function () {
  async function isLoggedIn() {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      return !!(res.ok && data && data.success);
    } catch {
      return false;
    }
  }

  function setAuthLink(el, loggedIn) {
    if (!el) return;

    if (loggedIn) {
      el.href = "/logout.html";
      el.textContent = el.dataset.en ? el.dataset.en.replace("Login", "Logout") : "Logout";

      // 强制补齐 data-en / data-zh（避免某些页面没写）
      el.dataset.en = "Logout";
      el.dataset.zh = "退出";
      el.textContent = "Logout";
    } else {
      el.href = "/login.html";
      el.dataset.en = "Login";
      el.dataset.zh = "登录";
      el.textContent = "Login";
    }
  }

  function setMobileAuth(el, loggedIn) {
    if (!el) return;
    if (loggedIn) {
      el.href = "/logout.html";
      el.dataset.en = "Logout";
      el.dataset.zh = "退出";
      el.textContent = "Logout";
    } else {
      el.href = "/login.html";
      el.dataset.en = "Login";
      el.dataset.zh = "登录";
      el.textContent = "Login";
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const loggedIn = await isLoggedIn();

    // Desktop: add id="navAuth" on your Login link
    setAuthLink(document.getElementById("navAuth"), loggedIn);

    // Mobile: you already have id="mobileLogin"
    setMobileAuth(document.getElementById("mobileLogin"), loggedIn);

    // If you want: hide "member-only" badge when not logged in
    // (optional; comment out if you prefer always showing it)
    if (!loggedIn) {
      document.querySelectorAll(".member-only").forEach(el => {
        el.style.display = "inline-block";
        el.style.opacity = "0.75";
      });
    }

    // If lang.js applies language at load, it will read updated data-en/zh
    // If you have a manual apply function, you can call it here:
    if (typeof window.applyLanguage === "function") window.applyLanguage();
  });
})();
