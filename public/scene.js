// An original pixel-art street for each account. The people are the account's stakeholders (drawn from
// their ids), the drone flies to whoever you hover or click, and follows your cursor over the street.
// Everything shown comes from the same data as the five answers; nothing here is decorative data.
const W = 320, H = 100, GROUND = 82;
const SKIN = ["#f0c9a0", "#d29b6b", "#9a6a45", "#5e3b28"];
const HAIR = ["#2a1a12", "#6b3b1a", "#d9a441", "#1b1b1f", "#b3532a"];
const SHIRT = ["#3d7be0", "#e0682c", "#3fae6a", "#e0b030", "#8b6bd6", "#d8d2c4"];
const PANTS = ["#2b2f4a", "#3a2f2a", "#27403a", "#42324d"];
const MOOD = { ally: "#4ade80", warm: "#c5e35a", neutral: "#aaa59a", guarded: "#ff7064" };
const OUT = "#140c08";

function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = seed || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const VERB = { decides: "Decides", pays: "Pays for", uses: "Uses", blocks: "Could block" };

function lookFor(id) {
  const h = hash(id);
  return { skin: SKIN[h % 4], hair: HAIR[(h >> 3) % 5], style: (h >> 6) % 4, shirt: SHIRT[(h >> 9) % 6], pants: PANTS[(h >> 12) % 4] };
}

function factsFor(a, id) {
  const out = [];
  for (const d of a.q2) for (const k of ["decides", "pays", "uses", "blocks"]) for (const p of d.roles[k]) {
    if (p.id === id) out.push(`${VERB[k]}: ${d.title}. ${String(p.why).split(/(?<=\.)\s/)[0].slice(0, 120)}`);
  }
  return out;
}

let stop = null;

export function mountScene(host, a, openRef) {
  if (stop) stop();
  const people = a.stakeholders.map((s, i) => ({ ...s, look: lookFor(s.id), facts: factsFor(a, s.id), phase: hash(s.id) % 1000 }));
  const n = people.length;
  people.forEach((p, i) => { p.x = Math.round(36 + (i * (216 - 0)) / Math.max(1, n - 1)); });
  const dockX = 292;
  const m = a.metrics;
  const dockText = m ? `${m.docks} docks paid for. ${m.flights} flights in ${m.weeks} weeks.${m.never.length ? ` ${m.never.length} never flew.` : ""} ${m.top4Share}% of flights come from four docks.` : "";

  host.innerHTML = `<div class="scene" id="scene"><canvas width="${W}" height="${H}" aria-label="Pixel street with this account's people and a drone"></canvas>
    <div class="s-people">${people.map((p, i) => `<button class="s-p" data-i="${i}" style="left:${(p.x / W) * 100}%" aria-label="${p.name}, ${p.relationship || "not on file"}"><span class="s-n">${p.name.replace(/^Insp\.\s*/, "").split(" ")[0]}</span></button>`).join("")}
    <button class="s-p s-dock" data-i="${n}" style="left:${(dockX / W) * 100}%" aria-label="Dock usage"><span class="s-n">docks</span></button></div>
    <div class="s-bubble" hidden></div></div>
    <p class="meta scene-hint">Hover a person and the drone flies to them. Click for the source. Move over the street and it follows you.</p>`;
  const wrap = host.querySelector("#scene"), cv = wrap.querySelector("canvas"), g = cv.getContext("2d");
  const bubble = wrap.querySelector(".s-bubble");
  g.imageSmoothingEnabled = false;
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

  const rand = rng(hash(a.id + "city"));
  const buildings = []; for (let x = -4; x < W; x += 0) { const w = 18 + Math.floor(rand() * 18), h = 26 + Math.floor(rand() * 30); buildings.push({ x, w, h, lit: rand(), tone: rand() }); x += w + 2; }
  const tallest = buildings.reduce((b, c) => (c.h > b.h ? c : b), buildings[0]);
  const stars = Array.from({ length: 34 }, () => ({ x: Math.floor(rand() * W), y: Math.floor(rand() * 46), p: rand() * 6 }));

  const st = { t: 0, hover: -1, mouse: null, tour: 0, tourAt: 0, dx: dockX, dy: GROUND - 8, vx: 0, vy: 0, lastX: dockX, taking: 1 };
  let raf = 0, visible = true, last = performance.now(), live = true;

  function drawPerson(p, t, hop, blink) {
    const x = p.x, L = p.look; let y = GROUND - Math.round(hop);
    g.globalAlpha = p.available === false ? 0.5 : 1;
    R(x - 5, GROUND, 10, 1, "rgba(0,0,0,.35)");
    const bob = Math.round(Math.sin((t + p.phase) / 380) * 0.6);
    y += bob;
    R(x - 4, y - 5, 8, 6, OUT); R(x - 3, y - 4, 2, 4, L.pants); R(x + 1, y - 4, 2, 4, L.pants); R(x - 3, y - 1, 2, 1, "#111"); R(x + 1, y - 1, 2, 1, "#111");
    R(x - 5, y - 12, 10, 8, OUT); R(x - 4, y - 11, 8, 6, L.shirt); R(x - 5, y - 10, 1, 5, "rgba(0,0,0,.25)"); R(x + 4, y - 10, 1, 5, "rgba(0,0,0,.25)");
    R(x - 4, y - 7, 8, 1, "rgba(0,0,0,.18)");
    R(x - 4, y - 19, 8, 8, OUT); R(x - 3, y - 18, 6, 6, L.skin);
    if (L.style === 0) { R(x - 3, y - 19, 6, 2, L.hair); R(x - 4, y - 18, 1, 3, L.hair); R(x + 3, y - 18, 1, 3, L.hair); }
    else if (L.style === 1) { R(x - 5, y - 22, 10, 5, OUT); R(x - 4, y - 21, 8, 4, L.hair); R(x - 4, y - 17, 1, 2, L.hair); R(x + 3, y - 17, 1, 2, L.hair); }
    else if (L.style === 2) { R(x - 4, y - 20, 8, 3, OUT); R(x - 3, y - 19, 6, 2, L.shirt); R(x - 5, y - 17, 4, 1, OUT); R(x - 5, y - 17, 3, 1, L.shirt); }
    else { R(x - 4, y - 19, 8, 3, L.hair); R(x - 4, y - 17, 1, 6, L.hair); R(x + 3, y - 17, 1, 6, L.hair); }
    if (!blink) { R(x - 2, y - 15, 1, 1, OUT); R(x + 1, y - 15, 1, 1, OUT); } else { R(x - 2, y - 14, 2, 1, OUT); R(x + 1, y - 14, 2, 1, OUT); }
    R(x - 1, y - 13, 2, 1, "#8a3b2a");
    g.globalAlpha = 1;
    const c = MOOD[p.relationship] || "#555", iy = y - 27 + Math.round(Math.sin((t + p.phase) / 260) * 1);
    R(x - 1, iy, 3, 1, c); R(x - 2, iy + 1, 5, 1, c); R(x - 1, iy + 2, 3, 1, c);
    if (p.available === false) { const z = Math.floor(t / 500) % 3; R(x + 5 + z, y - 24 - z * 2, 3, 1, "#e7e2d6"); R(x + 6 + z, y - 23 - z * 2, 1, 1, "#e7e2d6"); R(x + 5 + z, y - 22 - z * 2, 3, 1, "#e7e2d6"); }
  }

  function drawDrone(x, y, t, tilt) {
    x = Math.round(x); y = Math.round(y);
    const alt = Math.max(0, GROUND - y), sh = Math.max(2, 10 - Math.floor(alt / 10));
    g.globalAlpha = Math.max(0.15, 0.5 - alt / 200); R(x - sh / 2, GROUND + 1, sh, 1, "#000"); g.globalAlpha = 1;
    const f = Math.floor(t / 55) % 2, ty = tilt;
    R(x - 9, y - 2 + ty, f ? 6 : 4, 1, "#aab2c0"); R(x + (f ? 3 : 5), y - 2 - ty, f ? 6 : 4, 1, "#aab2c0");
    R(x - 7, y - 1, 2, 1, "#4b4f5c"); R(x + 5, y - 1, 2, 1, "#4b4f5c");
    R(x - 5, y, 10, 4, OUT); R(x - 4, y + 0, 8, 3, "#d4cfc4"); R(x - 4, y + 1, 8, 1, "#e0682c"); R(x - 3, y - 1, 6, 1, "#eae6dc");
    R(x - 1, y + 4, 3, 2, OUT); R(x, y + 4, 1, 1, "#6aaefc");
    R(x + 3, y - 1, 1, 1, Math.floor(t / 400) % 2 ? "#4ade80" : "#14532d"); R(x - 4, y - 1, 1, 1, Math.floor(t / 400) % 2 ? "#ff7064" : "#5c1a16");
  }

  function drawScene(t) {
    const bands = ["#0e1030", "#161a46", "#241f55", "#3a2562", "#5b2d66", "#8a3a62", "#bd5058", "#e0682c"];
    bands.forEach((c, i) => R(0, i * 11, W, 11, c));
    R(0, 77, W, 5, "#e0682c");
    stars.forEach((s) => { if (Math.sin(t / 700 + s.p) > -0.2) R(s.x, s.y, 1, 1, "rgba(255,240,220,.85)"); });
    for (let k = 0; k < 3; k++) { const cx = ((t / 90 + k * 130) % (W + 60)) - 30; g.globalAlpha = 0.18; R(cx, 22 + k * 11, 26, 2, "#ffb48a"); R(cx + 6, 20 + k * 11, 14, 2, "#ffb48a"); g.globalAlpha = 1; }
    R(238, 66, 22, 12, "#ffb347"); R(241, 63, 16, 3, "#ffb347"); R(236, 70, 26, 8, "#ffcf70");
    buildings.forEach((b) => {
      const top = GROUND - b.h; R(b.x, top, b.w, b.h, b.tone > 0.5 ? "#1a1532" : "#221a3d");
      for (let wx = b.x + 3; wx < b.x + b.w - 3; wx += 5) for (let wy = top + 4; wy < GROUND - 6; wy += 6) {
        const on = ((hash(wx * 7 + wy) % 100) / 100) < b.lit * 0.6 + 0.12; const fl = on && (Math.floor(t / 1500 + wx) % 17 !== 0);
        R(wx, wy, 2, 3, fl ? "#ffcf70" : "#2c2547");
      }
    });
    if (a.id === "A") { const on = Math.floor(t / 350) % 2; R(tallest.x + (tallest.w >> 1) - 3, GROUND - tallest.h - 3, 3, 3, on ? "#ff4d4d" : "#4d4d70"); R(tallest.x + (tallest.w >> 1), GROUND - tallest.h - 3, 3, 3, on ? "#4d4d70" : "#4da0ff"); }
    else { [60, 150].forEach((cx, k) => { R(cx, GROUND - 52, 6, 52, "#2a2040"); R(cx, GROUND - 52, 6, 3, "#e0682c"); for (let s = 0; s < 5; s++) { const u = ((t / 40 + s * 22 + k * 9) % 110); g.globalAlpha = Math.max(0, 0.45 - u / 250); R(cx + 1 + Math.sin(u / 11 + s) * 4, GROUND - 56 - u / 2, 4, 3, "#a9a4b8"); g.globalAlpha = 1; } }); }
    R(0, GROUND, W, 6, "#3a3342"); R(0, GROUND + 6, W, 12, "#24212c"); R(0, GROUND, W, 1, "#4a4254");
    for (let x = -((t / 40) % 24); x < W; x += 24) R(x, GROUND + 11, 12, 1, "#7d778a");
    R(dockX - 11, GROUND - 7, 22, 7, OUT); R(dockX - 10, GROUND - 6, 20, 5, "#bdb8ae"); R(dockX - 10, GROUND - 3, 20, 1, "#e0682c"); R(dockX - 6, GROUND - 8, 12, 2, "#d8d4c8");
    R(dockX + 7, GROUND - 5, 2, 1, Math.floor(t / 600) % 2 ? "#4ade80" : "#14532d");
  }

  function target() {
    if (st.hover >= 0) return st.hover === n ? { x: dockX, y: GROUND - 20, i: n } : { x: people[st.hover].x, y: GROUND - 34, i: st.hover };
    if (st.mouse) return { x: st.mouse.x, y: Math.min(GROUND - 16, Math.max(10, st.mouse.y)), i: -1 };
    const i = st.tour % (n + 1);
    return i === n ? { x: dockX, y: GROUND - 20, i } : { x: people[i].x, y: GROUND - 34, i };
  }

  function bubbleFor(i) {
    bubble.textContent = "";
    const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; e.textContent = txt; return e; };
    if (i === n) { bubble.append(mk("b", "", "The docks"), mk("div", "s-t", dockText), mk("div", "s-m", "click for the usage file")); return; }
    const p = people[i];
    bubble.append(mk("b", "", p.name), mk("div", "s-m", `${p.role} · ${p.relationship || "not on file"}${p.available === false ? " · away" : ""}`));
    (p.facts.slice(0, 2)).forEach((f) => bubble.append(mk("div", "s-t", f)));
    if (!p.facts.length) bubble.append(mk("div", "s-t", "Not tied to a deal in the power map yet."));
    bubble.append(mk("div", "s-m", "click for the source"));
  }

  let shown = -2;
  function frame(now) {
    const dt = Math.min(50, now - last); last = now; st.t += dt;
    if (!visible) { raf = requestAnimationFrame(frame); return; }
    const T = target();
    if (!st.mouse && st.hover < 0 && st.t - st.tourAt > 4200) { st.tour = (st.tour + 1) % (n + 1); st.tourAt = st.t; }
    const bob = Math.sin(st.t / 300) * 1.4;
    st.vx += (T.x - st.dx) * 0.045; st.vy += ((T.y + bob) - st.dy) * 0.045; st.vx *= 0.8; st.vy *= 0.8;
    st.dx += st.vx; st.dy += st.vy;
    const tilt = Math.max(-1, Math.min(1, Math.round(st.vx / 1.6)));
    drawScene(st.t);
    people.forEach((p, i) => {
      const near = Math.abs(st.dx - p.x) < 14 && st.dy > GROUND - 46;
      const hop = (st.hover === i || (near && !st.mouse)) ? Math.abs(Math.sin(st.t / 140)) * 3 : 0;
      const blink = Math.floor((st.t + p.phase * 3) / 90) % 38 === 0;
      drawPerson(p, st.t, hop, blink);
    });
    drawDrone(st.dx, st.dy, st.t, tilt);
    const want = st.mouse && st.hover < 0 ? -1 : T.i;
    if (want !== shown) {
      shown = want;
      if (want < 0) bubble.hidden = true; else { bubbleFor(want); bubble.hidden = false; }
    }
    if (!bubble.hidden) {
      const px = want === n ? dockX : people[want].x;
      const pct = Math.max(14, Math.min(86, (px / W) * 100));
      bubble.style.left = pct + "%";
      bubble.style.top = Math.max(4, (st.dy / H) * wrap.clientHeight - 20 - bubble.offsetHeight) + "px";
    }
    raf = requestAnimationFrame(frame);
  }

  wrap.addEventListener("pointermove", (e) => {
    if (e.target.closest(".s-p")) return;
    const r = cv.getBoundingClientRect(); st.mouse = { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H - 6 };
  });
  wrap.addEventListener("pointerleave", () => { st.mouse = null; st.hover = -1; st.tourAt = st.t; });
  wrap.querySelectorAll(".s-p").forEach((b) => {
    const i = Number(b.dataset.i);
    b.addEventListener("pointerenter", () => { st.hover = i; st.mouse = null; });
    b.addEventListener("pointerleave", () => { if (st.hover === i) st.hover = -1; });
    b.addEventListener("focus", () => { st.hover = i; });
    b.addEventListener("blur", () => { if (st.hover === i) st.hover = -1; });
    b.addEventListener("click", () => { openRef(i === n ? `${a.id}:usage_weekly.csv` : people[i].id); });
  });

  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0.05 });
  io.observe(wrap);
  const onVis = () => { if (document.hidden) cancelAnimationFrame(raf); else { last = performance.now(); raf = requestAnimationFrame(frame); } };
  document.addEventListener("visibilitychange", onVis);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { drawScene(0); people.forEach((p) => drawPerson(p, 0, 0, false)); drawDrone(dockX, GROUND - 20, 0, 0); }
  else raf = requestAnimationFrame(frame);

  stop = () => { live = false; cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener("visibilitychange", onVis); stop = null; };
}
