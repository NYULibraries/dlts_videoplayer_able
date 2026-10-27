// Must load before ableplayer.min.js: Able Player reads the poster and
// track sources from the <video> element when it initialises.

const hlsBase = "https://stream.dlib.nyu.edu";
// (window.ABLE_ENV && window.ABLE_ENV.hlsBase) ||
// "https://stream.dlib.nyu.edu";

export const PLAYLIST = [
  {
    title: "Esther Horne — Reel 1",
    hlsSrc:
      hlsBase +
      "/hls-vod/tamwag/rosie/2_ESTHER_HORNE_REEL_1_manifest.m3u8",
    vttSrc:
      "https://sites.dlib.nyu.edu/media/api/v0/service/fileserver/av/tamwag/rosie/2_ESTHER_HORNE/2_ESTHER_HORNE_REEL_1.precision.en.vtt",
    vttSrcEs: "esther_horne_reel1_es.vtt",
    poster:
      "https://dlib.nyu.edu/files/av/tamwag/rosie/2_ESTHER_HORNE/2_ESTHER_HORNE_thumbnail.jpg",
  },
  {
    title: "Esther Horne — Reel 2",
    hlsSrc:
      hlsBase +
      "/hls-vod/tamwag/rosie/2_ESTHER_HORNE_REEL_2_manifest.m3u8",
    vttSrc:
      "https://sites.dlib.nyu.edu/media/api/v0/service/fileserver/av/tamwag/rosie/2_ESTHER_HORNE/2_ESTHER_HORNE_REEL_2.precision.en.vtt",
    poster:
      "https://dlib.nyu.edu/files/av/tamwag/rosie/2_ESTHER_HORNE/2_ESTHER_HORNE_thumbnail.jpg",
  },
  {
    title: "Esther Horne — Reel 3",
    hlsSrc:
      hlsBase +
      "/hls-vod/tamwag/rosie/2_ESTHER_HORNE_REEL_3_manifest.m3u8",
    vttSrc:
      "https://sites.dlib.nyu.edu/media/api/v0/service/fileserver/av/tamwag/rosie/2_ESTHER_HORNE/2_ESTHER_HORNE_REEL_3.precision.en.vtt",
    poster:
      "https://dlib.nyu.edu/files/av/tamwag/rosie/2_ESTHER_HORNE/2_ESTHER_HORNE_thumbnail.jpg",
  },
];

export const currentIndex = Math.max(
  0,
  Math.min(
    PLAYLIST.length - 1,
    parseInt(new URLSearchParams(location.search).get("reel") || "0"),
  ),
);
export const currentItem = PLAYLIST[currentIndex];

document.getElementById("video1").poster = currentItem.poster;
document.getElementById("caption-track").src = currentItem.vttSrc;
document.getElementById("caption-track-es").src =
  currentItem.vttSrcEs || "";

export function navigateTo(index) {
  const p = new URLSearchParams(location.search);
  p.set("reel", index);
  location.href = `${location.pathname}?${p.toString()}`;
}
