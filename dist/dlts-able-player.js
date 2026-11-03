// js/transcript.js
function e(e) {
	return String(Math.floor(e)).padStart(2, "0");
}
function t(e) {
	return e ? e.type === "string" ? e.value || "" : (e.children || []).map(t).join("") : "";
}
function n(e) {
	return t(e.components).trim();
}
function r(t) {
	let n = Math.floor(t / 3600), r = Math.floor(t % 3600 / 60), i = (t % 60).toFixed(3).padStart(6, "0");
	return `${e(n)}:${e(r)}:${i}`;
}
function i(e) {
	let t = [], i = null;
	return e.forEach((e) => {
		let r = n(e).replace(/\n\s*/g, " ").trim();
		if (!r) return;
		let a = r.match(/^(Speaker \d+):\s*/);
		a ? (i = {
			speaker: a[1],
			time: e.start,
			text: r.slice(a[0].length)
		}, t.push(i)) : i ? i.text += (i.text ? " " : "") + r : (i = {
			speaker: null,
			time: e.start,
			text: r
		}, t.push(i));
	}), t.filter((e) => e.text).map((e) => (e.speaker ? `${e.speaker} ` : "") + r(e.time) + "\n" + e.text).join("\n\n") + "\n";
}
function a(e) {
	let t = new Blob([i(e)], { type: "text/plain" });
	window.open(URL.createObjectURL(t), "_blank");
}
// js/tooltip.js
var o, s, c;
function l() {
	clearTimeout(s), o.style.display = "none";
}
function u(e) {
	let t = e.target.closest("[role=\"button\"]");
	t && t !== c && l();
}
function d(e) {
	if (e.getAttribute("aria-expanded") === "true") return;
	let t = document.querySelector(".able-controller");
	o || (o = document.createElement("div"), o.className = "able-tooltip", o.addEventListener("mouseenter", () => clearTimeout(s)), o.addEventListener("mouseleave", l), t.appendChild(o), t.addEventListener("mouseover", u), t.addEventListener("focusin", u)), c = e, clearTimeout(s), AblePlayerInstances[0].$tooltipDiv.hide(), o.textContent = e.getAttribute("aria-label"), o.style.display = "block";
	let n = t.getBoundingClientRect(), r = e.getBoundingClientRect(), i = n.right - r.right - o.offsetWidth / 2;
	o.style.right = (i < 0 ? 2 : i) + "px", o.style.top = $(e).position().top + $(e).height() + 5 + "px";
}
function f(e) {
	o && (clearTimeout(s), e.type === "click" ? l() : s = setTimeout(l, 500));
}
// js/controls.js
var p = "http://www.w3.org/2000/svg";
function m(e, t, n, r, i) {
	let a = document.createElement("div");
	a.setAttribute("role", "button"), a.setAttribute("tabindex", "0"), a.className = `able-button-handler-${e}`, a.setAttribute("aria-label", t);
	let o = document.createElementNS(p, "svg");
	o.setAttribute("focusable", "false"), o.setAttribute("aria-hidden", "true"), o.setAttribute("viewBox", n);
	let s = document.createElementNS(p, "path");
	return s.setAttribute("d", r), o.appendChild(s), a.appendChild(o), a.addEventListener("click", i), ["mouseenter", "focus"].forEach((e) => a.addEventListener(e, () => d(a))), [
		"mouseleave",
		"blur",
		"click"
	].forEach((e) => a.addEventListener(e, f)), a.addEventListener("keydown", (e) => {
		(e.key === "Enter" || e.key === " ") && (e.preventDefault(), i());
	}), a;
}
function h() {
	let e = document.createElement("div");
	return e.className = "able-pipe", e.textContent = "|", e;
}
function g({ playlist: e, index: t, onNavigate: n, player: r }) {
	let i = document.querySelector(".able-right-controls") || document.querySelector(".able-controller");
	if (!i) return;
	i.appendChild(h());
	let o = [[
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
	for (let [t, r, a, s] of o) {
		let o = s >= 0 && s < e.length, c = m(t, r, "0 0 20 20", a, () => {
			o && n(s);
		});
		o || (c.classList.add("buttonOff"), c.setAttribute("aria-disabled", "true")), i.appendChild(c);
	}
	let s = (r.captions || []).filter((e) => e.cues && e.cues.length), c = document.createElement("ul");
	c.className = "able-popup able-popup-transcript", c.setAttribute("role", "menu"), c.style.display = "none";
	let l = document.createElement("li");
	l.setAttribute("role", "presentation"), l.className = "able-popup-transcript-heading", l.textContent = "Languages", c.appendChild(l), s.forEach((e) => {
		let t = document.createElement("li");
		t.setAttribute("role", "menuitem"), t.setAttribute("tabindex", "-1"), t.textContent = e.label || e.language || "Transcript", t.addEventListener("click", (t) => {
			t.stopPropagation(), c.style.display = "none", u.setAttribute("aria-expanded", "false"), a(e.cues);
		}), t.addEventListener("keydown", (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), t.click());
		}), c.appendChild(t);
	});
	let u = m("view-transcript", "View transcript as plain text", "0 0 20 20", "M0 19.107v-17.857q0-0.446 0.313-0.759t0.759-0.313h8.929v6.071q0 0.446 0.313 0.759t0.759 0.313h6.071v11.786q0 0.446-0.313 0.759t-0.759 0.312h-15q-0.446 0-0.759-0.313t-0.313-0.759zM4.286 15.536q0 0.156 0.1 0.257t0.257 0.1h7.857q0.156 0 0.257-0.1t0.1-0.257v-0.714q0-0.156-0.1-0.257t-0.257-0.1h-7.857q-0.156 0-0.257 0.1t-0.1 0.257v0.714zM4.286 12.679q0 0.156 0.1 0.257t0.257 0.1h7.857q0.156 0 0.257-0.1t0.1-0.257v-0.714q0-0.156-0.1-0.257t-0.257-0.1h-7.857q-0.156 0-0.257 0.1t-0.1 0.257v0.714zM4.286 9.821q0 0.156 0.1 0.257t0.257 0.1h7.857q0.156 0 0.257-0.1t0.1-0.257v-0.714q0-0.156-0.1-0.257t-0.257-0.1h-7.857q-0.156 0-0.257 0.1t-0.1 0.257v0.714zM11.429 5.893v-5.268q0.246 0.156 0.402 0.313l4.554 4.554q0.156 0.156 0.313 0.402h-5.268z", () => {
		let e = c.style.display !== "none";
		c.style.display = e ? "none" : "", u.setAttribute("aria-expanded", e ? "false" : "true"), !e && c.firstChild && c.firstChild.focus();
	});
	u.setAttribute("aria-haspopup", "menu"), u.setAttribute("aria-expanded", "false"), u.style.position = "relative", u.appendChild(c), i.appendChild(h()), i.appendChild(u), document.addEventListener("click", (e) => {
		u.contains(e.target) || (c.style.display = "none", u.setAttribute("aria-expanded", "false"));
	});
}
// js/overlay.js
function _({ playlist: e, index: t, onNavigate: n }) {
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
var v = !1;
function y(e, t) {
	let n = document.getElementById("playlist-overlay");
	if (!n || !(t > 0)) return;
	let r = e >= t - 20;
	r !== v && (n.classList.toggle("visible", r), v = r);
}
// js/buffering.js
function b(e, t) {
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
function x(e, t) {
	if (!e._hlsAttached) {
		if (e._hlsAttached = !0, Hls.isSupported()) {
			let n = new Hls({ preferManagedMediaSource: !1 });
			e._hls = n, n.loadSource(t), n.attachMedia(e), n.on(Hls.Events.ERROR, (e, t) => {
				t.fatal && console.error("HLS error:", t.type, t.details);
			});
		} else e.canPlayType("application/vnd.apple.mpegurl") ? e.src = t : console.error("HLS not supported in this browser.");
	}
}
// js/dlts-player.js
function S(e, t) {
	if (!t) return;
	e.poster = t.poster || "";
	let n = t.captions || [], r = [...e.querySelectorAll("track")];
	for (let t of n) {
		if (!t.srclang || !t.src) continue;
		let n = r.find((e) => e.srclang === t.srclang);
		n || (n = document.createElement("track"), n.kind = t.kind || "captions", n.srclang = t.srclang, e.appendChild(n), r.push(n)), n.src = t.src, n.label = t.label || t.srclang, t.kind && (n.kind = t.kind);
	}
}
function C(e) {
	let t = window.AblePlayerInstances || [];
	return t.find((t) => t.media === e) || t[0];
}
function w(e) {
	return new Promise((t) => {
		let n = () => {
			let r = C(e);
			r && r.playerCreated ? t(r) : requestAnimationFrame(n);
		};
		n();
	});
}
async function T({ video: e, playlist: t = [], index: n = 0, onNavigate: r } = {}) {
	if (!e) throw Error("mountDltsPlayer: video is required");
	let i = t[n];
	if (S(e, i), !C(e) && window.AblePlayer && !e.hasAttribute("data-able-player")) {
		let t = window.jQuery ? window.jQuery(e) : e, n = new AblePlayer(t);
		(window.AblePlayerInstances ||= []).push(n);
	}
	let a = await w(e), o = {
		video: e,
		playlist: t,
		index: n,
		onNavigate: r || ((e) => {
			let t = new URLSearchParams(location.search);
			t.set("reel", e), location.href = `${location.pathname}?${t}`;
		}),
		player: a
	};
	return g(o), _(o), e.addEventListener("timeupdate", () => {
		y(e.currentTime, e.duration);
	}), b(e, a), i?.hlsSrc && x(e, i.hlsSrc), a;
}
export { S as applyMedia, T as mountDltsPlayer };
