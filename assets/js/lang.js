(function () {
  const STORAGE_KEY = "superedu-lang";

  function applyLanguage(lang) {
    const isEN = lang === "en";

    // ① 切换 data-en / data-zh（菜单 & 通用）
    document.querySelectorAll("[data-en]").forEach(el => {
  el.innerHTML = isEN ? el.dataset.en : el.dataset.zh;
});

    // ② 切换正文中 id 结尾为 -en / -zh 的元素（Education 专用）
    document.querySelectorAll("[id$='-en']").forEach(el => {
      el.style.display = isEN ? "block" : "none";
    });

    document.querySelectorAll("[id$='-zh']").forEach(el => {
      el.style.display = isEN ? "none" : "block";
    });

    // ③ 同步按钮文字
    const toggleBtn = document.getElementById("langToggle");
    if (toggleBtn) {
      toggleBtn.textContent = isEN ? "中文" : "EN";
    }
  }

  // 初始化
  const savedLang = localStorage.getItem(STORAGE_KEY) || "en";
  applyLanguage(savedLang);

  // 绑定主菜单语言按钮
  const toggleBtn = document.getElementById("langToggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = localStorage.getItem(STORAGE_KEY) || "en";
      const next = current === "en" ? "zh" : "en";
      localStorage.setItem(STORAGE_KEY, next);
      applyLanguage(next);
    });
  }
})();
