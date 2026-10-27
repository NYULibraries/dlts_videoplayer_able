import { currentItem } from "./playlist.js";

const video = document.getElementById("video1");

export function attachHls() {
  if (video._hlsAttached) return;
  video._hlsAttached = true;
  if (Hls.isSupported()) {
    // Safari's ManagedMediaSource fires endstreaming, which makes hls.js
    // stop loading fragments, so a seek to an unbuffered time never fills.
    const hls = new Hls({ preferManagedMediaSource: false });
    video._hls = hls;
    hls.loadSource(currentItem.hlsSrc);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (data.fatal)
        console.error("HLS error:", data.type, data.details);
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = currentItem.hlsSrc;
  } else {
    console.error("HLS not supported in this browser.");
  }
}
