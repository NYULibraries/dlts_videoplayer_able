import { showTooltip, hideTooltip } from "./tooltip.js";

const svgNS = "http://www.w3.org/2000/svg";

function makeControlBtn(name, label, viewBox, pathD, onClick) {
  const btn = document.createElement("div");
  btn.setAttribute("role", "button");
  btn.setAttribute("tabindex", "0");
  btn.className = `able-button-handler-${name}`;
  btn.setAttribute("aria-label", label);

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("viewBox", viewBox);
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", pathD);
  svg.appendChild(path);
  btn.appendChild(svg);

  btn.addEventListener("click", onClick);
  ["mouseenter", "focus"].forEach((e) =>
    btn.addEventListener(e, () => showTooltip(btn)),
  );
  ["mouseleave", "blur", "click"].forEach((e) =>
    btn.addEventListener(e, hideTooltip),
  );
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  });
  return btn;
}

function makePipe() {
  const p = document.createElement("div");
  p.className = "able-pipe";
  p.textContent = "|";
  return p;
}

export function addControlButtons({ playlist, index, onNavigate }) {
  const target =
    document.querySelector(".able-right-controls") ||
    document.querySelector(".able-controller");
  if (!target) return;

  target.appendChild(makePipe());

  const navButtons = [
    ["prev-item", "Previous video", "M5 17.5v-15h2.5v6.875l6.25-6.25v13.75l-6.25-6.25v6.875z", index - 1],
    ["next-item", "Next video", "M15 2.5v15h-2.5v-6.875l-6.25 6.25v-13.75l6.25 6.25v-6.875z", index + 1],
  ];
  for (const [name, label, pathD, to] of navButtons) {
    const enabled = to >= 0 && to < playlist.length;
    const btn = makeControlBtn(name, label, "0 0 20 20", pathD, () => {
      if (enabled) onNavigate(to);
    });
    if (!enabled) {
      btn.classList.add("buttonOff");
      btn.setAttribute("aria-disabled", "true");
    }
    target.appendChild(btn);
  }
}
