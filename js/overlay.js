import { PLAYLIST, currentIndex, navigateTo } from "./playlist.js";

// ── Playlist end-card overlay ──────────────────────────────────────────

export function buildPlaylistOverlay() {
  const wrapper = document.querySelector(".able-wrapper");
  if (!wrapper) return;

  const overlay = document.createElement("div");
  overlay.id = "playlist-overlay";

  PLAYLIST.forEach((item, idx) => {
    if (idx <= currentIndex) return;

    const card = document.createElement("div");
    card.className = "playlist-card";
    card.addEventListener("click", () => navigateTo(idx));

    const circle = document.createElement("div");
    circle.className = "playlist-circle";

    const img = document.createElement("img");
    img.src = item.poster;
    img.alt = item.title;
    circle.appendChild(img);

    const label = document.createElement("span");
    label.className = "playlist-card-label";
    label.textContent = item.title;

    card.appendChild(circle);
    card.appendChild(label);
    overlay.appendChild(card);
  });

  if (overlay.children.length) wrapper.appendChild(overlay);
}

let overlayVisible = false;
export function syncOverlay(currentTime, duration) {
  const overlay = document.getElementById("playlist-overlay");
  if (!overlay || !(duration > 0)) return;
  const nearEnd = currentTime >= duration - 20;
  if (nearEnd !== overlayVisible) {
    overlay.classList.toggle("visible", nearEnd);
    overlayVisible = nearEnd;
  }
}
