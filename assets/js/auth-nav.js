/* =====================================================
   Auth Nav Switch — FINAL (ID-compatible)
   - Switch Login <-> Logout based on /api/me
   - Switch Membership <-> Dashboard when logged in
   - Works with different id names (desktopLogin/mobileLogin etc.)
===================================================== */

(function () {
  function getLang() {
    return localStorage.getItem("superedu-lang") || "en";
  }

  function applyTextByLang(el) {
    if (!el) return;
    const lang = getLang();
    const en = el.dataset.en || el.textContent || "";
    const zh = el.dataset.zh || el.textContent || "";
    el.textContent = (lang === "zh") ? zh : en;
  }

  function pickEl(...ids) {
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) return el;
    }
    return null;
  }

  async function isLoggedIn() {
    try {
      const res = await fetch("/api/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store"
      });
      const data = await res.json().catch(() => ({}));
      return !!(res.ok && data && data.success);
    } catch {
      return false;
    }
  }

  function setLink(el, { href, en, zh }) {
    if (!el) return;
    el.href = href;
    el.dataset.en = en;
    el.dataset.zh = zh;
    applyTextByLang(el);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const loggedIn = await isLoggedIn();

    // ✅ Login / Logout link (support your new IDs)
    const desktopAuth = pickEl("desktopLogin", "desktopAuth", "navAuth");
    const mobileAuth  = pickEl("mobileLogin", "mobileAuth");

    // ✅ Membership / Dashboard link (support both styles)
    const desktopMembership = pickEl("navMembership", "desktopMembership");
    const mobileMembership  = pickEl("mobileMembership");

    if (loggedIn) {
      // Login -> Logout
      setLink(desktopAuth, { href: "/logout.html", en: "Logout", zh: "退出" });
      setLink(mobileAuth,  { href: "/logout.html", en: "Logout", zh: "退出" });

      // Membership -> Dashboard
      setLink(desktopMembership, { href: "/dashboard.html", en: "Dashboard", zh: "会员中心" });
      setLink(mobileMembership,  { href: "/dashboard.html", en: "Dashboard", zh: "会员中心" });
    } else {
      // Logout -> Login
      setLink(desktopAuth, { href: "/login.html", en: "Login", zh: "登录" });
      setLink(mobileAuth,  { href: "/login.html", en: "Login", zh: "登录" });

      // Dashboard -> Membership
      setLink(desktopMembership, { href: "/membership.html", en: "Membership", zh: "会员中心" });
      setLink(mobileMembership,  { href: "/membership.html", en: "Membership", zh: "会员中心" });
    }

    // ✅ If your lang.js exposes an apply function, refresh text
    if (typeof window.applyLanguage === "function") window.applyLanguage();
  });
})();
