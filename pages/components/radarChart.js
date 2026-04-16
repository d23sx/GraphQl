import { attachCardPointerAnimation } from "../../index.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export function buildRadarChartCard(data) {
    const card = document.createElement("div");

    const skillsLimit = getMaxData(data);

    const formatedData = parseChartLabel(skillsLimit);

    card.className = "stat-card stat-card-lg animate-in animate-delay-2";
    attachCardPointerAnimation(card);

    const content = document.createElement("div");
    content.className = "stat-card-content";

    const header = document.createElement("div");
    header.className = "stat-header";

    const iconContainer = document.createElement("div");
    iconContainer.className = "stat-icon";
    iconContainer.appendChild(buildRadarIcon());
    header.appendChild(iconContainer);

    const label = document.createElement("p");
    label.className = "stat-label";
    label.textContent = "Top 8 Skils";

    const chartContainer = document.createElement("div");
    chartContainer.className = "radar-chart-container";

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("id", "radarChart");
    svg.setAttribute("viewBox", "-150 -150 300 300");
    chartContainer.appendChild(svg);

    content.append(header, label, chartContainer);
    card.appendChild(content);

    const radius = 100;
    const totalAxes = formatedData.length;
    const angleStep = (Math.PI * 2) / totalAxes;
    const maxValue = 100;
    const gridLevels = 10;

    for (let i = 1; i <= gridLevels; i++) {
        const r = (radius / gridLevels) * i;
        const circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttribute("cx", "0");
        circle.setAttribute("cy", "0");
        circle.setAttribute("r", String(r));
        circle.setAttribute("class", "grid-line");
        svg.appendChild(circle);
    }

    formatedData.forEach((d, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const labelRadius = radius + 18;
        const labelX = labelRadius * Math.cos(angle);
        const labelY = labelRadius * Math.sin(angle);

        const line = document.createElementNS(SVG_NS, "line");
        line.setAttribute("x1", "0");
        line.setAttribute("y1", "0");
        line.setAttribute("x2", String(x));
        line.setAttribute("y2", String(y));
        line.setAttribute("class", "axis-line");
        svg.appendChild(line);

        const text = document.createElementNS(SVG_NS, "text");
        const textAnchor = labelX > 12 ? "start" : labelX < -12 ? "end" : "middle";
        const dx = labelX > 12 ? 4 : labelX < -12 ? -4 : 0;
        const dy = labelY > 12 ? 12 : labelY < -12 ? -8 : 0;

        text.setAttribute("x", String(labelX + dx));
        text.setAttribute("y", String(labelY + dy));
        text.setAttribute("text-anchor", textAnchor);
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("class", "axis-label");
        text.textContent = d.label;
        svg.appendChild(text);
    });

    const dataPoints = formatedData.map((d, i) => {
        const normalizedValue = Math.min(maxValue, Math.max(0, d.value));
        const r = (normalizedValue / maxValue) * radius;
        const x = r * Math.cos(i * angleStep - Math.PI / 2);
        const y = r * Math.sin(i * angleStep - Math.PI / 2);
        return `${x},${y}`;
    }).join(' ');

    const dataPoly = document.createElementNS(SVG_NS, "polygon");
    dataPoly.setAttribute("points", dataPoints);
    dataPoly.setAttribute("class", "data-polygon");
    svg.appendChild(dataPoly);

    return card;
}

function buildRadarIcon() {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    const firstPath = document.createElementNS(SVG_NS, "path");
    firstPath.setAttribute("d", "M10 6.025A7.5 7.5 0 1 0 17.975 14H10V6.025Z");

    const secondPath = document.createElementNS(SVG_NS, "path");
    secondPath.setAttribute("d", "M13.5 3c-.169 0-.334.014-.5.025V11h7.975c.011-.166.025-.331.025-.5A7.5 7.5 0 0 0 13.5 3Z");

    svg.append(firstPath, secondPath);

    return svg;
}

function getMaxData(data = []) {
    const final = Array.isArray(data) ? [...data] : [];
    final.sort((a, b) => b.amount - a.amount);
    return final.slice(0, 8);
}

function parseChartLabel(data = []) {
    return data.map((val) => ({
        label: val.type.replace("skill_", "").toLocaleUpperCase(),
        value: Number(val.amount) || 0,
    }));
}
