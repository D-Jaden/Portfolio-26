// ── CURSOR BADGE ──
const badge = document.getElementById('cursor-badge');
document.addEventListener('mousemove', e => {
  badge.style.left = e.clientX + 'px';
  badge.style.top  = e.clientY + 'px';
  badge.textContent = `X:${String(Math.round(e.clientX)).padStart(4,'0')} Y:${String(Math.round(e.clientY)).padStart(4,'0')}`;
  badge.classList.add('visible');
});
document.addEventListener('mouseleave', () => badge.classList.remove('visible'));

// ── RULER & GRID ──
const COL_COUNT = 14;
const LEFT_PAD  = 28;
const RIGHT_PAD = 28;

function buildRuler() {
  const row = document.getElementById('ruler-row');
  const W   = row.offsetWidth;
  const usable = W - LEFT_PAD - RIGHT_PAD;
  const colW   = usable / COL_COUNT;

  const l = (mm, x) => {
    const span = document.createElement('span');
    span.textContent = mm === 0 ? '0MM' : mm + 'MM';
    span.style.cssText = `
      position:absolute; bottom:4px; left:${x}px;
      font-family:Helvetica,Arial,sans-serif;
      font-size:8px; letter-spacing:.06em;
      color:#1212B0; opacity:.55;
      transform:translateX(${mm===0?'0':'-50%'});
      white-space:nowrap;
    `;
    row.appendChild(span);
  };

  const scl = document.createElement('span');
  scl.textContent = 'SCALE 1:1.00';
  scl.style.cssText = `position:absolute;bottom:4px;right:${RIGHT_PAD}px;font-family:Helvetica,Arial,sans-serif;font-size:8px;letter-spacing:.1em;color:#1212B0;opacity:.5;`;
  row.appendChild(scl);

  for (let i = 0; i <= COL_COUNT; i++) {
    const x  = LEFT_PAD + i * colW;
    const mm = i * 100;
    const tick = document.createElement('div');
    tick.style.cssText = `position:absolute;bottom:0;left:${x}px;width:1px;height:12px;background:rgba(18,18,176,0.32);`;
    row.appendChild(tick);
    if (i < COL_COUNT) l(mm, x);
    for (let j = 1; j < 10; j++) {
      const mx = x + j * (colW / 10);
      const mt = document.createElement('div');
      const h  = j === 5 ? 7 : 4;
      mt.style.cssText = `position:absolute;bottom:0;left:${mx}px;width:1px;height:${h}px;background:rgba(18,18,176,${j===5?0.24:0.14});`;
      row.appendChild(mt);
    }
  }
  return { W, usable, colW };
}

function buildGrid(dims) {
  const { W, usable, colW } = dims;
  const canvas = document.getElementById('grid-canvas');
  const hero   = document.getElementById('hero-open');
  const H      = hero.offsetHeight;
  const DPR    = window.devicePixelRatio || 1;
  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);
  const x0 = LEFT_PAD;
  const x1 = LEFT_PAD + usable;
  const cellW = colW / 10;
  const cellH = cellW;

  ctx.strokeStyle = 'rgba(18,18,176,0.10)';
  ctx.lineWidth   = 0.5;
  for (let x = x0; x <= x1 + 0.5; x += cellW) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += cellH) {
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(18,18,176,0.20)';
  ctx.lineWidth   = 0.75;
  for (let i = 0; i <= COL_COUNT; i++) {
    const x = x0 + i * colW;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += colW) {
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(18,18,176,0.09)';
  ctx.lineWidth   = 0.7;
  const diags = [[x0, 0, x0 + usable*0.37, H], [x0, 0, x0 + usable*0.43, H]];
  diags.forEach(([ax,ay,bx,by]) => {
    ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
  });
  const vx = x0 + usable * 0.685;
  ctx.beginPath(); ctx.moveTo(vx, 0); ctx.lineTo(vx, H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(vx, 0); ctx.lineTo(x1, H); ctx.stroke();

  const lbl = document.getElementById('fl-tl');
  lbl.style.left    = LEFT_PAD + 'px';
  lbl.style.display = 'block';
}

// ── STICKY NOTE DRAG + DOUBLE-CLICK ACTION ──
function initStickyDrag() {
  const stickyEls = document.querySelectorAll('.sticky');

  stickyEls.forEach((el, i) => {
    const tilt = i === 0 ? -3 : 2.5;
    el.style.transform = `rotate(${tilt}deg)`;

    let dragged = false;
    let startX, startY, origLeft, origTop;

    el.addEventListener('mousedown', e => {
      e.preventDefault();
      dragged = false;
      const rect = el.getBoundingClientRect();
      startX = e.clientX; startY = e.clientY;
      origLeft = rect.left; origTop = rect.top;

      el.style.position = 'fixed';
      el.style.left   = origLeft + 'px';
      el.style.top    = origTop  + 'px';
      el.style.margin = '0';
      el.style.zIndex = '999';

      const onMove = ev => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragged = true;

        el.style.left      = (origLeft + dx) + 'px';
        el.style.top       = (origTop  + dy) + 'px';
        el.style.transform = 'rotate(0deg) scale(1.04)';
        el.style.filter    = 'drop-shadow(4px 8px 18px rgba(18,18,176,0.28))';
      };

      const onUp = () => {
        el.style.filter    = 'drop-shadow(2px 4px 8px rgba(18,18,176,0.18))';
        el.style.transform = `rotate(${tilt}deg)`;
        el.style.zIndex    = '20';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    });

    el.addEventListener('dblclick', () => {
      if (el.id === 'sticky-resume') {
        window.open('https://github.com/D-Jaden', '_blank');
      } else {
        window.location.href = '../contact/contact.html';
      }
    });
  });
}

// ── ABOUT ME PEGBOARD DRAG ──
function initPegboardDrag() {
  const dragEls = document.querySelectorAll('.drag-item');
  const pegboard = document.getElementById('pegboard');
  if (!pegboard) return;

  dragEls.forEach(el => {
    let dragged = false;
    let startX, startY, origLeft, origTop;

    el.addEventListener('mousedown', e => {
      e.preventDefault();
      dragged = false;
      const rect = el.getBoundingClientRect();
      const parentRect = pegboard.getBoundingClientRect();
      
      startX = e.clientX; startY = e.clientY;
      origLeft = el.offsetLeft;
      origTop = el.offsetTop;

      el.style.zIndex = '999';

      const onMove = ev => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragged = true;

        el.style.left      = (origLeft + dx) + 'px';
        el.style.top       = (origTop  + dy) + 'px';
        el.style.transform = 'scale(1.03)';
        el.style.filter    = 'drop-shadow(0 25px 35px rgba(0,0,0,0.25))';
      };

      const onUp = () => {
        el.style.filter    = 'drop-shadow(0 15px 25px rgba(0,0,0,0.15))';
        el.style.transform = 'scale(1)';
        el.style.zIndex    = '10';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    });
  });
}

// ── EXPERIENCE BILLBOARD ──

// ── EXPERIENCE BILLBOARD ──
function initExperienceBillboard() {
  const STOPS = 4;
  let activeStop = 0;

  const busFigure = document.getElementById('busFigure');
  const routeProgress = document.getElementById('routeProgress');
  const stations = document.querySelectorAll('.station');
  const boardContents = document.querySelectorAll('.board-content');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const comicBubble = document.getElementById('comicBubble');
  const highwaySection = document.getElementById('highwaySection');

  if (!stations.length) return;

  function playTuTuDuDu() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playNote = (freq, time, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);
        
        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + dur);
      };

      playNote(349.23, 0, 0.15);   // F4
      playNote(349.23, 0.15, 0.15); // F4
      playNote(440.00, 0.3, 0.15); // A4
      playNote(293.66, 0.45, 0.3); // D4
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }

  function goToStop(index) {
    if (index < 0 || index >= STOPS) return;
    
    if (index > activeStop) {
      playTuTuDuDu();
    }
    
    activeStop = index;
    
    if (prevBtn) prevBtn.disabled = activeStop === 0;
    if (nextBtn) nextBtn.disabled = activeStop === STOPS - 1;
    
    if (comicBubble) {
      if (activeStop === STOPS - 1) {
        setTimeout(() => {
          if (activeStop === STOPS - 1) comicBubble.classList.add('show');
        }, 800);
      } else {
        comicBubble.classList.remove('show');
      }
    }

    stations.forEach((st, i) => {
      st.classList.toggle('is-active', i <= activeStop);
    });
    
    const progressPercent = (activeStop / (STOPS - 1)) * 100;
    if (routeProgress) routeProgress.style.width = `${progressPercent}%`;

    boardContents.forEach((content, i) => {
      content.classList.toggle('is-active', i === activeStop);
    });

    if (busFigure) {
      const startLeft = 10;
      const endLeft = 60;
      const targetLeft = startLeft + (activeStop / (STOPS - 1)) * (endLeft - startLeft);
      
      if (window.anime) {
        window.anime({
          targets: busFigure,
          left: `${targetLeft}%`,
          duration: 1200,
          easing: 'easeOutQuart'
        });
      } else {
        busFigure.style.left = `${targetLeft}%`;
      }
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goToStop(activeStop - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToStop(activeStop + 1));

  stations.forEach((st, i) => {
    st.addEventListener('click', () => goToStop(i));
  });

  window.addEventListener('keydown', (e) => {
    if (!highwaySection) return;
    const rect = highwaySection.getBoundingClientRect();
    if (rect.top > window.innerHeight / 2 || rect.bottom < 0) return;
    
    if (e.key === 'ArrowRight') {
      goToStop(activeStop + 1);
    } else if (e.key === 'ArrowLeft') {
      goToStop(activeStop - 1);
    }
  });

  goToStop(0);
}

// ── SCROLL-TRIGGERED DOOR REVEAL ──
function initScrollTriggeredDoors() {
  const lightsSection = document.getElementById('lightsSection');
  const lights = document.querySelectorAll('#rig .light');
  const doorLeft = document.getElementById('doorLeft');
  const doorRight = document.getElementById('doorRight');
  const wordmarkEl = document.getElementById('wordmarkEl');
  const sceneBg = document.querySelector('.scene-bg');
  const mapContainer = document.getElementById('mapContainer');
  const mapRoute = document.getElementById('mapRoute');

  if (!lightsSection) return;

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

  let dashoffsetStart = 0;
  if (mapRoute && typeof mapRoute.getTotalLength === 'function') {
    dashoffsetStart = mapRoute.getTotalLength();
    mapRoute.style.strokeDasharray = dashoffsetStart;
    mapRoute.style.strokeDashoffset = dashoffsetStart;
  }

  function updateScroll(p) {
    // 1. Lights sequence: 0.0 to 0.35
    const lightsStep = 0.35 / 5;
    lights.forEach((el, i) => {
      const onAt = i * lightsStep;
      const greenAt = onAt + lightsStep * 0.55;
      if (p >= greenAt) {
        el.classList.add('is-green');
        el.classList.remove('is-red-hot');
      } else if (p >= onAt) {
        el.classList.add('is-red-hot');
        el.classList.remove('is-green');
      } else {
        el.classList.remove('is-green', 'is-red-hot');
      }
    });

    // 2. Wordmark fades out: 0.35 to 0.45
    const fadeP = clamp((p - 0.35) / 0.1);
    if (wordmarkEl) {
      wordmarkEl.style.opacity = 1 - fadeP;
      wordmarkEl.style.transform = `translateY(${fadeP * -18}px)`;
    }

    // 3. Doors open & Bus image reveals: 0.45 to 0.75
    const doorP = clamp((p - 0.45) / 0.3);
    const easedDoor = doorP * doorP * (3 - 2 * doorP); // smoothstep
    if (doorLeft) doorLeft.style.transform = `translateX(${-easedDoor * 150}%)`;
    if (doorRight) doorRight.style.transform = `translateX(${easedDoor * 150}%)`;
    if (sceneBg) sceneBg.style.opacity = easedDoor;

    // 4. Map line draw & reveal: 0.75 to 1.0
    const mapP = clamp((p - 0.75) / 0.25);
    if (mapContainer) mapContainer.style.opacity = mapP > 0 ? 1 : 0;
    if (mapRoute && dashoffsetStart) {
      mapRoute.style.strokeDashoffset = dashoffsetStart * (1 - mapP);
    }
  }

  if (window.anime && typeof window.anime === 'object' && window.anime.onScroll) {
    const { onScroll } = window.anime;
    onScroll({
      target: '#lightsSection',
      enter: 'top top',
      leave: 'bottom bottom',
      sync: true,
      onUpdate: (self) => {
        updateScroll(self.progress);
      }
    });
  } else {
    window.addEventListener('scroll', () => {
      const rect = lightsSection.getBoundingClientRect();
      const totalH = rect.height - window.innerHeight;
      if (totalH <= 0) return;
      const scrolled = -rect.top;
      const p = clamp(scrolled / totalH);
      updateScroll(p);
    });
  }
}

window.addEventListener('load', () => {
  const sweepOut = document.getElementById('page-sweep-out');
  if (sweepOut) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        sweepOut.classList.add('active');
      });
    });
  }
  
  const dims = buildRuler();
  buildGrid(dims);
  initStickyDrag();
  initPegboardDrag();
  initExperienceBillboard();
  initScrollTriggeredDoors();
});

window.addEventListener('resize', () => {
  document.getElementById('ruler-row').innerHTML = '';
  const dims = buildRuler();
  buildGrid(dims);
});
