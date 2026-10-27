import { addControlButtons } from "./controls.js";
import { buildPlaylistOverlay, syncOverlay } from "./overlay.js";
import { initBuffering } from "./buffering.js";
import { attachHls } from "./stream.js";

const video = document.getElementById("video1");

function init() {
  addControlButtons();
  buildPlaylistOverlay();

  video.addEventListener("timeupdate", () => {
    syncOverlay(video.currentTime, video.duration);
  });

  initBuffering(video, AblePlayerInstances[0]);
  attachHls();
}

function waitForAblePlayer() {
  const player = AblePlayerInstances[0];
  if (player && player.playerCreated) {
    init();
  } else {
    requestAnimationFrame(waitForAblePlayer);
  }
}

waitForAblePlayer();
