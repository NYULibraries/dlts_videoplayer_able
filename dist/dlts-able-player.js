// js/tooltip.js
var e, t, n;
function r() {
	clearTimeout(t), e.style.display = "none";
}
function i(e) {
	let t = e.target.closest("[role=\"button\"]");
	t && t !== n && r();
}
function a(a) {
	if (a.getAttribute("aria-expanded") === "true") return;
	let o = document.querySelector(".able-controller");
	e || (e = document.createElement("div"), e.className = "able-tooltip", e.addEventListener("mouseenter", () => clearTimeout(t)), e.addEventListener("mouseleave", r), o.appendChild(e), o.addEventListener("mouseover", i), o.addEventListener("focusin", i)), n = a, clearTimeout(t), AblePlayerInstances[0].$tooltipDiv.hide(), e.textContent = a.getAttribute("aria-label"), e.style.display = "block";
	let s = o.getBoundingClientRect(), c = a.getBoundingClientRect(), l = s.right - c.right - e.offsetWidth / 2;
	e.style.right = (l < 0 ? 2 : l) + "px", e.style.top = $(a).position().top + $(a).height() + 5 + "px";
}
function o(n) {
	e && (clearTimeout(t), n.type === "click" ? r() : t = setTimeout(r, 500));
}
// js/controls.js
var s = "http://www.w3.org/2000/svg";
function c(e, t, n, r, i) {
	let c = document.createElement("div");
	c.setAttribute("role", "button"), c.setAttribute("tabindex", "0"), c.className = `able-button-handler-${e}`, c.setAttribute("aria-label", t);
	let l = document.createElementNS(s, "svg");
	l.setAttribute("focusable", "false"), l.setAttribute("aria-hidden", "true"), l.setAttribute("viewBox", n);
	let u = document.createElementNS(s, "path");
	return u.setAttribute("d", r), l.appendChild(u), c.appendChild(l), c.addEventListener("click", i), ["mouseenter", "focus"].forEach((e) => c.addEventListener(e, () => a(c))), [
		"mouseleave",
		"blur",
		"click"
	].forEach((e) => c.addEventListener(e, o)), c.addEventListener("keydown", (e) => {
		(e.key === "Enter" || e.key === " ") && (e.preventDefault(), i());
	}), c;
}
function l() {
	let e = document.createElement("div");
	return e.className = "able-pipe", e.textContent = "|", e;
}
function u({ playlist: e, index: t, onNavigate: n }) {
	let r = document.querySelector(".able-right-controls") || document.querySelector(".able-controller");
	if (!r) return;
	r.appendChild(l());
	let i = [[
		"prev-item",
		"Previous video",
		"M5 17.5v-15h2.5v6.875l6.25-6.25v13.75l-6.25-6.25v6.875z",
		t - 1
	], [
		"next-item",
		"Next video",
		"M15 2.5v15h-2.5v-6.875l-6.25 6.25v-13.75l6.25 6.25v-6.875z",
		t + 1
	]];
	for (let [t, a, o, s] of i) {
		let i = s >= 0 && s < e.length, l = c(t, a, "0 0 20 20", o, () => {
			i && n(s);
		});
		i || (l.classList.add("buttonOff"), l.setAttribute("aria-disabled", "true")), r.appendChild(l);
	}
}
// js/overlay.js
function d({ playlist: e, index: t, onNavigate: n }) {
	let r = document.querySelector(".able-wrapper");
	if (!r) return;
	let i = document.createElement("div");
	i.id = "playlist-overlay", e.forEach((e, r) => {
		if (r <= t) return;
		let a = document.createElement("div");
		a.className = "playlist-card", a.addEventListener("click", () => n(r));
		let o = document.createElement("div");
		o.className = "playlist-circle";
		let s = document.createElement("img");
		s.src = e.poster, s.alt = e.title, o.appendChild(s);
		let c = document.createElement("span");
		c.className = "playlist-card-label", c.textContent = e.title, a.appendChild(o), a.appendChild(c), i.appendChild(a);
	}), i.children.length && r.appendChild(i);
}
var f = !1;
function p(e, t) {
	let n = document.getElementById("playlist-overlay");
	if (!n || !(t > 0)) return;
	let r = e >= t - 20;
	r !== f && (n.classList.toggle("visible", r), f = r);
}
// js/buffering.js
function m(e, t) {
	let n = document.createElement("div");
	n.id = "buffer-spinner", n.setAttribute("aria-hidden", "true");
	let r = e.closest(".able-wrapper") || document.querySelector(".able-wrapper");
	r && r.appendChild(n);
	let i = (e) => n.classList.toggle("visible", e);
	e.addEventListener("seeking", () => {
		e._hls && e._hls.resumeBuffering(), t.elapsed = e.currentTime, t.refreshControls("timeline"), i(!0);
	}), e.addEventListener("waiting", () => i(!0)), [
		"seeked",
		"canplay",
		"playing"
	].forEach((t) => e.addEventListener(t, () => i(!1)));
}
// js/stream.js
function h(e, t) {
	if (!e._hlsAttached) {
		if (e._hlsAttached = !0, Hls.isSupported()) {
			let n = new Hls({ preferManagedMediaSource: !1 });
			e._hls = n, n.loadSource(t), n.attachMedia(e), n.on(Hls.Events.ERROR, (e, t) => {
				t.fatal && console.error("HLS error:", t.type, t.details);
			});
		} else e.canPlayType("application/vnd.apple.mpegurl") ? e.src = t : console.error("HLS not supported in this browser.");
	}
}
// js/transcript.js
function g(e) {
	return String(Math.floor(e)).padStart(2, "0");
}
function _(e) {
	return e ? e.type === "string" ? e.value || "" : (e.children || []).map(_).join("") : "";
}
function v(e) {
	return _(e.components).trim();
}
function y(e) {
	let t = Math.floor(e / 3600), n = Math.floor(e % 3600 / 60), r = (e % 60).toFixed(3).padStart(6, "0");
	return `${g(t)}:${g(n)}:${r}`;
}
function b(e) {
	let t = [], n = null;
	return e.forEach((e) => {
		let r = v(e).replace(/\n\s*/g, " ").trim();
		if (!r) return;
		let i = r.match(/^(\p{L}+ \d+):\s*/u);
		i ? (n = {
			speaker: i[1],
			time: e.start,
			text: r.slice(i[0].length)
		}, t.push(n)) : n ? n.text += (n.text ? " " : "") + r : (n = {
			speaker: null,
			time: e.start,
			text: r
		}, t.push(n));
	}), t.filter((e) => e.text).map((e) => (e.speaker ? `${e.speaker} ` : "") + y(e.time) + "\n" + e.text).join("\n\n") + "\n";
}
function x(e) {
	let t = new Blob([b(e)], { type: "text/plain;charset=utf-8" });
	window.open(URL.createObjectURL(t), "_blank");
}
var S = "http://www.w3.org/2000/svg";
function C(e) {
	let t = e.$transcriptToolbar?.[0];
	if (!t) return;
	let n = document.createElement("button");
	n.type = "button", n.className = "able-transcript-newtab", n.textContent = "View in new tab";
	let r = document.createElementNS(S, "svg");
	r.setAttribute("viewBox", "0 0 24 24"), r.setAttribute("aria-hidden", "true"), r.setAttribute("focusable", "false");
	let i = document.createElementNS(S, "path");
	i.setAttribute("d", "M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42L17.59 5H14V3zM5 5h6v2H5v12h12v-6h2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"), r.appendChild(i), n.appendChild(r), n.addEventListener("click", (t) => {
		t.stopPropagation();
		let n = e.transcriptCaptions?.cues || e.captions?.[0]?.cues;
		n?.length && x(n);
	});
	let a = t.querySelector(".autoscroll-transcript");
	t.insertBefore(n, a);
}
// js/dlts-player.js
function w(e, t) {
	if (!t) return;
	e.poster = t.poster || "";
	let n = t.captions || [], r = [...e.querySelectorAll("track")];
	for (let t of n) {
		if (!t.srclang || !t.src) continue;
		let n = r.find((e) => e.srclang === t.srclang);
		n || (n = document.createElement("track"), n.kind = t.kind || "captions", n.srclang = t.srclang, e.appendChild(n), r.push(n)), n.src = t.src, n.label = t.label || t.srclang, t.kind && (n.kind = t.kind);
	}
}
function T(e) {
	let t = window.AblePlayerInstances || [];
	return t.find((t) => t.media === e) || t[0];
}
function E(e) {
	return new Promise((t) => {
		let n = () => {
			let r = T(e);
			r && r.playerCreated ? t(r) : requestAnimationFrame(n);
		};
		n();
	});
}
async function D({ video: e, playlist: t = [], index: n = 0, onNavigate: r } = {}) {
	if (!e) throw Error("mountDltsPlayer: video is required");
	let i = t[n];
	if (w(e, i), !T(e) && window.AblePlayer && !e.hasAttribute("data-able-player")) {
		let t = window.jQuery ? window.jQuery(e) : e, n = new AblePlayer(t);
		(window.AblePlayerInstances ||= []).push(n);
	}
	let a = await E(e), o = {
		video: e,
		playlist: t,
		index: n,
		onNavigate: r || ((e) => {
			let t = new URLSearchParams(location.search);
			t.set("reel", e), location.href = `${location.pathname}?${t}`;
		}),
		player: a
	};
	return u(o), C(a), d(o), e.addEventListener("timeupdate", () => {
		p(e.currentTime, e.duration);
	}), m(e, a), i?.hlsSrc && h(e, i.hlsSrc), a;
}
export { w as applyMedia, D as mountDltsPlayer };
