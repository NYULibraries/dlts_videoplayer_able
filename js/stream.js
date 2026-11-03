export function attachHls(video, hlsSrc) {
  if (video._hlsAttached) return;
  video._hlsAttached = true;
  if (Hls.isSupported()) {
    // Safari's ManagedMediaSource fires endstreaming, which makes hls.js
    // stop loading fragments, so a seek to an unbuffered time never fills.
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
