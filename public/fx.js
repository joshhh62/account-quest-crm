// Visual layer only: reactive dot grid, scroll reveals, count-up numbers, card spotlight.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const c = document.getElementById("dots"), g = c.getContext("2d");
  let W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  const GAP = 30, R = 150;
  function size() { W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); }
  addEventListener("resize", size); size();
  addEventListener("pointermove", (e) => { mouse.tx = e.clientX; mouse.ty = e.clientY; }, { passive: true });
  addEventListener("pointerleave", () => { mouse.tx = mouse.ty = -9999; });
  let t0 = performance.now();
  function frame(t) {
    mouse.x += (mouse.tx - mouse.x) * 0.14; mouse.y += (mouse.ty - mouse.y) * 0.14;
    g.clearRect(0, 0, W, H);
    const drift = reduce ? 0 : Math.sin((t - t0) / 2600) * 1.2;
    for (let x = GAP / 2; x < W; x += GAP) for (let y = GAP / 2; y < H; y += GAP) {
      const dx = x - mouse.x, dy = y - mouse.y, d = Math.hypot(dx, dy);
      let px = x, py = y + drift * ((x / GAP) % 2 ? 1 : -1), r = 1.1, a = 0.2, hot = 0;
      if (d < R) {
        const k = 1 - d / R, push = k * k * 14;
        px += (dx / (d || 1)) * push; py += (dy / (d || 1)) * push;
        r = 1.1 + k * 2.4; a = 0.2 + k * 0.8; hot = k;
      }
      g.fillStyle = hot > 0.02 ? `rgba(${200 + 55 * hot | 0},${120 - 20 * hot | 0},${60 - 20 * hot | 0},${a})` : `rgba(170,165,150,${a})`;
      g.beginPath(); g.arc(px, py, r, 0, 6.2832); g.fill();
    }
    requestAnimationFrame(frame);
  }
  if (!reduce) requestAnimationFrame(frame); else frame(0);

  // scroll progress bar
  const bar = document.getElementById("progress");
  const prog = () => { const h = document.documentElement; bar.style.width = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) * 100 + "%"; };
  addEventListener("scroll", prog, { passive: true }); prog();

  // card spotlight follows the cursor
  document.addEventListener("pointermove", (e) => {
    const el = e.target.closest && e.target.closest(".hero-card,.stat,.role");
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", e.clientX - r.left + "px"); el.style.setProperty("--my", e.clientY - r.top + "px");
  }, { passive: true });

  // reveal on scroll
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.08 }) : null;
  function reveal(root, animate) {
    root.querySelectorAll(".hero,.reality,section.q,.sigs").forEach((el) => {
      el.classList.add("rv");
      if (io && animate) io.observe(el); else el.classList.add("in");
    });
  }

  // count-up for money figures
  function counts(root) {
    if (reduce) return;
    root.querySelectorAll(".stat b,.hero-card b:not(.sm)").forEach((el) => {
      const m = el.textContent.match(/^([£€]?)([\d,]+)(.*)$/); if (!m) return;
      const end = Number(m[2].replace(/,/g, "")); if (!end) return;
      const t0 = performance.now(), dur = 900;
      const step = (t) => { const k = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
        el.textContent = m[1] + v.toLocaleString("en-GB") + m[3]; if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }
  window.__fx = { after(root, animate) { reveal(root, animate); if (animate) counts(root); } };
})();
