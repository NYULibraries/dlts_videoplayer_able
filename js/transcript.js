// ── Helpers ────────────────────────────────────────────────────────────

function pad2(n) {
  return String(Math.floor(n)).padStart(2, "0");
}

// Flatten Able Player's WebVTT component tree → plain text
function flattenComponent(c) {
  if (!c) return "";
  if (c.type === "string") return c.value || "";
  return (c.children || []).map(flattenComponent).join("");
}
function cueToText(cue) {
  return flattenComponent(cue.components).trim();
}

// ── Transcript tab ─────────────────────────────────────────────────────
// Groups cues by speaker, merges continuation cues, opens as plain text.

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
    const m = raw.match(/^(Speaker \d+):\s*/);
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
    type: "text/plain",
  });
  window.open(URL.createObjectURL(blob), "_blank");
}
