/* ═══════════════════════════════════════
   main.js — cursor, scroll, reveal
   ═══════════════════════════════════════ */

/* ── CUSTOM CURSOR ── */
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function loop() {
  cur.style.left = mx + 'px'; cur.style.top = my + 'px';
  rx += (mx - rx) * 0.11; ry += (my - ry) * 0.11;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(loop);
})();

document.querySelectorAll('a,button').forEach(el => {
  el.addEventListener('mouseenter', () => { cur.style.transform = 'translate(-50%,-50%) scale(2.8)'; ring.style.opacity = '0'; });
  el.addEventListener('mouseleave', () => { cur.style.transform = 'translate(-50%,-50%) scale(1)'; ring.style.opacity = '1'; });
});

/* ── REVEAL ON SCROLL ── */
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
revealEls.forEach(el => revealObs.observe(el));

/* ── NAV BORDER ON SCROLL ── */
window.addEventListener('scroll', () => {
  document.getElementById('mainnav').style.borderBottomColor =
    window.scrollY > 60 ? 'rgba(201,169,110,0.18)' : 'rgba(201,169,110,0.08)';
});
