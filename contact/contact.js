// ── CURSOR BADGE ──
const badge = document.getElementById('cursor-badge');
document.addEventListener('mousemove', e => {
  badge.style.left = e.clientX + 'px';
  badge.style.top  = e.clientY + 'px';
  badge.textContent = `X:${String(Math.round(e.clientX)).padStart(4,'0')} Y:${String(Math.round(e.clientY)).padStart(4,'0')}`;
  badge.classList.add('visible');
});
document.addEventListener('mouseleave', () => badge.classList.remove('visible'));
