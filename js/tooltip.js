// Mirrors Able Player's button tooltips (buildplayer.js): same
// .able-tooltip styling, below the button, centered, 500ms hide delay.
// Uses its own div because Able Player's hide timer is private and
// would blank a shared one.
let tooltip, tooltipTimer, owner;

function hideNow() {
  clearTimeout(tooltipTimer);
  tooltip.style.display = "none";
}

// Able Player swaps its tooltip as soon as another button is entered;
// do the same when the pointer or focus reaches any other control.
function hideForOtherButton(e) {
  const btn = e.target.closest('[role="button"]');
  if (btn && btn !== owner) hideNow();
}

export function showTooltip(btn) {
  if (btn.getAttribute("aria-expanded") === "true") return;
  const controller = document.querySelector(".able-controller");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "able-tooltip";
    tooltip.addEventListener("mouseenter", () =>
      clearTimeout(tooltipTimer),
    );
    tooltip.addEventListener("mouseleave", hideNow);
    controller.appendChild(tooltip);
    controller.addEventListener("mouseover", hideForOtherButton);
    controller.addEventListener("focusin", hideForOtherButton);
  }
  owner = btn;
  clearTimeout(tooltipTimer);
  AblePlayerInstances[0].$tooltipDiv.hide();
  tooltip.textContent = btn.getAttribute("aria-label");
  tooltip.style.display = "block";
  const c = controller.getBoundingClientRect();
  const r = btn.getBoundingClientRect();
  const right = c.right - r.right - tooltip.offsetWidth / 2;
  tooltip.style.right = (right < 0 ? 2 : right) + "px";
  tooltip.style.top = $(btn).position().top + $(btn).height() + 5 + "px";
}

export function hideTooltip(e) {
  if (!tooltip) return;
  clearTimeout(tooltipTimer);
  if (e.type === "click") hideNow();
  else tooltipTimer = setTimeout(hideNow, 500);
}
