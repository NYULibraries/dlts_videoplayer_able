// Demo playlist only. Other projects pass their own list into mountDltsPlayer.

const hlsBase = "https://stream.dlib.nyu.edu";
const vttBase =
  "https://sites.dlib.nyu.edu/media/api/v0/service/fileserver/av/tamwag/rosie/2_ESTHER_HORNE";
const poster =
  "https://dlib.nyu.edu/files/av/tamwag/rosie/2_ESTHER_HORNE/2_ESTHER_HORNE_thumbnail.jpg";

function reel(n, captions) {
  return {
    title: `Esther Horne — Reel ${n}`,
    hlsSrc: `${hlsBase}/hls-vod/tamwag/rosie/2_ESTHER_HORNE_REEL_${n}_manifest.m3u8`,
    poster,
    captions,
  };
}

export const PLAYLIST = [
  reel(1, [
    {
      srclang: "en",
      label: "English",
      src: `${vttBase}/2_ESTHER_HORNE_REEL_1.precision.en.vtt`,
    },
    { srclang: "es", label: "Spanish", src: "esther_horne_reel1_es.vtt" },
  ]),
  reel(2, [
    {
      srclang: "en",
      label: "English",
      src: `${vttBase}/2_ESTHER_HORNE_REEL_2.precision.en.vtt`,
    },
  ]),
  reel(3, [
    {
      srclang: "en",
      label: "English",
      src: `${vttBase}/2_ESTHER_HORNE_REEL_3.precision.en.vtt`,
    },
  ]),
];

export const currentIndex = Math.max(
  0,
  Math.min(
    PLAYLIST.length - 1,
    parseInt(new URLSearchParams(location.search).get("reel") || "0"),
  ),
);
