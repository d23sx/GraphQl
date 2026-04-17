import {  attachCardPointerAnimation } from "../../index.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export function buildBarChartCard(data) {
    const parseData = parseChartLabel(data).slice(-11);

    const card = document.createElement("div");
    card.className = "stat-card stat-card-lg animate-in animate-delay-1";

    attachCardPointerAnimation(card);
    const content = document.createElement("div");
    content.className = "stat-card-content";

    const header = document.createElement("div");
    header.className = "stat-header";

    const iconContainer = document.createElement("div");
    iconContainer.className = "stat-icon";
    iconContainer.appendChild(buildLineChartIcon());
    header.appendChild(iconContainer);

    const label = document.createElement("p");
    label.className = "stat-label";
    label.textContent = "XP over Time..";

    const chartContainer = document.createElement("div");
    chartContainer.className = "line-chart-container";
    chartContainer.style.width = "min(700px, 100%)";
    chartContainer.style.aspectRatio = "16 / 13";

    const lineChart = buildLineChart(parseData);

    chartContainer.appendChild(lineChart);
    content.append(header, label, chartContainer);
    card.appendChild(content);
    return card;
}

function buildLineChart(data = []) {
    const dataLen = data.length + 1;
    const getMaxVal = Math.max(...data.map((d) => d.value), 1) + 1;
    const maxVal = getMaxVal * 2
    const width = 760;
    const height = 700;
    const padding = { top: 24, right: 24, bottom: 156, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("id", "lineChart");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.style.background = "var(--bg-elevated)"

    const defs = document.createElementNS(SVG_NS, "defs");
    const gradient = document.createElementNS(SVG_NS, "linearGradient");
    const gradientId = `xpGradient-${Math.random().toString(36).slice(2, 9)}`;
    gradient.setAttribute("id", gradientId);
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "0%");
    gradient.setAttribute("y2", "100%");

    const startStop = document.createElementNS(SVG_NS, "stop");
    startStop.setAttribute("offset", "0%");
    startStop.setAttribute("style", "stop-color: var(--primary); stop-opacity: 0.3");

    const endStop = document.createElementNS(SVG_NS, "stop");
    endStop.setAttribute("offset", "100%");
    endStop.setAttribute("style", "stop-color: var(--primary); stop-opacity: 0");

    gradient.append(startStop, endStop);
    defs.appendChild(gradient);
    svg.append(defs)
    const tooltip = createChartTooltip(svg);

    if (!Array.isArray(data) || data.length === 0) {
        const text = document.createElementNS(SVG_NS, "text");
        text.setAttribute("x", "50%");
        text.setAttribute("y", "50%");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "var(--text-secondary, #9ca3af)");
        text.setAttribute("font-size", "16");
        text.textContent = "No data";
        svg.append(text);
        return svg;
    }

    const divisor = Math.max(dataLen - 1, 1);
    const points = data.map((point, index) => {
        const x = padding.left + (index / divisor) * chartWidth;
        const normalized = maxVal === 0 ? 0 : point.value / maxVal;
        const y = padding.top + chartHeight - (normalized * chartHeight);
        return { ...point, x, y };
    });

    let numX = padding.left;
    points.forEach((_) => {
        const plyLine = document.createElementNS(SVG_NS, "polyline")
        plyLine.setAttribute("points", `${numX}, ${padding.top} ${numX}, ${padding.top + chartHeight}`)
        plyLine.setAttribute("fill", "none");
        plyLine.setAttribute("stroke", "#ffffff22");
        plyLine.setAttribute("stroke-width", "1");
        svg.append(plyLine);
        numX += chartWidth / divisor;
    });

    const yGuides = 4;
    for (let guide = 0; guide <= yGuides; guide++) {
        const ratio = guide / yGuides;
        const y = padding.top + ratio * chartHeight;

        const plyLine = document.createElementNS(SVG_NS, "polyline");
        plyLine.setAttribute("points", `${padding.left}, ${y} ${width - padding.right}, ${y}`);
        plyLine.setAttribute("fill", "none");
        plyLine.setAttribute("stroke", "#ffffff22");
        plyLine.setAttribute("stroke-width", "1");
        svg.append(plyLine);

        const yValueLabel = document.createElementNS(SVG_NS, "text");
        yValueLabel.setAttribute("x", String(padding.left - 10));
        yValueLabel.setAttribute("y", String(y + 5));
        yValueLabel.setAttribute("text-anchor", "end");
        yValueLabel.setAttribute("font-size", "12");
        yValueLabel.setAttribute("fill", "var(--text-muted)");
        yValueLabel.textContent = `${Math.round((1 - ratio) * maxVal)}`;
        svg.append(yValueLabel);
    }

    const circles = [];

    points.forEach((pt) => {
        const pointX = pt.x;
        const pointY = pt.y;

        const crl = document.createElementNS(SVG_NS, "circle");
        crl.setAttribute("r", "5");
        crl.setAttribute("cx", `${pointX}`);
        crl.setAttribute("cy", `${pointY}`);
        crl.setAttribute("fill", "rgba(var(--primary-rgb), 1)");
        crl.setAttribute("stroke", "rgba(var(--primary-rgb), 0.2)");
        crl.setAttribute("stroke-width", "2");

        const title = document.createElementNS(SVG_NS, "title");
        title.textContent = `${pt.label}\n${pt.date}\n${Math.round(pt.value)} XP`;
        crl.append(title);

        crl.addEventListener("mouseenter", () => {
            updateChartTooltip(tooltip, {
                x: pointX,
                y: pointY,
                xp: Math.round(pt.value),
                date: pt.date,
                chartWidth: width,
                chartHeight: height,
            });
            tooltip.group.setAttribute("opacity", "1");
        });

        crl.addEventListener("mousemove", () => {
            updateChartTooltip(tooltip, {
                x: pointX,
                y: pointY,
                xp: Math.round(pt.value),
                date: pt.date,
                chartWidth: width,
                chartHeight: height,
            });
        });

        crl.addEventListener("mouseleave", () => {
            tooltip.group.setAttribute("opacity", "0");
        });

        circles.push(crl);

        const projectLabel = document.createElementNS(SVG_NS, "text");
        const projectLabelX = pointX ;
        projectLabel.setAttribute("x", String(projectLabelX - 20));
        projectLabel.setAttribute("y", String(padding.top + chartHeight ));
        projectLabel.setAttribute("text-anchor", "end");
        projectLabel.setAttribute("font-size", "14");
        projectLabel.setAttribute("fill", "var(--text-secondary)");
        projectLabel.setAttribute("transform", `rotate(-90 ${projectLabelX} ${padding.top + chartHeight})`);
        projectLabel.textContent = truncateLabel(pt.label, 16);
        svg.append(projectLabel);
    });

    if (points.length > 1) {
        const baselineY = padding.top + chartHeight;
        const polylinePoints = points.map(({ x, y }) => `${x},${y}`).join(" ");
        const firstX = points[0].x;
        const lastX = points[points.length - 1].x;

        const area = document.createElementNS(SVG_NS, "polygon");
        area.setAttribute("points", `${polylinePoints} ${lastX},${baselineY} ${firstX},${baselineY}`);
        area.setAttribute("fill", `url(#${gradientId})`);
        area.setAttribute("stroke", "none");

        const line = document.createElementNS(SVG_NS, "polyline");
        line.setAttribute("points", polylinePoints);
        line.setAttribute("fill", "none");
        line.setAttribute("stroke", "rgba(var(--primary-rgb), 1)");
        line.setAttribute("stroke-width", "3");
        line.setAttribute("stroke-linecap", "round");
        line.setAttribute("stroke-linejoin", "round");

        svg.append(area, line);
    }

    circles.forEach((circle) => svg.append(circle));

    return svg;
}

function createChartTooltip(svg) {
    const group = document.createElementNS(SVG_NS, "g");
    group.setAttribute("opacity", "0");
    group.setAttribute("pointer-events", "none");

    const background = document.createElementNS(SVG_NS, "rect");
    background.setAttribute("rx", "8");
    background.setAttribute("ry", "8");
    background.setAttribute("fill", "rgba(15, 23, 42, 0.92)");
    background.setAttribute("stroke", "rgba(255,255,255,0.15)");
    background.setAttribute("stroke-width", "1");

    const xpText = document.createElementNS(SVG_NS, "text");
    xpText.setAttribute("font-size", "14");
    xpText.setAttribute("font-weight", "700");
    xpText.setAttribute("fill", "var(--primary-light)");

    const dateText = document.createElementNS(SVG_NS, "text");
    dateText.setAttribute("font-size", "12");
    dateText.setAttribute("fill", "var(--text-muted, #9ca3af)");

    group.append(background, xpText, dateText);
    svg.append(group);

    return { group, background, xpText, dateText };
}

function updateChartTooltip(tooltip, { x, y, xp, date, chartWidth, chartHeight }) {
    const padX = 12;
    const padY = 10;
    const lineGap = 18;
    const tooltipWidth = 150;
    const tooltipHeight = 54;

    let tooltipX = x + 12;
    let tooltipY = y - tooltipHeight - 12;

    if (tooltipX + tooltipWidth > chartWidth - 8) {
        tooltipX = x - tooltipWidth - 12;
    }

    if (tooltipY < 8) {
        tooltipY = y + 12;
    }

    if (tooltipY + tooltipHeight > chartHeight - 8) {
        tooltipY = chartHeight - tooltipHeight - 8;
    }

    tooltip.background.setAttribute("x", String(tooltipX));
    tooltip.background.setAttribute("y", String(tooltipY));
    tooltip.background.setAttribute("width", String(tooltipWidth));
    tooltip.background.setAttribute("height", String(tooltipHeight));

    tooltip.xpText.setAttribute("x", String(tooltipX + padX));
    tooltip.xpText.setAttribute("y", String(tooltipY + padY + 12));
    tooltip.xpText.textContent = `${xp} XP`;

    tooltip.dateText.setAttribute("x", String(tooltipX + padX));
    tooltip.dateText.setAttribute("y", String(tooltipY + padY + 12 + lineGap));
    tooltip.dateText.textContent = date || "-";
}

function buildLineChartIcon() {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", "M4 4v15a1 1 0 0 0 1 1h15M8 16l2.5-5.5 3 3L17.273 7 20 9.667");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-width", "2");

    svg.append(path);
    return svg;
}

function parseChartLabel(data = []) {
    if (!Array.isArray(data)) return [];

    return data
        .map((val) => {
            const rawDate = String(val?.createdAt || "");
            const timestamp = Date.parse(rawDate);

            return {
                label: normalizePathLabel(val?.path),
                value: Number(val?.amount) || 0,
                date: rawDate.split("T")[0],
                timestamp: Number.isNaN(timestamp) ? 0 : timestamp,
            };
        })
        .sort((a, b) => a.timestamp - b.timestamp);
}

function normalizePathLabel(path = "") {
    const safePath = String(path);
    const normalized = safePath
        .replace(/^\/bahrain\/bh-module\//, "")
        .replace(/^checkpoint\//, "");

    return normalized || "Unknown project";
}

function truncateLabel(text = "", maxLength = 10) {
    const safe = String(text);
    if (safe.length <= maxLength) return safe;
    return `${safe.slice(0, maxLength - 1)}…`;
}