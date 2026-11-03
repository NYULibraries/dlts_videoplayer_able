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
  const m = Math.floor((secs % 3600) / 60);
  const s = (secs % 60).toFixed(3).padStart(6, "0");
  return `${pad2(h)}:${pad2(m)}:${s}`;
}

function buildTranscriptText(cues) {
  const groups = [];
  let current = null;
  cues.forEach((cue) => {
    const raw = cueToText(cue).replace(/\n\s*/g, " ").trim();
    if (!raw) return;
    const m = raw.match(/^(\p{L}+ \d+):\s*/u);
    if (m) {
      current = {
        speaker: m[1],
        time: cue.start,
        text: raw.slice(m[0].length),
      };
      groups.push(current);
    } else if (current) {
      current.text += (current.text ? " " : "") + raw;
    } else {
      current = { speaker: null, time: cue.start, text: raw };
      groups.push(current);
    }
  });
  return (
    groups
      .filter((g) => g.text)
      .map(
        (g) =>
          (g.speaker ? `${g.speaker} ` : "") +
          formatTimeTxt(g.time) +
          "\n" +
          g.text,
      )
      .join("\n\n") + "\n"
  );
}

export function openTranscriptTab(cues) {
  const blob = new Blob([buildTranscriptText(cues)], {
    type: "text/plain;charset=utf-8",
  });
  window.open(URL.createObjectURL(blob), "_blank");
}

const svgNS = "http://www.w3.org/2000/svg";

// Sits in Able Player's transcript toolbar, before "Auto scroll".
// Uses whichever language the transcript window is showing at click time.
export function addTranscriptLink(player) {
  const toolbar = player.$transcriptToolbar?.[0];
  if (!toolbar) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "able-transcript-newtab";
  btn.textContent = "View in new tab";

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", "M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42L17.59 5H14V3zM5 5h6v2H5v12h12v-6h2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z");
  svg.appendChild(path);
  btn.appendChild(svg);

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const cues = player.transcriptCaptions?.cues || player.captions?.[0]?.cues;
    if (cues?.length) openTranscriptTab(cues);
  });

  const autoScroll = toolbar.querySelector(".autoscroll-transcript");
  toolbar.insertBefore(btn, autoScroll);
}
