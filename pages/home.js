import { buildLevelCard } from "./components/levelCard.js";
import { buildXpCard } from "./components/xpCard.js";
import { buildAuditCard } from "./components/auditCard.js";
import { buildBarChartCard } from "./components/barChart.js";
import { buildRadarChartCard } from "./components/radarChart.js";
import { ranksDefinitions } from "../config.js";
import { initializeButtonAnimation } from "../pages/components/netflixAnimation.js";

const HOME_TRANSITION_KEY = "postLoginTransition";

const sampleData = {
    username: "dshowait",
    userId: "6353",
    rank: "Apprentice Developer",
    email: "dana.showaiter23@gmail.com",
    level: 12,
    currentXp: 45200,
    xpToNextLevel: 50000,
    totalXp: 245200,
    auditsDone: 42,
    auditsReceived: 38,
    xpHistory: [
        { month: "Jan", xp: 12000 },
        { month: "Feb", xp: 18500 },
        { month: "Mar", xp: 24000 },
        { month: "Apr", xp: 31200 },
        { month: "May", xp: 38900 },
        { month: "Jun", xp: 45200 }
    ]
};

function getRankName(level=0) {
    for (let i = ranksDefinitions.length - 1; i >= 0; i--) {
        if (level >= ranksDefinitions[i].level) {
            return ranksDefinitions[i].name;
        }
    }
    return ranksDefinitions[0]?.name || "";
}

function buildLevels(maxLevel = 128) {
    const levels = [];
    let cumul = 0;
    for (let L = 0; L <= maxLevel; L++) {
        const coef = L * 0.66 + 1;
        const base = (L + 2) * 150 + 50;
        const total = Math.round(coef * base);
        cumul += total;
        levels[L] = { level: L, base, total, cumul };
    }
    return levels;
}

function remainingXp(currentLevel, xp) {
    const levels = buildLevels();
    const expected = levels.find((x) => x.cumul > xp) ?? levels.at(-1);
    const target = currentLevel < expected.level
        ? expected.cumul
        : levels[currentLevel].cumul;
    return target - xp;
}

export function buildHomePage(data = sampleData) {
    const root = document.createDocumentFragment();
    const rankName = getRankName(data.transactions[0].amount || 0);
    const curtain = document.createElement("div");
    curtain.id = "handoff-curtain";
    curtain.setAttribute("aria-hidden", "true");

    const bgGradient = document.createElement("div");
    bgGradient.className = "bg-gradient";

    const bgGrid = document.createElement("div");
    bgGrid.className = "bg-grid";

    const container = document.createElement("div");
    container.className = "container";

    const header = buildHeader();
    const main = document.createElement("main");

    const heroSection = buildHeroSection(`${data.public.firstName} ${data.public.lastName}`, data.id, rankName, data.email);
    const statsSection = buildStatsSection(data);
    const graphStatsSection = buildGraphStatsSection(data);

    main.append(heroSection, statsSection, graphStatsSection);
    container.append(header, main);
    root.append(curtain, bgGradient, bgGrid, container);

    return root;
}

function buildHeader() {
    const header = document.createElement("header");

    const nav = document.createElement("nav");
    nav.className = "nav";

    const brand = document.createElement("div");
    brand.className = "nav-brand";

    const logo = document.createElement("div");
    logo.className = "nav-logo";
    logo.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
    `;

    const title = document.createElement("h1");
    title.innerHTML = `Graph<span>QL</span>`;

    brand.append(logo, title);

    const logoutBtn = document.createElement("button");
    logoutBtn.type = "button";
    logoutBtn.className = "btn";
    logoutBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Logout
    `;
    logoutBtn.addEventListener("click", () => window.location.replace("/logout"));
    initializeButtonAnimation(nav);

    nav.append(brand, logoutBtn);
    header.appendChild(nav);

    return header;
}

function buildHeroSection(username, userId, userRank, userEmail) {
    const section = document.createElement("section");
    section.className = "hero-section";

    const wrapper = document.createElement("div");
    wrapper.className = "hero-wrapper";

    const content = document.createElement("div");
    content.className = "hero-content animate-in";

    const badge = document.createElement("div");
    badge.className = "user-badge";
    badge.innerHTML = `
        <span class="badge-dot"></span>
        ID: ${userId}
    `;

    const title = document.createElement("h1");
    title.className = "hero-title";
    title.innerHTML = `Welcome back,<br><span class="username">${username}</span>`;

    const rank = document.createElement("div");
    rank.className = "hero-rank";
    rank.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
        </svg>
        ${userRank}
    `;

    const email = document.createElement("p");
    email.className = "hero-email";
    email.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
        ${userEmail}
    `;

    content.append(badge, title, rank, email);

    const robotViewer = document.createElement("div");
    robotViewer.className = "hero-robot animate-in animate-delay-1";
    robotViewer.innerHTML = `
        <div class="robot-glow"></div>
        <spline-viewer class="robot-3d"
            url="https://prod.spline.design/s2xbWh6LExcmWY8b/scene.splinecode"
        ></spline-viewer>
    `;

    wrapper.append(content, robotViewer);
    section.appendChild(wrapper);

    return section;
}

function buildStatsSection(data) {
    let totalXp = data.transactions_aggregate.aggregate.sum.amount
    let level = data.transactions[0].amount || 0
    let xpHistory = data.transaction
    let remainingLevelXp = remainingXp(level, totalXp)
    const section = document.createElement("section");
    section.className = "stats-section";

    const header = document.createElement("div");
    header.className = "section-header";

    const title = document.createElement("h2");
    title.className = "section-title";
    title.textContent = "Your Statistics";

    header.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "stats-grid";

    const levelCard = buildLevelCard(level, remainingLevelXp);
    const xpCard = buildXpCard(totalXp, xpHistory);
    const auditCard = buildAuditCard(data.totalUp, data.totalDown);

    grid.append(levelCard, xpCard, auditCard);
    section.append(header, grid);

    return section;
}

export function applyHomeHandoffTransition() {
    if (sessionStorage.getItem(HOME_TRANSITION_KEY) !== "1") {
        return;
    }

    sessionStorage.removeItem(HOME_TRANSITION_KEY);
    document.body.classList.add("with-handoff");

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.classList.add("ready");
        });
    });
}

export function renderHome(appRoot, userData) {
    appRoot.replaceChildren(buildHomePage(userData));
    applyHomeHandoffTransition();
}

function buildGraphStatsSection(data) {
    const section = document.createElement("section");
    section.className = "stats-section";

    const header = document.createElement("div");
    header.className = "section-header";

    const title = document.createElement("h2");
    title.className = "section-title";
    title.textContent = "Your Graph Statistics";

    header.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "stats-grid col-2";

    const levelCard = buildBarChartCard(data.xpOverTime);
    const topSkillsCard = buildRadarChartCard(data.skills);

    grid.append(levelCard, topSkillsCard);
    section.append(header, grid);

    return section;
}
