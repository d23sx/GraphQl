import { formatNumber, attachCardPointerAnimation } from "../../index.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export function buildXpCard(totalXp) {
    const card = document.createElement("div");
    card.className = "stat-card animate-in animate-delay-2";
    attachCardPointerAnimation(card);

    const totalXpVal = Math.ceil(Number(totalXp) / 1000) || 0;

    const content = document.createElement("div");
    content.className = "stat-card-content";

    const header = document.createElement("div");
    header.className = "stat-header";

    const iconContainer = document.createElement("div");
    iconContainer.className = "stat-icon";
    iconContainer.appendChild(buildXpIcon());

    header.append(iconContainer);

    const label = document.createElement("p");
    label.className = "stat-label";
    label.textContent = "Total XP";

    const value = document.createElement("p");
    value.className = "stat-value";
    value.textContent = String(totalXpVal);

    const subtitle = document.createElement("p");
    subtitle.className = "stat-subtitle";
    subtitle.textContent = "Gained xp over time...";

    content.append(header, label, value, subtitle);
    card.appendChild(content);

    return card;
}

function buildXpIcon() {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    const polyline = document.createElementNS(SVG_NS, "polyline");
    polyline.setAttribute("points", "22 12 18 12 15 21 9 3 6 12 2 12");
    svg.appendChild(polyline);

    return svg;
}
