/* ======================================================
   SuperEdu — menu.js V1.0
   1) 导航栏：默认半透明 → 滚动后更透明 + 模糊增强
   2) 移动端：汉堡菜单展开/收起
   3) 与 main.css 完整对应
   ====================================================== */

(function () {

    const nav = document.getElementById("topNav");
    const hamburger = document.getElementById("hamburger");
    const mobileMenu = document.getElementById("mobileMenu");

    /* ===============================
       1. 导航栏滚动行为
       默认：半透明
       滚动：更透明 + 增强模糊
       =============================== */
    function updateNav() {
        const y = window.scrollY;

        if (y > 40) {
            nav.classList.remove("nav--half");
            nav.classList.add("nav--more-transparent");
        } else {
            nav.classList.add("nav--half");
            nav.classList.remove("nav--more-transparent");
        }
    }

    window.addEventListener("scroll", updateNav);
    updateNav();



    /* ===============================
       2. 移动端汉堡菜单
       =============================== */

    if (hamburger) {
        hamburger.addEventListener("click", () => {
            const isOpen = mobileMenu.classList.contains("open");

            if (isOpen) {
                mobileMenu.classList.remove("open");
                mobileMenu.style.display = "none";
                hamburger.classList.remove("active");
            } else {
                mobileMenu.classList.add("open");
                mobileMenu.style.display = "block";
                hamburger.classList.add("active");
            }
        });
    }

    /* 点击菜单项后关闭 mobile menu */
    if (mobileMenu) {
        mobileMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                mobileMenu.classList.remove("open");
                mobileMenu.style.display = "none";
                hamburger.classList.remove("active");
            });
        });
    }


    /* ===============================
       3. 可选的小优化：调整小屏按钮触控面积
       =============================== */
    function adjustPadding() {
        if (window.innerWidth <= 720) {
            nav.style.padding = "10px 14px";
        } else {
            nav.style.padding = "14px 20px";
        }
    }

    window.addEventListener("resize", adjustPadding);
    adjustPadding();


})();
