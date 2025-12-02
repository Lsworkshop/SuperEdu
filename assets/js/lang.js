// ===============================
//  lang.js — V1.0  
//  For SuperEdu bilingual website  
//  全站中英文切换（按钮、服务内容、导航、CTA 全包含）
// ===============================

const translations = {
    en: {
        nav_home: "Home",
        nav_services: "Services",
        nav_join: "Register / Join",
        nav_unlock: "Unlock",
        nav_contact: "Contact",

        hero_title: "SuperEdu — Unlock U.S. Education",
        hero_sub: "Your trusted pathway to U.S. schools, colleges, and financial aid.",
        hero_btn_register: "Join Now",
        hero_btn_unlock: "Quick Unlock — Education Center",

        service_title: "Our Services",
        service_1_title: "U.S. Education & Comparative Analysis",
        service_1_desc: "Macro analysis of U.S. K12 and higher education vs. mainland China.",
        service_2_title: "U.S. K12 School Selection",
        service_2_desc: "Guidance on U.S. public, private and charter school selection.",
        service_3_title: "College Admissions Strategy",
        service_3_desc: "Customized admission strategies for U.S. colleges.",
        service_4_title: "FAFSA Guidance",
        service_4_desc: "Full support for FAFSA application and financial aid planning.",
        service_5_title: "CSS Profile Assistance",
        service_5_desc: "Professional assistance for the CSS Profile submission.",
        service_6_title: "College Funding Strategy",
        service_6_desc: "Planning for college savings, scholarships and financial packages.",
        service_7_title: "Parent Education Coaching",
        service_7_desc: "Support for parents in understanding the U.S. education system.",
        service_8_title: "U.S. Life & Community Integration",
        service_8_desc: "Guidance for new immigrant or international student families.",
        service_9_title: "Career Development Pathways",
        service_9_desc: "Exploring college majors and professional career tracks.",
        service_10_title: "Education Center Unlock",
        service_10_desc: "Unlock full access to SuperEdu’s private learning center.",
        service_11_title: "College Housing Investment Service",
        service_11_desc: "Real estate consulting near universities to optimize living & investment.",

        service_apply_btn: "Apply for Service",

        about_title: "About SuperEdu",
        about_text: 
            "SuperEdu provides guidance for Chinese families worldwide on U.S. education, college admissions, FAFSA/CSS, and college funding planning.",

        webinar_title: "Upcoming Webinar",
        webinar_text:
            "Join our live webinar for FAFSA essentials and college funding strategies. Seats are limited — register now.",

        webinar_btn_main: "Join Webinar (Main Page)",
        webinar_btn_quick: "Quick Register for Webinar",

        resources_title: "Quick Resources",
        resources_desc: "Practical links for FAFSA, CSS Profile, college rankings and our Aid Calculator.",
        res_calc: "LSFinova Aid Calculator",
        res_fafsa: "FAFSA — studentaid.gov",
        res_css: "CSS Profile",
        res_rank: "US News — College Rankings",

        contact_title: "Contact",
        contact_phone: "Phone: 1 916-793-0676 (Texting Only)",
        contact_wechat: "WeChat ID: Leon_Song_PhD",

        footer_rights: "All rights reserved."
    },

    zh: {
        nav_home: "主页",
        nav_services: "服务内容",
        nav_join: "注册 / 加入",
        nav_unlock: "快速解锁",
        nav_contact: "联系方式",

        hero_title: "SuperEdu — 解锁美国教育",
        hero_sub: "为华人家庭提供美国留学、院校规划与助学金指导。",
        hero_btn_register: "立即加入",
        hero_btn_unlock: "快速解锁 — 教育中心",

        service_title: "我们的服务",
        service_1_title: "美国教育与中美比较分析",
        service_1_desc: "美国K12与高等教育对比中国大陆的宏观分析。",
        service_2_title: "美国K12学校选择",
        service_2_desc: "公立、私立与特许学校的择校指导。",
        service_3_title: "大学申请策略",
        service_3_desc: "为申请美国大学提供个性化规划策略。",
        service_4_title: "FAFSA助学金指导",
        service_4_desc: "FAFSA全流程申请支持与家庭资助规划。",
        service_5_title: "CSS Profile 专业协助",
        service_5_desc: "CSS Profile 填写与提交专业指导。",
        service_6_title: "大学资金规划",
        service_6_desc: "大学储蓄、奖学金与资助组合规划。",
        service_7_title: "家长教育辅导",
        service_7_desc: "帮助家长理解美国教育体系与路径。",
        service_8_title: "美国生活与社区融入",
        service_8_desc: "新移民或留学生家庭提供落地与文化支持。",
        service_9_title: "职业发展路径",
        service_9_desc: "探索专业方向与未来职业规划。",
        service_10_title: "教育中心解锁",
        service_10_desc: "解锁 SuperEdu 私人教育中心全部内容。",
        service_11_title: "大学周边房地产投资服务",
        service_11_desc: "帮助孩子获得优质住宿并实现房产最佳投资。",

        service_apply_btn: "申请服务",

        about_title: "关于 SuperEdu",
        about_text:
            "SuperEdu 为全球华人家庭提供美国教育、大学申请、FAFSA/CSS 助学金与大学资金规划服务。",

        webinar_title: "即将举行的讲座",
        webinar_text:
            "加入我们的直播讲座：FAFSA 要点与大学资金规划。名额有限，请立即注册。",

        webinar_btn_main: "加入讲座（主页面）",
        webinar_btn_quick: "快速注册讲座",

        resources_title: "快速资源",
        resources_desc: "FAFSA、CSS Profile、大学排名与助学金计算器的实用链接。",
        res_calc: "LSFinova 助学金计算器",
        res_fafsa: "FAFSA — studentaid.gov",
        res_css: "CSS Profile",
        res_rank: "US News — 大学排名",

        contact_title: "联系方式",
        contact_phone: "电话：1 916-793-0676 （仅限短信）",
        contact_wechat: "微信：Leon_Song_PhD",

        footer_rights: "版权所有。"
    }
};

// ===========================
// Language Switcher
// ===========================
function switchLanguage(lang) {
    document.querySelectorAll("[data-translate]").forEach(el => {
        const key = el.getAttribute("data-translate");
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // 按钮（value 属性）
    document.querySelectorAll("[data-translate-value]").forEach(el => {
        const key = el.getAttribute("data-translate-value");
        if (translations[lang][key]) {
            el.value = translations[lang][key];
        }
    });

    localStorage.setItem("lang", lang);
}

// ===========================
// Load Saved Language
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("lang") || "en";
    switchLanguage(saved);
});
