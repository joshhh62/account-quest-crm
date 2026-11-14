// Visual layer only: scroll reveals, count-up numbers, card spotlight.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
