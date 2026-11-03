import { PLAYLIST, currentIndex } from "./testplaylist.js";
import { mountDltsPlayer } from "./dlts-player.js";

mountDltsPlayer({
  video: document.getElementById("video1"),
  playlist: PLAYLIST,
  index: currentIndex,
});
