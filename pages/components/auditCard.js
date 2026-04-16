import { attachCardPointerAnimation } from "../../index.js";
import { ratioDefinitions } from "../../config.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export function buildAuditCard(done, received) {
    const card = document.createElement("div");
    card.className = "stat-card animate-in animate-delay-3";
    attachCardPointerAnimation(card);

    const ratio = (done / received).toFixed(1);
    const maxAudits = Math.max(done, received);
    const donePercent = (done / maxAudits) * 100;
    const receivedPercent = (received / maxAudits) * 100;
    const doneVal = (done / 1000000).toFixed(2);
    const recivedVal = (received / 1000000).toFixed(2);

    const ratioVals = ratioDefinitions.find((s) => Number(ratio).toFixed(1) >= s.min)
        || ratioDefinitions[ratioDefinitions.length - 1]
        || { color: "inherit", message: "" };

    const content = document.createElement("div");
    content.className = "stat-card-content";

    const header = document.createElement("div");
    header.className = "stat-header";

    const iconContainer = document.createElement("div");
    iconContainer.className = "stat-icon";
    iconContainer.appendChild(buildAuditIcon());
    header.appendChild(iconContainer);

    const label = document.createElement("p");
    label.className = "stat-label";
    label.textContent = "Audit Ratio";

    const ratioDisplay = document.createElement("div");
    ratioDisplay.className = "ratio-display";

    const ratioValue = document.createElement("span");
    ratioValue.className = "ratio-value";
    ratioValue.style.color = ratioVals.color;
    ratioValue.textContent = ratio;
    ratioDisplay.appendChild(ratioValue);

    const subtitle = document.createElement("p");
    subtitle.className = "stat-subtitle";
    subtitle.style.color = ratioVals.color;
    subtitle.textContent = ratioVals.message;

    const chart = document.createElement("div");
    chart.className = "audit-chart";
    chart.appendChild(buildAuditBar("Done", `${doneVal}MB`, "done", donePercent));
    chart.appendChild(buildAuditBar("Received", `${recivedVal}MB`, "received", receivedPercent));

    content.append(header, label, ratioDisplay, subtitle, chart);
    card.appendChild(content);

    return card;
}

function buildAuditBar(labelText, valueText, fillClass, widthPercent) {
    const bar = document.createElement("div");
    bar.className = "audit-bar";

    const barLabel = document.createElement("div");
    barLabel.className = "audit-bar-label";

    const label = document.createElement("span");
    label.textContent = labelText;

    const value = document.createElement("span");
    value.textContent = valueText;

    barLabel.append(label, value);

    const track = document.createElement("div");
    track.className = "audit-bar-track";

    const fill = document.createElement("div");
    fill.className = `audit-bar-fill ${fillClass}`;
    fill.style.width = `${widthPercent}%`;

    track.appendChild(fill);
    bar.append(barLabel, track);

    return bar;
}

function buildAuditIcon() {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z");

    const polyline = document.createElementNS(SVG_NS, "polyline");
    polyline.setAttribute("points", "14 2 14 8 20 8");

    const lineOne = document.createElementNS(SVG_NS, "line");
    lineOne.setAttribute("x1", "16");
    lineOne.setAttribute("y1", "13");
    lineOne.setAttribute("x2", "8");
    lineOne.setAttribute("y2", "13");

    const lineTwo = document.createElementNS(SVG_NS, "line");
    lineTwo.setAttribute("x1", "16");
    lineTwo.setAttribute("y1", "17");
    lineTwo.setAttribute("x2", "8");
    lineTwo.setAttribute("y2", "17");

    svg.append(path, polyline, lineOne, lineTwo);

    return svg;
}