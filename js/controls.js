import { PLAYLIST, currentIndex, navigateTo } from "./playlist.js";
import { openTranscriptTab } from "./transcript.js";
import { showTooltip, hideTooltip } from "./tooltip.js";

// ── Inject buttons into Able Player's right controls ───────────────────
// Able Player buttons are div[role="button"] + class "able-button-handler-{name}".
// Matching this format means they inherit all existing button CSS automatically.

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

export function addControlButtons() {
  const target =
    document.querySelector(".able-right-controls") ||
    document.querySelector(".able-controller");
  if (!target) return;

  target.appendChild(makePipe());

  if (currentIndex > 0) {
    target.appendChild(
      makeControlBtn(
        "prev-item",
        "Previous video",
        "0 0 20 20",
        "M5 17.5v-15h2.5v6.875l6.25-6.25v13.75l-6.25-6.25v6.875z",
        () => navigateTo(currentIndex - 1),
      ),
    );
  }

  if (currentIndex < PLAYLIST.length - 1) {
    target.appendChild(
      makeControlBtn(
        "next-item",
        "Next video",
        "0 0 20 20",
        "M15 2.5v15h-2.5v-6.875l-6.25 6.25v-13.75l6.25 6.25v-6.875z",
        () => navigateTo(currentIndex + 1),
      ),
    );
  }

  // Transcript button with language popup
  const player = AblePlayerInstances[0];
  const captionTracks = (player.captions || []).filter(
    (t) => t.cues && t.cues.length,
  );

  // Build the popup menu using Able Player's .able-popup class so it
  // inherits all existing popup styling automatically.
  const transcriptMenu = document.createElement("ul");
  transcriptMenu.className = "able-popup able-popup-transcript";
  transcriptMenu.setAttribute("role", "menu");
  transcriptMenu.style.display = "none";

  // Heading — role="presentation" keeps it out of the menu item sequence
  const heading = document.createElement("li");
  heading.setAttribute("role", "presentation");
  heading.className = "able-popup-transcript-heading";
  heading.textContent = "Languages";
  transcriptMenu.appendChild(heading);

  captionTracks.forEach((track) => {
    const li = document.createElement("li");
    li.setAttribute("role", "menuitem");
    li.setAttribute("tabindex", "-1");
    li.textContent = track.label || track.language || "Transcript";
    li.addEventListener("click", (e) => {
      e.stopPropagation();
      transcriptMenu.style.display = "none";
      transcriptBtn.setAttribute("aria-expanded", "false");
      openTranscriptTab(track.cues);
    });
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        li.click();
      }
    });
    transcriptMenu.appendChild(li);
  });

  const transcriptBtn = makeControlBtn(
    "view-transcript",
    "View transcript as plain text",
    "0 0 20 20",
    "M0 19.107v-17.857q0-0.446 0.313-0.759t0.759-0.313h8.929v6.071q0 0.446 0.313 0.759t0.759 0.313h6.071v11.786q0 0.446-0.313 0.759t-0.759 0.312h-15q-0.446 0-0.759-0.313t-0.313-0.759zM4.286 15.536q0 0.156 0.1 0.257t0.257 0.1h7.857q0.156 0 0.257-0.1t0.1-0.257v-0.714q0-0.156-0.1-0.257t-0.257-0.1h-7.857q-0.156 0-0.257 0.1t-0.1 0.257v0.714zM4.286 12.679q0 0.156 0.1 0.257t0.257 0.1h7.857q0.156 0 0.257-0.1t0.1-0.257v-0.714q0-0.156-0.1-0.257t-0.257-0.1h-7.857q-0.156 0-0.257 0.1t-0.1 0.257v0.714zM4.286 9.821q0 0.156 0.1 0.257t0.257 0.1h7.857q0.156 0 0.257-0.1t0.1-0.257v-0.714q0-0.156-0.1-0.257t-0.257-0.1h-7.857q-0.156 0-0.257 0.1t-0.1 0.257v0.714zM11.429 5.893v-5.268q0.246 0.156 0.402 0.313l4.554 4.554q0.156 0.156 0.313 0.402h-5.268z",
    () => {
      const isOpen = transcriptMenu.style.display !== "none";
      transcriptMenu.style.display = isOpen ? "none" : "";
      transcriptBtn.setAttribute(
        "aria-expanded",
        isOpen ? "false" : "true",
      );
      if (!isOpen && transcriptMenu.firstChild) {
        transcriptMenu.firstChild.focus();
      }
    },
  );
  transcriptBtn.setAttribute("aria-haspopup", "menu");
  transcriptBtn.setAttribute("aria-expanded", "false");
  // Menu sits inside the button div; position relative keeps it anchored.
  transcriptBtn.style.position = "relative";
  transcriptBtn.appendChild(transcriptMenu);

  target.appendChild(makePipe());
  target.appendChild(transcriptBtn);

  // Close menu when clicking anywhere outside the button
  document.addEventListener("click", (e) => {
    if (!transcriptBtn.contains(e.target)) {
      transcriptMenu.style.display = "none";
      transcriptBtn.setAttribute("aria-expanded", "false");
    }
  });
}
