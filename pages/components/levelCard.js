import { formatNumber, attachCardPointerAnimation } from "../../index.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export function buildLevelCard(level = 0, xpToNextLevel = 0) {
    const card = document.createElement("div");
    card.className = "stat-card animate-in animate-delay-1";
    attachCardPointerAnimation(card);

    const content = document.createElement("div");
    content.className = "stat-card-content";

    const header = document.createElement("div");
    header.className = "stat-header";

    const iconContainer = document.createElement("div");
    iconContainer.className = "stat-icon";
    iconContainer.appendChild(buildLevelIcon());

    const badge = document.createElement("span");
    badge.className = "stat-badge";
    badge.textContent = "Active";

    header.append(iconContainer, badge);

    const label = document.createElement("p");
    label.className = "stat-label";
    label.textContent = "Current Level";

    const value = document.createElement("p");
    value.className = "stat-value";
    value.textContent = String(level);

    const subtitle = document.createElement("p");
    subtitle.className = "stat-subtitle";
    subtitle.textContent = `${formatNumber(xpToNextLevel)} XP to next level`;

    content.append(header, label, value, subtitle);
    card.appendChild(content);

    return card;
}

function buildLevelIcon() {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    const polygon = document.createElementNS(SVG_NS, "polygon");
    polygon.setAttribute("points", "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2");
    svg.appendChild(polygon);

    return svg;
}
