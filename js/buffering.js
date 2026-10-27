export function initBuffering(video, player) {
  // Able Player only refreshes elapsed on timeupdate, which does not fire
  // until the seek has buffered. Sync it when the seek starts so the
  // seekbar moves right away and repeated forward clicks accumulate.
  const spinner = document.createElement("div");
  spinner.id = "buffer-spinner";
  spinner.setAttribute("aria-hidden", "true");
  document.querySelector(".able-wrapper").appendChild(spinner);
  const setBuffering = (on) => spinner.classList.toggle("visible", on);

  video.addEventListener("seeking", () => {
    if (video._hls) video._hls.resumeBuffering();
    player.elapsed = video.currentTime;
    player.refreshControls("timeline");
    setBuffering(true);
  });
  video.addEventListener("waiting", () => setBuffering(true));
  ["seeked", "canplay", "playing"].forEach((e) =>
    video.addEventListener(e, () => setBuffering(false)),
  );
}
