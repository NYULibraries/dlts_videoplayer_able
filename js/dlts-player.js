import { addControlButtons } from "./controls.js";
import { buildPlaylistOverlay, syncOverlay } from "./overlay.js";
import { initBuffering } from "./buffering.js";
import { attachHls } from "./stream.js";

// Must run before Able Player inits. It reads poster and <track> srcs
// off the <video> at construct time. If we set them later, Safari can
// sit on a poster-only native video with no Able Player chrome.
export function applyMedia(video, item) {
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
  // Able Player only pushes into this array when it auto-inits from
  // data-able-player. new AblePlayer(...) does not, unless we push.
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

/**
 * Apply a playlist item, wait for Able Player, then attach DLTS controls,
 * overlay, buffering, and HLS.
 *
 * Prefer data-able-player on the <video> and load ableplayer.min.js after
 * applyMedia (see index.html). If the attribute is missing, this constructs
 * Able Player itself.
 */
export async function mountDltsPlayer({
  video,
  playlist = [],
  index = 0,
  onNavigate,
} = {}) {
  if (!video) throw new Error("mountDltsPlayer: video is required");

  const item = playlist[index];
  applyMedia(video, item);

  // Demo (index.html): video[data-able-player] + defer ableplayer.min.js
  // AFTER applyMedia. Able Player's jQuery ready handler finds the
  // attribute, constructs itself, and pushes AblePlayerInstances.
  //
  // Do not skip that and call new AblePlayer(video) instead: passing a
  // raw DOM node (not jQuery) and never pushing the instance made
  // waitForAblePlayer hang, HLS never attached, and Safari showed only
  // the poster. Other hosts without the attribute still take this branch.
  if (!playerFor(video) && window.AblePlayer && !video.hasAttribute("data-able-player")) {
    const media = window.jQuery ? window.jQuery(video) : video;
    const instance = new AblePlayer(media);
    (window.AblePlayerInstances ||= []).push(instance);
  }

  const player = await waitForAblePlayer(video);
  const navigate =
    onNavigate ||
    ((i) => {
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
