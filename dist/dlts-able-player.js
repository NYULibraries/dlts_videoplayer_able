// js/transcript.js
function pad2(n) {
  return String(Math.floor(n)).padStart(2, "0");
}
function flattenComponent(c) {
  if (!c) return "";
  if (c.type === "string") return c.value || "";
  return (c.children || []).map(flattenComponent).join("");
}
function cueToText(cue) {
  return flattenComponent(cue.components).trim();
}
function formatTimeTxt(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor(secs % 3600 / 60);
  const s = (secs % 60).toFixed(3).padStart(6, "0");
  return `${pad2(h)}:${pad2(m)}:${s}`;
}
function buildTranscriptText(cues) {
  const groups = [];
  let current = null;
  cues.forEach((cue) => {
    const raw = cueToText(cue).replace(/\n\s*/g, " ").trim();
    if (!raw) return;
    const m = raw.match(/^(Speaker \d+):\s*/);
    if (m) {
      current = {
        speaker: m[1],
        time: cue.start,
        text: raw.slice(m[0].length)
      };
      groups.push(current);
    } else if (current) {
      current.text += (current.text ? " " : "") + raw;
    } else {
      current = { speaker: null, time: cue.start, text: raw };
      groups.push(current);
    }
  });
  return groups.filter((g) => g.text).map(
    (g) => (g.speaker ? `${g.speaker} ` : "") + formatTimeTxt(g.time) + "\n" + g.text
  ).join("\n\n") + "\n";
}
function openTranscriptTab(cues) {
  const blob = new Blob([buildTranscriptText(cues)], {
    type: "text/plain"
  });
  window.open(URL.createObjectURL(blob), "_blank");
}

// js/tooltip.js
var tooltip;
var tooltipTimer;
var owner;
function hideNow() {
  clearTimeout(tooltipTimer);
  tooltip.style.display = "none";
}
function hideForOtherButton(e) {
  const btn = e.target.closest('[role="button"]');
  if (btn && btn !== owner) hideNow();
}
function showTooltip(btn) {
  if (btn.getAttribute("aria-expanded") === "true") return;
  const controller = document.querySelector(".able-controller");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "able-tooltip";
    tooltip.addEventListener(
      "mouseenter",
      () => clearTimeout(tooltipTimer)
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
function hideTooltip(e) {
  if (!tooltip) return;
  clearTimeout(tooltipTimer);
  if (e.type === "click") hideNow();
  else tooltipTimer = setTimeout(hideNow, 500);
}

// js/controls.js
var svgNS = "http://www.w3.org/2000/svg";
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
  ["mouseenter", "focus"].forEach(
    (e) => btn.addEventListener(e, () => showTooltip(btn))
  );
  ["mouseleave", "blur", "click"].forEach(
    (e) => btn.addEventListener(e, hideTooltip)
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
function addControlButtons({ playlist, index, onNavigate, player }) {
  const target = document.querySelector(".able-right-controls") || document.querySelector(".able-controller");
  if (!target) return;
  target.appendChild(makePipe());
  const navButtons = [
    ["prev-item", "Previous video", "M5 17.5v-15h2.5v6.875l6.25-6.25v13.75l-6.25-6.25v6.875z", index - 1],
    ["next-item", "Next video", "M15 2.5v15h-2.5v-6.875l-6.25 6.25v-13.75l6.25 6.25v-6.875z", index + 1]
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
  const captionTracks = (player.captions || []).filter(
    (t) => t.cues && t.cues.length
  );
  const transcriptMenu = document.createElement("ul");
  transcriptMenu.className = "able-popup able-popup-transcript";
  transcriptMenu.setAttribute("role", "menu");
  transcriptMenu.style.display = "none";
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
        isOpen ? "false" : "true"
      );
      if (!isOpen && transcriptMenu.firstChild) {
        transcriptMenu.firstChild.focus();
      }
    }
  );
  transcriptBtn.setAttribute("aria-haspopup", "menu");
  transcriptBtn.setAttribute("aria-expanded", "false");
  transcriptBtn.style.position = "relative";
  transcriptBtn.appendChild(transcriptMenu);
  target.appendChild(makePipe());
  target.appendChild(transcriptBtn);
  document.addEventListener("click", (e) => {
    if (!transcriptBtn.contains(e.target)) {
      transcriptMenu.style.display = "none";
      transcriptBtn.setAttribute("aria-expanded", "false");
    }
  });
}

// js/overlay.js
function buildPlaylistOverlay({ playlist, index, onNavigate }) {
  const wrapper = document.querySelector(".able-wrapper");
  if (!wrapper) return;
  const overlay = document.createElement("div");
  overlay.id = "playlist-overlay";
  playlist.forEach((item, idx) => {
    if (idx <= index) return;
    const card = document.createElement("div");
    card.className = "playlist-card";
    card.addEventListener("click", () => onNavigate(idx));
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
var overlayVisible = false;
function syncOverlay(currentTime, duration) {
  const overlay = document.getElementById("playlist-overlay");
  if (!overlay || !(duration > 0)) return;
  const nearEnd = currentTime >= duration - 20;
  if (nearEnd !== overlayVisible) {
    overlay.classList.toggle("visible", nearEnd);
    overlayVisible = nearEnd;
  }
}

// js/buffering.js
function initBuffering(video, player) {
  const spinner = document.createElement("div");
  spinner.id = "buffer-spinner";
  spinner.setAttribute("aria-hidden", "true");
  const wrapper = video.closest(".able-wrapper") || document.querySelector(".able-wrapper");
  if (wrapper) wrapper.appendChild(spinner);
  const setBuffering = (on) => spinner.classList.toggle("visible", on);
  video.addEventListener("seeking", () => {
    if (video._hls) video._hls.resumeBuffering();
    player.elapsed = video.currentTime;
    player.refreshControls("timeline");
    setBuffering(true);
  });
  video.addEventListener("waiting", () => setBuffering(true));
  ["seeked", "canplay", "playing"].forEach(
    (e) => video.addEventListener(e, () => setBuffering(false))
  );
}

// js/stream.js
function attachHls(video, hlsSrc) {
  if (video._hlsAttached) return;
  video._hlsAttached = true;
  if (Hls.isSupported()) {
    const hls = new Hls({ preferManagedMediaSource: false });
    video._hls = hls;
    hls.loadSource(hlsSrc);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (data.fatal)
        console.error("HLS error:", data.type, data.details);
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = hlsSrc;
  } else {
    console.error("HLS not supported in this browser.");
  }
}

// js/dlts-player.js
function applyMedia(video, item) {
  if (!item) return;
  video.poster = item.poster || "";
  const captions = item.captions || [];
  const existing = [...video.querySelectorAll("track")];
  for (const cap of captions) {
    if (!cap.srclang || !cap.src) continue;
    let track = existing.find((t) => t.srclang === cap.srclang);
    if (!track) {
      track = document.createElement("track");
      track.kind = cap.kind || "captions";
      track.srclang = cap.srclang;
      video.appendChild(track);
      existing.push(track);
    }
    track.src = cap.src;
    track.label = cap.label || cap.srclang;
    if (cap.kind) track.kind = cap.kind;
  }
}
function playerFor(video) {
  const instances = window.AblePlayerInstances || [];
  return instances.find((p) => p.media === video) || instances[0];
}
function waitForAblePlayer(video) {
  return new Promise((resolve) => {
    const tick = () => {
      const player = playerFor(video);
      if (player && player.playerCreated) resolve(player);
      else requestAnimationFrame(tick);
    };
    tick();
  });
}
async function mountDltsPlayer({
  video,
  playlist = [],
  index = 0,
  onNavigate
} = {}) {
  if (!video) throw new Error("mountDltsPlayer: video is required");
  const item = playlist[index];
  applyMedia(video, item);
  if (!playerFor(video) && window.AblePlayer && !video.hasAttribute("data-able-player")) {
    const media = window.jQuery ? window.jQuery(video) : video;
    const instance = new AblePlayer(media);
    (window.AblePlayerInstances ||= []).push(instance);
  }
  const player = await waitForAblePlayer(video);
  const navigate = onNavigate || ((i) => {
    const params = new URLSearchParams(location.search);
    params.set("reel", i);
    location.href = `${location.pathname}?${params}`;
  });
  const ctx = { video, playlist, index, onNavigate: navigate, player };
  addControlButtons(ctx);
  buildPlaylistOverlay(ctx);
  video.addEventListener("timeupdate", () => {
    syncOverlay(video.currentTime, video.duration);
  });
  initBuffering(video, player);
  if (item?.hlsSrc) attachHls(video, item.hlsSrc);
  return player;
}
export {
  applyMedia,
  mountDltsPlayer
};
