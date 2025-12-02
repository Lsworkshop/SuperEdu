/* ==========================================
   SuperEdu — lang.js V1.0
   全站语言切换：英文 <-> 中文
   ========================================== */

const langData = {
    en: {
        nav_home: "Home",
        nav_services: "Services",
        nav_resources: "Resources",
        nav_contact: "Contact",

        hero_title: "Unlock U.S. Education — Smarter, Faster, Globally",
        hero_subtitle: "SuperEdu helps international families navigate U.S. K12, college admission, FAFSA/CSS financial aid, and long-term education planning.",

        btn_register: "Register / Join",
        btn_unlock: "Quick Unlock — Education Center",
        btn_apply: "Apply for Service",
        btn_enter_center: "Enter Education Center (Locked)",

        about_title: "About SuperEdu",
        about_text:
            "SuperEdu provides guidance for Chinese families worldwide on U.S. education, college admissions, financial aid (FAFSA/CSS), and long-term college funding planning.",

        webinar_title: "Upcoming Webinar",
        webinar_text:
            "Join our live webinar for FAFSA essentials and college funding strategies. Seats are limited — register to reserve a spot.",
        btn_join_webinar: "Join Webinar",
        btn_quick_register_webinar: "Quick Register for Webinar",

        service_title: "Professional Services",
        service_1_title: "1. U.S. Education & Comparative Analysis",
        service_1_desc: "Macro analysis of U.S. K12 and higher education vs. mainland China.",
        service_2_title: "2. College Planning",
        service_2_desc: "Customized academic and extracurricular strategy for U.S. college admissions.",
        service_3_title: "3. FAFSA Guidance",
        service_3_desc: "Step-by-step FAFSA support for maximizing federal aid.",
        service_4_title: "4. CSS Profile Support",
        service_4_desc: "Comprehensive assistance for CSS Profile to improve institutional aid eligibility.",
        service_5_title: "5. Need-Based Aid Strategy",
        service_5_desc: "Advanced analysis to optimize family financial presentation for aid.",
        service_6_title: "6. Merit Scholarship Planning",
        service_6_desc: "Targeted approach for maximizing merit-based scholarships.",
        service_7_title: "7. Ivy/Elite School Special Support",
        service_7_desc: "High-tier application strategy for competitive universities.",
        service_8_title: "8. U.S. Private School Applications",
        service_8_desc: "Full guidance for U.S. boarding and private school admissions.",
        service_9_title: "9. College Funding Plan",
        service_9_desc: "Long-term education funding and tax-efficient planning.",
        service_10_title: "10. International Family Education Planning",
        service_10_desc: "Integrated K12 + college roadmap for global families.",
        service_11_title: "11. College-Area Real Estate Planning",
        service_11_desc: "Advisory for housing investment near universities to support students and optimize long-term returns.",

        resource_title: "Quick Resources",
        resource_text: "Practical links for FAFSA, CSS Profile, college rankings and our Aid Calculator.",
        res_calc: "LSFinova Aid Calculator",
        res_fafsa: "FAFSA — studentaid.gov",
        res_css: "CSS Profile",
        res_usnews: "US News — College Rankings",

        contact_title: "Contact",
        contact_phone: "Phone: 1-916-793-0676 (Text Only)",
        contact_wechat: "WeChat ID: Leon_Song_PhD",

        footer_text: "© 2025 SuperEdu. All Rights Reserved."
    },

    zh: {
        nav_home: "首页",
        nav_services: "服务内容",
        nav_resources: "快速资源",
        nav_contact: "联系我们",

        hero_title: "解锁美国教育 —— 更快、更准、更智慧",
        hero_subtitle: "SuperEdu 为全球华人家庭提供美国 K12、高校申请、FAFSA/CSS 助学金规划及长期教育规划服务。",

        btn_register: "注册 / 加入",
        btn_unlock: "快速解锁 —— 教育中心",
        btn_apply: "申请服务",
        btn_enter_center: "进入教育中心（已加锁）",

        about_title: "关于 SuperEdu",
        about_text:
            "SuperEdu 为全球华人家庭提供美国教育咨询、大学申请规划、FAFSA/CSS 助学金规划以及长期教育基金规划。",

        webinar_title: "即将上线的直播课",
        webinar_text:
            "加入我们的 FAFSA 助学金与大学资金规划直播课。名额有限，请提前预约。",
        btn_join_webinar: "加入直播课",
        btn_quick_register_webinar: "快速报名直播课",

        service_title: "专业服务内容",
        service_1_title: "1. 美国教育体系与对比分析",
        service_1_desc: "对美国 K12 与高等教育体系进行宏观分析，并与中国大陆教育体系对比。",
        service_2_title: "2. 大学规划与策略制定",
        service_2_desc: "提供学术与课外活动规划，助力美国大学申请。",
        service_3_title: "3. FAFSA 助学金申请指导",
        service_3_desc: "逐步指导填写 FAFSA，帮助学生获取更多联邦资助。",
        service_4_title: "4. CSS Profile 申请支持",
        service_4_desc: "全面协助完成 CSS Profile，提高学校奖助金获批概率。",
        service_5_title: "5. 基于需求的助学金策略",
        service_5_desc: "优化家庭财务呈现方式，提升助学金获得率。",
        service_6_title: "6. 优秀奖学金规划",
        service_6_desc: "制定策略，最大化获得优秀学生奖学金的机会。",
        service_7_title: "7. 顶尖名校申请特别支持",
        service_7_desc: "针对藤校与精英大学的高级申请策略。",
        service_8_title: "8. 美国私立学校申请指导",
        service_8_desc: "提供美国寄宿与私立学校申请的全流程指导。",
        service_9_title: "9. 大学资金规划方案",
        service_9_desc: "提供长期教育资金规划与税务优化策略。",
        service_10_title: "10. 国际家庭教育规划",
        service_10_desc: "为海外家庭提供从 K12 到大学的一体化教育规划路线图。",
        service_11_title: "11. 大学周边房地产投资与规划",
        service_11_desc: "为孩子大学就读提供住房投资方案，实现优质居住 + 房产增值。",

        resource_title: "Quick Resources —— 快速资源",
        resource_text: "FAFSA、CSS Profile、大学排名与助学金计算器等实用链接。",
        res_calc: "LSFinova 助学金计算器",
        res_fafsa: "FAFSA — studentaid.gov（联邦助学金）",
        res_css: "CSS Profile（学校助学金）",
        res_usnews: "US News — 美国大学排名",

        contact_title: "联系我们",
        contact_phone: "电话：1-916-793-0676（仅短信）",
        contact_wechat: "微信 ID：Leon_Song_PhD",

        footer_text: "© 2025 SuperEdu 版权所有"
    }
};

/* ==========================================
   Apply Language to DOM
========================================== */
function applyLanguage(lang) {
    document.querySelectorAll("[data-lang]").forEach(el => {
        const key = el.getAttribute("data-lang");
        if (langData[lang][key]) {
            el.innerHTML = langData[lang][key];
        }
    });
}

/* ==========================================
   Language Switch Button
========================================== */
const langBtn = document.getElementById("langBtn");
let currentLang = "en";

langBtn.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "zh" : "en";
    applyLanguage(currentLang);
    langBtn.innerHTML = currentLang === "en" ? "中文" : "EN";
});

/* 默认加载英文 */
applyLanguage("en");
