// ===============================
// menu.js — V1.0  
// SuperEdu Navigation + Mobile Menu + Transparent Header Scroll Effect
// ===============================

// Mobile menu elements
const menuBtn = document.querySelector(".menu-btn");
const mobileMenu = document.querySelector(".mobile-menu");
const menuOverlay = document.querySelector(".menu-overlay");

// ===============================
// 1. Mobile Menu Toggle
// ===============================
if (menuBtn) {
    menuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("active");
        menuOverlay.classList.toggle("active");
    });
}

// Close menu when clicking overlay
if (menuOverlay) {
    menuOverlay.addEventListener("click", () => {
        mobileMenu.classList.remove("active");
        menuOverlay.classList.remove("active");
    });
}

// Close menu when selecting item (mobile)
document.querySelectorAll(".mobile-menu a").forEach(item => {
    item.addEventListener("click", () => {
        mobileMenu.classList.remove("active");
        menuOverlay.classList.remove("active");
    });
});

// ===============================
// 2. Transparent Header → More Transparent on Scroll
// ===============================
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    if (!header) return;

    if (window.scrollY > 40) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
});

// ===============================
// 3. Smooth Scrolling for internal links like Register / Join & Unlock
// ===============================
document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId.length > 1) {
            e.preventDefault();
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                window.scrollTo({
                    top: targetEl.offsetTop - 80,
                    behavior: "smooth"
                });
            }
        }
    });
});
