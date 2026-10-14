// ── GREENSOCK WbbEGmp FLAIR CURSOR FOLLOWER ──
const badge = document.getElementById('cursor-badge');
const heroOpenArea = document.getElementById('hero-open');

if (badge) {
  // GSAP quickTo for silky cursor follower tracking
  let xTo, yTo;
  function initBadgeQuickTo() {
    if (window.gsap) {
      xTo = gsap.quickTo(badge, "left", { duration: 0.22, ease: "power2.out" });
      yTo = gsap.quickTo(badge, "top",  { duration: 0.22, ease: "power2.out" });
    }
  }
  initBadgeQuickTo();

  let lastFlairX = 0;
  let lastFlairY = 0;
  const flairGap = 65; // Distance threshold to spawn next flair

  const flairIcons = [
    { type: 'crosshair', html: '<span class="flair-crosshair">+</span>' },
    { type: 'star', html: '<span class="flair-star">✦</span>' },
    { type: 'tag', html: '<span class="flair-yellow">JDS_REF</span>' },
    { type: 'badge', html: '<span class="flair-badge">[10MM]</span>' },
    { type: 'red', html: '<span class="flair-red">PRECISION</span>' },
    { type: 'crosshair', html: '<span class="flair-crosshair">✛</span>' },
    { type: 'star', html: '<span class="flair-star">★</span>' }
  ];
  let flairIndex = 0;

  function spawnHeroFlair(x, y) {
    if (!heroOpenArea) return;
    const heroRect = heroOpenArea.getBoundingClientRect();
    // Only spawn inside the first image hero blueprint area
    if (x < heroRect.left || x > heroRect.right || y < heroRect.top || y > heroRect.bottom) return;

    const flair = document.createElement('div');
    flair.className = 'hero-flair';
    flair.innerHTML = flairIcons[flairIndex % flairIcons.length].html;
    flairIndex++;
    flair.style.left = x + 'px';
    flair.style.top = y + 'px';
    document.body.appendChild(flair);

    if (window.gsap) {
      const rot = gsap.utils.random(-180, 180);
      const exitY = gsap.utils.random(40, 80);
      const exitX = gsap.utils.random(-25, 25);
      const exitRot = gsap.utils.random(-45, 45);

      const tl = gsap.timeline({
        onComplete: () => flair.remove()
      });
      tl.fromTo(flair, 
        { scale: 0, opacity: 0, rotation: rot },
        { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)" }
      )
      .to(flair, {
        y: `+=${exitY}`,
        x: `+=${exitX}`,
        rotation: `+=${exitRot}`,
        opacity: 0,
        scale: 0.35,
        duration: 0.65,
        ease: "power2.in"
      }, "+=0.12");
    } else {
      setTimeout(() => flair.remove(), 700);
    }
  }

  document.addEventListener('mousemove', e => {
    if (!xTo && window.gsap) initBadgeQuickTo();
    if (xTo && yTo) {
      xTo(e.clientX);
      yTo(e.clientY);
    } else {
      badge.style.left = e.clientX + 'px';
      badge.style.top  = e.clientY + 'px';
    }
    badge.textContent = `X:${String(Math.round(e.clientX)).padStart(4,'0')} Y:${String(Math.round(e.clientY)).padStart(4,'0')}`;
    badge.classList.add('visible');

    // Calculate distance traveled for flair spawning
    const dist = Math.hypot(e.clientX - lastFlairX, e.clientY - lastFlairY);
    if (dist > flairGap) {
      spawnHeroFlair(e.clientX, e.clientY);
      lastFlairX = e.clientX;
      lastFlairY = e.clientY;
    }
  });

  document.addEventListener('mouseleave', () => badge.classList.remove('visible'));
}

// ── RULER & GRID ──
let COL_COUNT = 14;
let LEFT_PAD  = 28;
let RIGHT_PAD = 28;

function buildRuler() {
  const row = document.getElementById('ruler-row');
  if (!row) return { W: 0, usable: 0, colW: 0, leftPad: 28, rightPad: 28, colCount: 14 };
  const W   = row.offsetWidth;
  const isMobile = W <= 768;
  const isSmallMobile = W <= 480;
  COL_COUNT = isMobile ? (isSmallMobile ? 6 : 8) : 14;
  LEFT_PAD  = isMobile ? 16 : 28;
  RIGHT_PAD = isMobile ? 16 : 28;

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

  const numMinorTicks = isMobile ? (isSmallMobile ? 4 : 5) : 10;
  for (let i = 0; i <= COL_COUNT; i++) {
    const x  = LEFT_PAD + i * colW;
    const mm = i * 100;
    const tick = document.createElement('div');
    tick.style.cssText = `position:absolute;bottom:0;left:${x}px;width:1px;height:12px;background:rgba(18,18,176,0.32);`;
    row.appendChild(tick);
    if (i < COL_COUNT) l(mm, x);
    for (let j = 1; j < numMinorTicks; j++) {
      const mx = x + j * (colW / numMinorTicks);
      const mt = document.createElement('div');
      const h  = (j === Math.floor(numMinorTicks / 2)) ? 7 : 4;
      mt.style.cssText = `position:absolute;bottom:0;left:${mx}px;width:1px;height:${h}px;background:rgba(18,18,176,${j===Math.floor(numMinorTicks/2)?0.24:0.14});`;
      row.appendChild(mt);
    }
  }
  return { W, usable, colW, leftPad: LEFT_PAD, rightPad: RIGHT_PAD, colCount: COL_COUNT };
}

function buildGrid(dims) {
  const { W, usable, colW, leftPad, colCount } = dims;
  const canvas = document.getElementById('grid-canvas');
  const hero   = document.getElementById('hero-open');
  if (!canvas || !hero) return;
  const H      = hero.offsetHeight;
  const DPR    = window.devicePixelRatio || 1;
  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);
  const x0 = leftPad !== undefined ? leftPad : LEFT_PAD;
  const x1 = x0 + usable;
  const count = colCount !== undefined ? colCount : COL_COUNT;
  const cellW = colW / (W <= 768 ? 5 : 10);
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
  for (let i = 0; i <= count; i++) {
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
  if (lbl) {
    lbl.style.left    = x0 + 'px';
    lbl.style.display = 'block';
  }
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

    // Mobile touch drag & tap support
    el.addEventListener('touchstart', e => {
      if (e.touches && e.touches.length > 0) {
        dragged = false;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        origLeft = el.offsetLeft;
        origTop = el.offsetTop;
      }
    }, { passive: true });

    el.addEventListener('touchmove', e => {
      if (e.touches && e.touches.length > 0) {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) dragged = true;
        if (dragged) {
          el.style.left = (origLeft + dx) + 'px';
          el.style.top = (origTop + dy) + 'px';
        }
      }
    }, { passive: true });

    el.addEventListener('touchend', () => {
      if (!dragged) {
        if (el.id === 'sticky-resume') {
          window.open('CV.pdf', '_blank');
        } else if (el.id === 'sticky-contact') {
          const contactSec = document.getElementById('contactSection');
          if (contactSec) {
            contactSec.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.location.href = '../contact/contact.html';
          }
        }
      }
    });

    el.addEventListener('click', () => {
      if (el.id === 'sticky-resume') {
        window.open('CV.pdf', '_blank');
      } else if (el.id === 'sticky-contact') {
        const contactSec = document.getElementById('contactSection');
        if (contactSec) {
          contactSec.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = '../contact/contact.html';
        }
      }
    });

    el.addEventListener('dblclick', () => {
      if (el.id === 'sticky-resume') {
        window.open('CV.pdf', '_blank');
      } else {
        const contactSec = document.getElementById('contactSection');
        if (contactSec) {
          contactSec.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = '../contact/contact.html';
        }
      }
    });
  });

  const resumeNavBtn = document.getElementById('resume-nav-link');
  if (resumeNavBtn) {
    resumeNavBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.open('CV.pdf', '_blank');
    });
  }
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
      comicBubble.textContent = "BOX BOX!";
      if (activeStop === STOPS - 1) {
        comicBubble.style.cursor = "pointer";
        setTimeout(() => {
          if (activeStop === STOPS - 1) comicBubble.classList.add('show');
        }, 600);
      } else {
        comicBubble.style.cursor = "default";
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
      const isMobile = window.innerWidth <= 768;
      const startLeft = isMobile ? 1 : 10;
      const endLeft = isMobile ? 40 : 60;
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

  if (comicBubble) {
    comicBubble.addEventListener('click', () => {
      if (window.triggerShapeOverlays) {
        window.triggerShapeOverlays(() => {
          const aboutSection = document.getElementById('aboutSection');
          if (aboutSection) aboutSection.scrollIntoView({ behavior: 'smooth' });
        });
      } else {
        const aboutSection = document.getElementById('aboutSection');
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
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
    // 1. Doors ("ENTER BOS SMIT") open from 0.0 to 0.38, sliding smoothly left and right to reveal Lights out at Shillong
    const doorP = clamp(p / 0.38);
    const easedDoor = doorP * doorP * (3 - 2 * doorP); // smoothstep
    if (doorLeft) doorLeft.style.transform = `translateX(${-easedDoor * 160}%)`;
    if (doorRight) doorRight.style.transform = `translateX(${easedDoor * 160}%)`;
    if (sceneBg) sceneBg.style.opacity = easedDoor;

    // 2. Lights sequence inside: 0.15 to 0.65 (lights light up red sequentially, then turn green)
    const lightsStart = 0.15;
    const lightsSpan = 0.50;
    const lightsStep = lightsSpan / 5;
    lights.forEach((el, i) => {
      const onAt = lightsStart + i * lightsStep;
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

    // 3. Wordmark stays fully visible as doors open, then fades out as lights complete: 0.60 to 0.75
    const fadeP = clamp((p - 0.60) / 0.15);
    if (wordmarkEl) {
      wordmarkEl.style.opacity = 1 - fadeP;
      wordmarkEl.style.transform = `translateY(${fadeP * -18}px)`;
    }

    // 4. Map line draw & reveal: 0.70 to 1.0 leading into Highway section
    const mapP = clamp((p - 0.70) / 0.30);
    if (mapContainer) mapContainer.style.opacity = mapP > 0 ? clamp(mapP * 1.5) : 0;
    if (mapRoute && dashoffsetStart) {
      mapRoute.style.strokeDashoffset = dashoffsetStart * (1 - mapP);
    }
  }

  const lightsPin = lightsSection ? lightsSection.querySelector('.lights-pin') : null;

  if (window.ScrollTrigger && lightsPin) {
    ScrollTrigger.create({
      trigger: lightsSection,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        updateScroll(self.progress);
      }
    });
  } else if (window.anime && typeof window.anime === 'object' && window.anime.onScroll) {
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

// ── THREE.JS 3D WEBGL STUDIO DESK ENVIRONMENT (ORYZO.AI SCENE + ALL 6 3D FIGURINES) ──
let aboutScene, aboutCamera, aboutRenderer;
let mouseX = 0, mouseY = 0;
let interactiveFigurines = [];
let selectedFigurine = null;
let dragPlane, raycaster, mouseVec;
let isDraggingFigurine = false;
let dragVelocity = new THREE.Vector3();

function createProceduralPegboardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Pure Brilliant Studio White Base with subtle powder-coat micro-texture
  ctx.fillStyle = '#fafbfc';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle powder-coat eggshell stipple
  ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
  for (let i = 0; i < 4000; i++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 1024;
    ctx.fillRect(rx, ry, 1.5, 1.5);
  }

  // Helper for rounded pill slots
  function drawSlotCapsule(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Authentic IKEA Skådis Staggered Capsule Slots
  const colSpacing = 64;
  const rowSpacing = 64;
  const slotW = 10;
  const slotH = 28;
  const cornerR = 5;

  for (let x = 32; x < 1024; x += colSpacing) {
    const isOddCol = Math.floor(x / colSpacing) % 2 === 1;
    const yStart = isOddCol ? 32 : 0;

    for (let y = yStart; y < 1024; y += rowSpacing) {
      // 1. Soft top ambient drop shadow rim
      ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
      drawSlotCapsule(x - slotW / 2 - 1, y - slotH / 2 - 1, slotW + 2, slotH + 2, cornerR + 1);
      ctx.fill();

      // 2. Interior slot cavity (deep studio slate depth)
      ctx.fillStyle = '#1e242d';
      drawSlotCapsule(x - slotW / 2, y - slotH / 2, slotW, slotH, cornerR);
      ctx.fill();

      // 3. Crisp bright white lower bevel rim catching studio sunlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y + slotH / 2 - cornerR, cornerR - 0.4, 0, Math.PI);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 8);
  return texture;
}

function createProceduralWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Deep Rich Walnut / Smoked Oak Base
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  bgGrad.addColorStop(0, '#53351f');
  bgGrad.addColorStop(0.3, '#664227');
  bgGrad.addColorStop(0.6, '#573720');
  bgGrad.addColorStop(1, '#442a17');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Soft organic wood growth rings & grain waves
  ctx.lineWidth = 2.5;
  for (let y = 0; y < 1024; y += 8) {
    const wave = Math.sin(y * 0.02) * 12 + Math.cos(y * 0.04) * 6;
    ctx.strokeStyle = y % 24 === 0 ? 'rgba(28, 14, 6, 0.45)' : 'rgba(38, 19, 9, 0.32)';
    ctx.beginPath();
    ctx.moveTo(0, y + wave);
    ctx.bezierCurveTo(340, y + wave + 18, 680, y + wave - 12, 1024, y + Math.sin(y * 0.03) * 10);
    ctx.stroke();
  }

  // Warm subtle highlight streaks (satin varnish sheen)
  ctx.lineWidth = 1.8;
  for (let y = 6; y < 1024; y += 18) {
    ctx.strokeStyle = 'rgba(180, 125, 80, 0.22)';
    ctx.beginPath();
    ctx.moveTo(0, y + Math.cos(y * 0.025) * 8);
    ctx.lineTo(1024, y + Math.sin(y * 0.035) * 8);
    ctx.stroke();
  }

  // Fine wood pores
  ctx.fillStyle = 'rgba(20, 10, 4, 0.35)';
  for (let i = 0; i < 3000; i++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 1024;
    ctx.fillRect(px, py, 2.5, 0.8);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 1.5);
  return texture;
}

function createProceduralCuttingMatTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');

  // Darker Forest Green Cutting Mat Base
  ctx.fillStyle = '#052e18';
  ctx.fillRect(0, 0, 1024, 700);

  // Outer Border Rim
  ctx.fillStyle = '#021a0d';
  ctx.fillRect(0, 0, 1024, 24);
  ctx.fillRect(0, 676, 1024, 24);
  ctx.fillRect(0, 0, 24, 700);
  ctx.fillRect(1000, 0, 24, 700);

  // Fine Metric Grid Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 1;

  for (let x = 24; x <= 1000; x += 24) {
    ctx.beginPath(); ctx.moveTo(x, 24); ctx.lineTo(x, 676); ctx.stroke();
  }
  for (let y = 24; y <= 676; y += 24) {
    ctx.beginPath(); ctx.moveTo(24, y); ctx.lineTo(1000, y); ctx.stroke();
  }

  // Major 5-Grid Highlight Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 2;
  for (let x = 24; x <= 1000; x += 120) {
    ctx.beginPath(); ctx.moveTo(x, 24); ctx.lineTo(x, 676); ctx.stroke();
  }
  for (let y = 24; y <= 676; y += 120) {
    ctx.beginPath(); ctx.moveTo(24, y); ctx.lineTo(1000, y); ctx.stroke();
  }

  // 15°, 30°, 45°, 60°, 75° Angle Guide Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5;
  [15, 30, 45, 60, 75].forEach(deg => {
    const rad = deg * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(24, 676);
    ctx.lineTo(24 + 650 * Math.cos(rad), 676 - 650 * Math.sin(rad));
    ctx.stroke();
  });

  // Metric Rule Numbers
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  for (let i = 1; i <= 40; i++) {
    ctx.fillText(String(i), 24 + i * 24, 18);
  }

  // Elan Branding Logo Text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = 'bold 16px "Share Tech Mono", monospace, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Elan Arts & Crafts  A3 Size - 30 x 44 cm', 40, 55);
  ctx.font = '10px monospace';
  ctx.fillText('Self-Healing Cutting Mat', 40, 72);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  // Asynchronously overlay cutting_mat.png if available with dark green multiplier
  const imgPath = typeof window !== 'undefined' && window.location.pathname.includes('/hero/') ? 'assets/cutting_mat.png' : 'hero/assets/cutting_mat.png';
  const img = new Image();
  img.src = imgPath;
  img.onload = () => {
    ctx.drawImage(img, 0, 0, 1024, 700);
    // Dark forest green glaze overlay to ensure authentic darker shade
    ctx.fillStyle = 'rgba(4, 30, 16, 0.42)';
    ctx.fillRect(0, 0, 1024, 700);
    texture.needsUpdate = true;
  };

  return texture;
}

function createDedicatedGreenBoardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 680;
  const ctx = canvas.getContext('2d');

  // Vibrant Studio Emerald Green Slate Surface
  ctx.fillStyle = '#0b6638';
  ctx.fillRect(0, 0, 1024, 680);

  // Outer Framed Border Rim
  ctx.fillStyle = '#074827';
  ctx.fillRect(0, 0, 1024, 18);
  ctx.fillRect(0, 662, 1024, 18);
  ctx.fillRect(0, 0, 18, 680);
  ctx.fillRect(1006, 0, 18, 680);

  // Crisp White Cutting Mat Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5;

  for (let x = 18; x <= 1006; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 18); ctx.lineTo(x, 662); ctx.stroke();
  }
  for (let y = 18; y <= 662; y += 40) {
    ctx.beginPath(); ctx.moveTo(18, y); ctx.lineTo(1006, y); ctx.stroke();
  }

  // Corner Accents & Border Inner Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(22, 22, 980, 636);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ── PROCEDURAL COFFEE CUP TEXTURE WITH HANDWRITTEN BLACK MARKER NAME 'JADEN' (NO EMOJI) ──
function createProceduralCoffeeCupTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Pure White Ceramic Base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 512);

  // Dark Espresso Kraft Paper Sleeve in Middle
  ctx.fillStyle = '#3d2314';
  ctx.fillRect(0, 160, 512, 190);
  ctx.fillStyle = '#24130a';
  ctx.fillRect(0, 160, 512, 6); // sleeve top border
  ctx.fillRect(0, 344, 512, 6); // sleeve bottom border

  // Black Sharpie Marker Handwritten Name "Jaden" (NO EMOJI)
  ctx.fillStyle = '#111111';
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.font = 'italic bold 72px "Caveat", "Comic Sans MS", "Brush Script MT", cursive, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Handwritten sharpie tilt & stroke (NO EMOJI)
  ctx.save();
  ctx.translate(256, 255);
  ctx.rotate(-0.08); // -4.5 degree hand tilt
  ctx.fillText('Jaden', 0, 0);

  // Sharpie marker underline swirl
  ctx.beginPath();
  ctx.moveTo(-90, 42);
  ctx.quadraticCurveTo(0, 56, 90, 44);
  ctx.stroke();
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ── HIGH-DEFINITION CONTOURED 3D MESH SCULPTURES (NO RECTANGULAR CARDS / SLABS, NOT BLOCKY) ──

function createContoured3DMeshFromAsset(base64Data, targetWidth, depth, sideColor, callback) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const sampleW = 220;
    const aspect = img.height / img.width;
    const sampleH = Math.floor(sampleW * aspect);
    canvas.width = sampleW;
    canvas.height = sampleH;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, sampleW, sampleH);
    const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
    const data = imgData.data;

    let minX = sampleW, maxX = 0, minY = sampleH, maxY = 0;
    for (let y = 0; y < sampleH; y++) {
      for (let x = 0; x < sampleW; x++) {
        const alpha = data[(y * sampleW + x) * 4 + 3];
        if (alpha > 25) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const bboxW = (maxX - minX) || 1;
    const bboxH = (maxY - minY) || 1;
    const targetHeight = targetWidth * (bboxH / bboxW);

    const contourPoints = [];
    const stepY = 2;

    for (let y = minY; y <= maxY; y += stepY) {
      for (let x = minX; x <= maxX; x++) {
        if (data[(y * sampleW + x) * 4 + 3] > 35) {
          const normX = ((x - minX) / bboxW - 0.5) * targetWidth;
          const normY = (0.5 - (y - minY) / bboxH) * targetHeight;
          contourPoints.push({ x: normX, y: normY });
          break;
        }
      }
    }

    for (let y = maxY; y >= minY; y -= stepY) {
      for (let x = maxX; x >= minX; x--) {
        if (data[(y * sampleW + x) * 4 + 3] > 35) {
          const normX = ((x - minX) / bboxW - 0.5) * targetWidth;
          const normY = (0.5 - (y - minY) / bboxH) * targetHeight;
          contourPoints.push({ x: normX, y: normY });
          break;
        }
      }
    }

    if (contourPoints.length < 6) {
      const hw = targetWidth / 2;
      const hh = targetHeight / 2;
      contourPoints.length = 0;
      contourPoints.push({ x: -hw, y: -hh }, { x: hw, y: -hh }, { x: hw, y: hh }, { x: -hw, y: hh });
    }

    const shape = new THREE.Shape();
    shape.moveTo(contourPoints[0].x, contourPoints[0].y);
    for (let i = 1; i < contourPoints.length; i++) {
      shape.lineTo(contourPoints[i].x, contourPoints[i].y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: depth,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 1.6,
      bevelThickness: 1.6
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    geometry.computeBoundingBox();
    const bb = geometry.boundingBox;
    const bw = bb.max.x - bb.min.x || 1;
    const bh = bb.max.y - bb.min.y || 1;

    geometry.translate(0, -bb.min.y, -depth / 2);

    const uvAttr = geometry.attributes.uv;
    const posAttr = geometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const px = posAttr.getX(i);
      const py = posAttr.getY(i) + bb.min.y;
      const u = (px - bb.min.x) / bw;
      const v = (py - bb.min.y) / bh;
      uvAttr.setXY(i, Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v)));
    }
    uvAttr.needsUpdate = true;

    const texture = new THREE.CanvasTexture(img);
    texture.colorSpace = THREE.SRGBColorSpace;

    const frontMat = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1,
      roughness: 0.3,
      metalness: 0.1
    });

    const sideMat = new THREE.MeshStandardMaterial({
      color: sideColor || 0x1c1e22,
      roughness: 0.35,
      metalness: 0.3
    });

    mesh.receiveShadow = true;

    if (callback) callback(mesh);
  };
  img.src = base64Data;
}

// ── HIGH-QUALITY MINIMALIST WHITE & BLUE MECHANICAL KEYBOARD (NO GLOW, ALL-WHITE BASE) ──
function createHighQuality3DKeyboard() {
  const group = new THREE.Group();

  // 1. Sleek Pure White Anodized Aluminum Case (NO GLOW, ALL WHITE BASE)
  const caseGeo = new THREE.BoxGeometry(370, 145, 26);
  const caseMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.25
  });
  const caseMesh = new THREE.Mesh(caseGeo, caseMat);
  caseMesh.castShadow = true;
  caseMesh.receiveShadow = true;
  group.add(caseMesh);

  // Pure White Inner Switch Plate
  const plateGeo = new THREE.BoxGeometry(348, 124, 6);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5f5,
    roughness: 0.3,
    metalness: 0.05
  });
  const plateMesh = new THREE.Mesh(plateGeo, plateMat);
  plateMesh.position.set(0, 0, 10);
  group.add(plateMesh);

  // Royal Blue Accent Weight Bar along top
  const weightGeo = new THREE.BoxGeometry(310, 8, 4);
  const weightMat = new THREE.MeshStandardMaterial({
    color: 0x1212b0,
    metalness: 0.7,
    roughness: 0.2
  });
  const weightMesh = new THREE.Mesh(weightGeo, weightMat);
  weightMesh.position.set(0, 64, 13);
  group.add(weightMesh);

  // 2. Keycap Materials & Dark Outline Base Socket Material
  const keyMatWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  const keyMatOffWhite = new THREE.MeshStandardMaterial({ color: 0xf0f2f8, roughness: 0.28 });
  const keyMatBlue = new THREE.MeshStandardMaterial({ color: 0x1212b0, roughness: 0.25, metalness: 0.1 });
  const darkOutlineMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5 }); // Black outline border
  const whiteGlyphMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Arrow symbols

  // 5 Precise Row Layouts with Complete 4-Key Arrow Cluster
  const rowLayouts = [
    // Row 0: Fn / Number Row (Y = +44)
    {
      y: 44,
      keys: [
        { w: 21, mat: keyMatBlue, name: 'esc' }, // Esc (Blue)
        { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite },
        { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite },
        { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite },
        { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite },
        { w: 34, mat: keyMatBlue, name: 'backspace' } // Backspace (Blue)
      ]
    },
    // Row 1: QWERTY Row (Y = +22)
    {
      y: 22,
      keys: [
        { w: 28, mat: keyMatOffWhite }, // Tab
        { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite },
        { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite },
        { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite },
        { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite },
        { w: 24, mat: keyMatOffWhite } // '\'
      ]
    },
    // Row 2: ASDF Row (Y = 0)
    {
      y: 0,
      keys: [
        { w: 34, mat: keyMatOffWhite }, // Caps Lock
        { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite },
        { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite },
        { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite },
        { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite },
        { w: 45, mat: keyMatBlue, name: 'enter' } // Enter (Blue)
      ]
    },
    // Row 3: ZXCV Row (Y = -22)
    {
      y: -22,
      keys: [
        { w: 55, mat: keyMatOffWhite }, // Shift Left
        { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite },
        { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite },
        { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite }, { w: 21, mat: keyMatWhite },
        { w: 21, mat: keyMatWhite },
        { w: 21, mat: keyMatBlue, name: 'arrow-up' }, // UP ARROW (Blue - directly over 2nd blue key)
        { w: 21, mat: keyMatOffWhite }               // Rightmost Key (Off-white - over 3rd blue key)
      ]
    },
    // Row 4: Bottom Row (Y = -44)
    {
      y: -44,
      keys: [
        { w: 25, mat: keyMatOffWhite }, // Ctrl
        { w: 23, mat: keyMatOffWhite }, // Win
        { w: 25, mat: keyMatOffWhite }, // Alt
        { w: 151.2, mat: keyMatBlue, name: 'space' }, // Spacebar (Blue)
        { w: 25, mat: keyMatOffWhite }, // Alt
        { w: 23, mat: keyMatOffWhite }, // Fn
        { w: 21, mat: keyMatBlue, name: 'arrow-left' },  // LEFT ARROW (1st blue key)
        { w: 21, mat: keyMatBlue, name: 'arrow-down' },  // DOWN ARROW (2nd blue key)
        { w: 21, mat: keyMatBlue, name: 'arrow-right' }  // RIGHT ARROW (3rd blue key)
      ]
    }
  ];

  rowLayouts.forEach(row => {
    let totalRowW = 0;
    row.keys.forEach(k => { totalRowW += k.w + 1.8; });
    totalRowW -= 1.8;

    let currentX = -totalRowW / 2;

    row.keys.forEach(k => {
      const kw = k.w;
      const mat = k.mat;
      const keyCenterX = currentX + kw / 2;

      // A. Dark/Black Outline Base Socket (creates sharp 1.5px black outline around each key)
      const socketGeo = new THREE.BoxGeometry(kw, 20.5, 14);
      const socketMesh = new THREE.Mesh(socketGeo, darkOutlineMat);
      socketMesh.position.set(keyCenterX, row.y, 14);
      group.add(socketMesh);

      // B. Main Keycap Body
      const keyGeo = new THREE.BoxGeometry(kw - 1.8, 18.8, 12);
      const keyMesh = new THREE.Mesh(keyGeo, mat);
      keyMesh.position.set(keyCenterX, row.y, 16);
      keyMesh.castShadow = true;
      group.add(keyMesh);

      // C. Top Sculpted Bevel Cap
      const topGeo = new THREE.BoxGeometry(kw - 3.8, 16.8, 3.5);
      const topMesh = new THREE.Mesh(topGeo, mat);
      topMesh.position.set(keyCenterX, row.y, 21.8);
      group.add(topMesh);

      currentX += kw + 1.8;
    });
  });

  // 3. Custom Blue USB-C Coiled Cable (Centered Top Exit)
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x1212b0, roughness: 0.35 });
  const cablePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 72, 10),
    new THREE.Vector3(12, 90, 0),
    new THREE.Vector3(-8, 105, -15),
    new THREE.Vector3(8, 120, -30),
    new THREE.Vector3(0, 135, -45)
  ]);
  const cableGeo = new THREE.TubeGeometry(cablePath, 32, 3.5, 12, false);
  const cableMesh = new THREE.Mesh(cableGeo, cableMat);
  group.add(cableMesh);

  return group;
}

// ── HIGH-QUALITY CHROME WALL PEG HOOK (ANCHORED TO PEGBOARD) ──
function create3DWallPegHook(sharedEnvMap) {
  const group = new THREE.Group();
  const envMap = sharedEnvMap || createStudioChromeEnvMap();

  const chromeHookMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.99,
    roughness: 0.04,
    envMap: envMap,
    envMapIntensity: 2.2
  });

  // Back mounting bracket that clicks into the pegboard capsule slot
  const bracketGeo = new THREE.BoxGeometry(18, 26, 8);
  const bracketMesh = new THREE.Mesh(bracketGeo, chromeHookMat);
  bracketMesh.position.set(0, 0, -4);
  bracketMesh.castShadow = true;
  group.add(bracketMesh);

  // Two rear peg prongs anchored into wall
  [-5, 5].forEach(x => {
    const prongGeo = new THREE.CylinderGeometry(2.2, 2.2, 16, 12);
    const prongMesh = new THREE.Mesh(prongGeo, chromeHookMat);
    prongMesh.rotation.x = Math.PI / 2;
    prongMesh.position.set(x, 0, -12);
    group.add(prongMesh);
  });

  // Cantilever hook arm projecting forward in +Z
  const armGeo = new THREE.CylinderGeometry(3.6, 3.6, 38, 16);
  const armMesh = new THREE.Mesh(armGeo, chromeHookMat);
  armMesh.rotation.x = Math.PI / 2;
  armMesh.position.set(0, 0, 15);
  armMesh.castShadow = true;
  group.add(armMesh);

  // Upward retention lip at tip
  const lipGeo = new THREE.CylinderGeometry(3.6, 3.6, 14, 16);
  const lipMesh = new THREE.Mesh(lipGeo, chromeHookMat);
  lipMesh.position.set(0, 6, 32);
  lipMesh.castShadow = true;
  group.add(lipMesh);

  // Smooth spherical chrome end cap
  const capGeo = new THREE.SphereGeometry(3.8, 16, 16);
  const capMesh = new THREE.Mesh(capGeo, chromeHookMat);
  capMesh.position.set(0, 13, 32);
  group.add(capMesh);

  return group;
}

// ── PROCEDURAL STUDIO SOFTBOX ENVIRONMENT MAP (FOR LIQUID MIRROR CHROME REFLECTIONS) ──
function createStudioChromeEnvMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Deep studio gradient background
  const bg = ctx.createLinearGradient(0, 0, 0, 256);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(0.35, '#334155');
  bg.addColorStop(0.7, '#1e293b');
  bg.addColorStop(1, '#020617');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 256);

  // Softbox 1: Overhead primary bright white diffuse light panel
  const softbox1 = ctx.createLinearGradient(0, 15, 0, 95);
  softbox1.addColorStop(0, 'rgba(255, 255, 255, 0)');
  softbox1.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
  softbox1.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = softbox1;
  ctx.fillRect(50, 15, 260, 80);

  // Softbox 2: Sharp kicker rim reflection strip
  const softbox2 = ctx.createLinearGradient(340, 0, 480, 0);
  softbox2.addColorStop(0, 'rgba(255, 255, 255, 0)');
  softbox2.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
  softbox2.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = softbox2;
  ctx.fillRect(340, 60, 140, 140);

  // Softbox 3: Warm golden key fill reflection strip matching room lighting
  const softbox3 = ctx.createRadialGradient(256, 170, 10, 256, 170, 110);
  softbox3.addColorStop(0, 'rgba(255, 250, 237, 0.9)');
  softbox3.addColorStop(1, 'rgba(255, 250, 237, 0)');
  ctx.fillStyle = softbox3;
  ctx.fillRect(160, 110, 200, 110);

  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  return tex;
}

// ── ULTRA-REALISTIC CHROMISH OVER-EAR STUDIO HEADPHONES (LUXURY ARCHITECTURE) ──
function create3DChromeHeadphones(sharedEnvMap) {
  const group = new THREE.Group();
  const studioEnvMap = sharedEnvMap || createStudioChromeEnvMap();

  // 1. High-Gloss Mirror Polish Liquid Chrome Material
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.99,
    roughness: 0.03,
    envMap: studioEnvMap,
    envMapIntensity: 2.8
  });

  // 2. Brushed Satin Chrome (Telescoping sliders & pivot hubs)
  const satinChromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.94,
    roughness: 0.16,
    envMap: studioEnvMap,
    envMapIntensity: 1.8
  });

  // 3. Smoked Dark Chrome Accents (crown dial, graduation lines)
  const darkChromeMat = new THREE.MeshStandardMaterial({
    color: 0x222a36,
    metalness: 0.92,
    roughness: 0.22,
    envMap: studioEnvMap,
    envMapIntensity: 2.0
  });

  // 4. Ultra-soft Acoustic Memory Foam Mesh (Cushions & canopy pad)
  const cushionMat = new THREE.MeshStandardMaterial({
    color: 0x161a20,
    metalness: 0.02,
    roughness: 0.88
  });

  // ── DUAL ARCH HEADBAND (Wider Twin Stainless Steel Spring Rails) ──
  [-3.8, 3.8].forEach((zOffset) => {
    const archCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-68, -26, zOffset),
      new THREE.Vector3(-64, 18, zOffset),
      new THREE.Vector3(-45, 52, zOffset),
      new THREE.Vector3(0, 64, zOffset),
      new THREE.Vector3(45, 52, zOffset),
      new THREE.Vector3(64, 18, zOffset),
      new THREE.Vector3(68, -26, zOffset)
    ]);
    const archGeo = new THREE.TubeGeometry(archCurve, 56, 2.6, 16, false);
    const archMesh = new THREE.Mesh(archGeo, chromeMat);
    archMesh.castShadow = true;
    archMesh.receiveShadow = true;
    group.add(archMesh);
  });

  // ── SUSPENDED BREATHABLE KNIT CANOPY MESH ──
  const canopyCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-45, 45, 0),
    new THREE.Vector3(-24, 56, 0),
    new THREE.Vector3(0, 62, 0),
    new THREE.Vector3(24, 56, 0),
    new THREE.Vector3(45, 45, 0)
  ]);
  const canopyGeo = new THREE.TubeGeometry(canopyCurve, 38, 6.4, 16, false);
  const canopyMesh = new THREE.Mesh(canopyGeo, cushionMat);
  canopyMesh.castShadow = true;
  group.add(canopyMesh);

  // ── TELESCOPING ADJUSTMENT SLEEVES WITH ETCHED RULER TICKS (Left & Right) ──
  [-68, 68].forEach((xSide) => {
    // Outer collar sleeve
    const sleeveGeo = new THREE.CylinderGeometry(5.4, 5.4, 18, 20);
    const sleeveMesh = new THREE.Mesh(sleeveGeo, satinChromeMat);
    sleeveMesh.position.set(xSide, -32, 0);
    sleeveMesh.castShadow = true;
    group.add(sleeveMesh);

    // Fine chrome alignment ring
    const ringGeo = new THREE.TorusGeometry(5.5, 0.8, 12, 24);
    const ringMesh = new THREE.Mesh(ringGeo, chromeMat);
    ringMesh.position.set(xSide, -24, 0);
    ringMesh.rotation.x = Math.PI / 2;
    group.add(ringMesh);

    // Inner chrome telescoping slider rod extending into earcup yoke
    const rodGeo = new THREE.CylinderGeometry(3.6, 3.6, 28, 16);
    const rodMesh = new THREE.Mesh(rodGeo, chromeMat);
    rodMesh.position.set(xSide, -48, 0);
    rodMesh.castShadow = true;
    group.add(rodMesh);

    // Precision etched ruler graduation rings along slider rod
    [-42, -47, -52].forEach((tickY) => {
      const tickGeo = new THREE.TorusGeometry(3.65, 0.25, 8, 20);
      const tickMesh = new THREE.Mesh(tickGeo, darkChromeMat);
      tickMesh.position.set(xSide, tickY, 0);
      tickMesh.rotation.x = Math.PI / 2;
      group.add(tickMesh);
    });
  });

  // ── EARCUPS & ACOUSTIC CUSHIONS (Left & Right) ──
  function createEarcup(isRight) {
    const cupGroup = new THREE.Group();
    const xPos = isRight ? 70 : -70;
    cupGroup.position.set(xPos, -65, 0);

    // Dynamic 3/4 turn so the broad, sculptural mirror chrome face catches specular rays
    cupGroup.rotation.y = isRight ? 0.35 : -0.20;
    cupGroup.rotation.z = isRight ? -0.05 : 0.05;

    // 1. Sleek Chrome Cantilever Pivot Hinge
    const pivotGeo = new THREE.CylinderGeometry(6, 6, 8, 24);
    const pivotMesh = new THREE.Mesh(pivotGeo, satinChromeMat);
    pivotMesh.position.set(0, 16, 0);
    pivotMesh.rotation.z = Math.PI / 2;
    cupGroup.add(pivotMesh);

    // Polished chrome center cap on pivot
    const capGeo = new THREE.CylinderGeometry(4.5, 4.5, 8.4, 24);
    const capMesh = new THREE.Mesh(capGeo, chromeMat);
    capMesh.position.set(0, 16, 0);
    capMesh.rotation.z = Math.PI / 2;
    cupGroup.add(capMesh);

    // 2. Mirror Chrome Main Earcup Shell (AirPods Max luxury pill-capsule contour)
    const cupGeo = new THREE.CylinderGeometry(24, 24, 18, 36);
    const cupMesh = new THREE.Mesh(cupGeo, chromeMat);
    cupMesh.rotation.z = Math.PI / 2;
    cupMesh.scale.set(1.28, 1.0, 0.94); // Ergonomic ear profile
    cupMesh.castShadow = true;
    cupMesh.receiveShadow = true;
    cupGroup.add(cupMesh);

    // 3. Mirror Chrome Outer Beveled Perimeter Ring
    const rimGeo = new THREE.TorusGeometry(23.8, 1.8, 16, 36);
    const rimMesh = new THREE.Mesh(rimGeo, chromeMat);
    rimMesh.rotation.y = Math.PI / 2;
    rimMesh.scale.set(0.94, 1.28, 1.0);
    rimMesh.position.set(isRight ? 8.8 : -8.8, 0, 0);
    cupGroup.add(rimMesh);

    // 4. Concentric Brushed Satin Accent Disc on Outer Face
    const discGeo = new THREE.CylinderGeometry(15, 15, 0.8, 32);
    const discMesh = new THREE.Mesh(discGeo, satinChromeMat);
    discMesh.rotation.z = Math.PI / 2;
    discMesh.position.set(isRight ? 9.2 : -9.2, 0, 0);
    cupGroup.add(discMesh);

    // 5. Plush Memory Foam Acoustic Ear Cushion (Inner Face)
    const cushionGeo = new THREE.TorusGeometry(18, 6.5, 16, 36);
    const cushionMesh = new THREE.Mesh(cushionGeo, cushionMat);
    cushionMesh.rotation.y = Math.PI / 2;
    cushionMesh.scale.set(0.94, 1.25, 1.05);
    cushionMesh.position.set(isRight ? -7.5 : 7.5, 0, 0);
    cushionMesh.castShadow = true;
    cupGroup.add(cushionMesh);

    // Inner Speaker Grille Fabric
    const clothGeo = new THREE.CylinderGeometry(17, 17, 1, 32);
    const clothMesh = new THREE.Mesh(clothGeo, cushionMat);
    clothMesh.rotation.z = Math.PI / 2;
    clothMesh.position.set(isRight ? -5 : 5, 0, 0);
    clothMesh.scale.set(1.22, 1.0, 0.92);
    cupGroup.add(clothMesh);

    // 6. Right Earcup Hardware Controls (Digital Crown Dial, ANC Button, Micro-LED)
    if (isRight) {
      const crownGeo = new THREE.CylinderGeometry(3.6, 3.6, 5, 20);
      const crownMesh = new THREE.Mesh(crownGeo, darkChromeMat);
      crownMesh.position.set(4, 26, 6);
      crownMesh.rotation.x = 0.4;
      cupGroup.add(crownMesh);

      const ancGeo = new THREE.BoxGeometry(2.5, 7, 2.5);
      const ancMesh = new THREE.Mesh(ancGeo, chromeMat);
      ancMesh.position.set(4, 24, -7);
      ancMesh.rotation.x = -0.3;
      cupGroup.add(ancMesh);

      const ledGeo = new THREE.SphereGeometry(1.2, 12, 12);
      const ledMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 1.5,
        roughness: 0.1
      });
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.set(2, -26, 0);
      cupGroup.add(ledMesh);
    }

    // 3.5mm Headphone Input Jack Port on Right Earcup (connecting to MP3 player on right)
    if (isRight) {
      const inputPortGeo = new THREE.CylinderGeometry(2.6, 2.6, 3, 16);
      const inputPortMesh = new THREE.Mesh(inputPortGeo, darkChromeMat);
      inputPortMesh.position.set(0, -28, 0);
      cupGroup.add(inputPortMesh);
    }

    return cupGroup;
  }

  const leftCup = createEarcup(false);
  const rightCup = createEarcup(true);
  group.add(leftCup);
  group.add(rightCup);

  // ── RETRO LUXURY LIQUID CHROME MP3 PLAYER (Positioned immediately beside right earcup) ──
  const mp3Group = new THREE.Group();
  mp3Group.position.set(106, -65, 24);
  mp3Group.rotation.set(0.02, -0.48, 0.02);
  mp3Group.scale.set(1.35, 1.35, 1.35);

  // Chrome Wall Hook Mount for MP3 Player
  const mp3HookGeo = new THREE.CylinderGeometry(1.6, 1.6, 26, 16);
  const mp3HookMesh = new THREE.Mesh(mp3HookGeo, chromeMat);
  mp3HookMesh.rotation.x = Math.PI / 2;
  mp3HookMesh.position.set(0, 36, -8);
  mp3Group.add(mp3HookMesh);

  // Chrome Hanging Loop on top of MP3
  const mp3LoopGeo = new THREE.TorusGeometry(3.5, 0.9, 12, 24);
  const mp3LoopMesh = new THREE.Mesh(mp3LoopGeo, chromeMat);
  mp3LoopMesh.position.set(0, 32, 0);
  mp3Group.add(mp3LoopMesh);

  // 1. Chassis Body (Machined Mirror Chrome Beveled Shell)
  const mp3BodyGeo = new THREE.BoxGeometry(38, 60, 8.5);
  const mp3BodyMesh = new THREE.Mesh(mp3BodyGeo, chromeMat);
  mp3BodyMesh.castShadow = true;
  mp3BodyMesh.receiveShadow = true;
  mp3Group.add(mp3BodyMesh);

  // Satin Brushed Dark Faceplate
  const mp3FaceGeo = new THREE.BoxGeometry(36, 58, 1);
  const mp3FaceMesh = new THREE.Mesh(mp3FaceGeo, satinChromeMat);
  mp3FaceMesh.position.set(0, 0, 4.3);
  mp3Group.add(mp3FaceMesh);

  // 2. High-Tech OLED Screen Display Canvas (512x360 Ultra Sharp)
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 512;
  screenCanvas.height = 360;
  const sctx = screenCanvas.getContext('2d');

  function renderMp3Screen(time) {
    sctx.fillStyle = '#060a12';
    sctx.fillRect(0, 0, 512, 360);

    const track = (group.userData && group.userData.currentTrack) || {
      title: 'FAMJAM4000',
      artist: 'Jordan Ward // FORWARD'
    };
    const isPlayingMusic = !!(group.userData && group.userData.isAudioPlaying);

    // Status bar
    sctx.fillStyle = '#00f0ff';
    sctx.font = 'bold 24px monospace';
    sctx.fillText(isPlayingMusic ? '▶ PLAYING' : '❚❚ PAUSED', 20, 42);
    sctx.fillStyle = '#10b981';
    sctx.fillText('⚡ 100%', 400, 42);

    // Divider
    sctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    sctx.lineWidth = 3;
    sctx.beginPath(); sctx.moveTo(18, 60); sctx.lineTo(494, 60); sctx.stroke();

    // Track Info
    sctx.fillStyle = '#ffffff';
    sctx.font = 'bold 28px "Share Tech Mono", monospace, sans-serif';
    sctx.fillText(track.title || 'FAMJAM4000', 20, 112);
    sctx.fillStyle = 'rgba(0, 240, 255, 0.95)';
    sctx.font = 'bold 20px monospace';
    sctx.fillText(track.artist || 'Jordan Ward // FORWARD', 20, 148);

    // Dynamic EQ visualizer bars
    const t = time || Date.now() * 0.003;
    const baseH = [28, 55, 90, 68, 105, 48, 80, 42, 85, 62, 35, 70, 45, 80];
    const barW = 22;
    const barGap = 12;
    const startX = 20;
    baseH.forEach((bh, bi) => {
      const pulseMult = isPlayingMusic ? 1.7 : 0.0;
      const pulse = isPlayingMusic
        ? (Math.sin(t * 6.5 + bi * 0.7) * 26 + Math.cos(t * 8.2 + bi * 1.1) * 16) * pulseMult
        : 0;
      const h = isPlayingMusic ? Math.max(10, Math.min(130, bh * 1.25 + pulse)) : 8;
      const grad = sctx.createLinearGradient(0, 305 - h, 0, 305);
      grad.addColorStop(0, '#00f0ff');
      grad.addColorStop(0.65, '#3b82f6');
      grad.addColorStop(1, '#10b981');
      sctx.fillStyle = grad;
      sctx.fillRect(startX + bi * (barW + barGap), 305 - h, barW, h);
    });

    // Progress line
    sctx.fillStyle = isPlayingMusic ? '#10b981' : '#475569';
    sctx.fillRect(20, 330, 340, 8);
    sctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    sctx.fillRect(360, 330, 132, 8);
  }

  renderMp3Screen(0);
  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  const screenMat = new THREE.MeshStandardMaterial({
    map: screenTexture,
    roughness: 0.12,
    metalness: 0.1,
    emissive: 0x002233,
    emissiveIntensity: 0.5
  });
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(31, 22), screenMat);
  screenMesh.position.set(0, 12, 4.9);
  screenMesh.name = 'mp3Screen';
  mp3Group.add(screenMesh);

  group.userData.renderMp3 = (isZoomed) => {
    renderMp3Screen();
    screenTexture.needsUpdate = true;
  };

  // 3. Classic Touch Click-Wheel Navigation Pad with etched icons
  const wheelCanvas = document.createElement('canvas');
  wheelCanvas.width = 256;
  wheelCanvas.height = 256;
  const wctx = wheelCanvas.getContext('2d');
  wctx.fillStyle = '#16202c';
  wctx.beginPath(); wctx.arc(128, 128, 124, 0, Math.PI * 2); wctx.fill();
  wctx.strokeStyle = '#2d3b4e';
  wctx.lineWidth = 4;
  wctx.stroke();
  wctx.fillStyle = '#94a3b8';
  wctx.font = 'bold 24px monospace';
  wctx.textAlign = 'center';
  wctx.textBaseline = 'middle';
  wctx.fillText('MENU', 128, 38);
  wctx.fillText('▶❚❚', 128, 218);
  wctx.fillText('⏮', 38, 128);
  wctx.fillText('⏭', 218, 128);
  const wheelTexture = new THREE.CanvasTexture(wheelCanvas);
  const wheelGeo = new THREE.CylinderGeometry(11.5, 11.5, 1.4, 32);
  const wheelMat = new THREE.MeshStandardMaterial({
    map: wheelTexture,
    roughness: 0.35,
    metalness: 0.4
  });
  const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
  wheelMesh.rotation.x = Math.PI / 2;
  wheelMesh.position.set(0, -14, 4.6);
  wheelMesh.name = 'mp3Wheel';
  mp3Group.add(wheelMesh);

  // Center Action Button (Polished Chrome)
  const centerBtnGeo = new THREE.CylinderGeometry(4.5, 4.5, 1.6, 24);
  const centerBtnMesh = new THREE.Mesh(centerBtnGeo, chromeMat);
  centerBtnMesh.rotation.x = Math.PI / 2;
  centerBtnMesh.position.set(0, -14, 4.9);
  centerBtnMesh.name = 'mp3CenterBtn';
  mp3Group.add(centerBtnMesh);

  // 4. 3.5mm Headphone Jack Port on the LEFT side of MP3 player facing the headphones
  const jackPortGeo = new THREE.CylinderGeometry(2.4, 2.4, 3, 16);
  const jackPortMesh = new THREE.Mesh(jackPortGeo, darkChromeMat);
  jackPortMesh.position.set(-19, 12, 0);
  jackPortMesh.rotation.z = Math.PI / 2;
  mp3Group.add(jackPortMesh);

  // Chrome Jack Plug Barrel entering towards side
  const plugGeo = new THREE.CylinderGeometry(2.1, 2.1, 9, 16);
  const plugMesh = new THREE.Mesh(plugGeo, chromeMat);
  plugMesh.position.set(-24.5, 12, 0);
  plugMesh.rotation.z = Math.PI / 2;
  mp3Group.add(plugMesh);

  group.add(mp3Group);

  // ── REALISTIC BRAIDED HEADPHONE CABLE CONNECTING RIGHT EAR TO MP3 PLAYER ──
  // Connects right earcup port (70, -106, 0) flush into MP3 player plug (76.7, -48.8, 8.7)
  const cableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(70, -106, 0),
    new THREE.Vector3(71, -124, 6),
    new THREE.Vector3(73, -114, 11),
    new THREE.Vector3(75, -78, 11),
    new THREE.Vector3(76.7, -48.8, 8.7)
  ]);
  const cableGeo = new THREE.TubeGeometry(cableCurve, 40, 2.0, 12, false);
  const cableMat = new THREE.MeshStandardMaterial({
    color: 0x1a2230,
    roughness: 0.55,
    metalness: 0.35
  });
  const cableMesh = new THREE.Mesh(cableGeo, cableMat);
  cableMesh.castShadow = true;
  group.add(cableMesh);

  // Group angled so the broad mirror chrome face catches the studio light
  group.rotation.y = 0.50;

  return group;
}

function drawRRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ── WOOD FRAME TEXTURE GENERATOR FOR HIGH-END PICTURE FRAME (MATCHING REFERENCE IMAGE 1) ──
function createMahoganyFrameTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rich warm mahogany / walnut wood base
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#532814');
  grad.addColorStop(0.35, '#3a180a');
  grad.addColorStop(0.7, '#643217');
  grad.addColorStop(1, '#441d0e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle natural woodgrain streaks
  ctx.fillStyle = 'rgba(24, 10, 4, 0.45)';
  for (let i = 0; i < 75; i++) {
    const y = Math.random() * 512;
    const h = 1 + Math.random() * 3.5;
    ctx.fillRect(0, y, 512, h);
  }
  ctx.fillStyle = 'rgba(125, 62, 32, 0.28)';
  for (let i = 0; i < 50; i++) {
    const y = Math.random() * 512;
    const h = 1 + Math.random() * 2.5;
    ctx.fillRect(0, y, 512, h);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

// ── HIGH-QUALITY 3D FRAMED STREET-ART STICKER BOARD (MATCHING REFERENCE IMAGE 1) ──
function create3DGreenBoard(sharedEnvMap) {
  const group = new THREE.Group();
  const envMap = sharedEnvMap || createStudioChromeEnvMap();

  // 1. Backing Board Plate
  const boardGeo = new THREE.BoxGeometry(360, 240, 12);
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0x181c22, // Deep matte studio slate / cork backing
    roughness: 0.65,
    metalness: 0.05
  });
  const boardMesh = new THREE.Mesh(boardGeo, boardMat);
  boardMesh.castShadow = true;
  boardMesh.receiveShadow = true;
  group.add(boardMesh);

  // 2. Authentic Beveled Mahogany Picture Frame (Matching Reference Image 1)
  const frameMat = new THREE.MeshStandardMaterial({
    map: createMahoganyFrameTexture(),
    roughness: 0.25,
    metalness: 0.08,
    envMap: envMap,
    envMapIntensity: 0.5
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xdfb15b,
    roughness: 0.15,
    metalness: 0.88,
    envMap: envMap,
    envMapIntensity: 1.8
  });

  // 4 Outer Wood Moulding Bars with Beveled Profile
  const topMoulding = new THREE.Mesh(new THREE.BoxGeometry(392, 16, 20), frameMat);
  topMoulding.position.set(0, 120 + 8, 4);
  topMoulding.castShadow = true;
  group.add(topMoulding);

  const bottomMoulding = new THREE.Mesh(new THREE.BoxGeometry(392, 16, 20), frameMat);
  bottomMoulding.position.set(0, -120 - 8, 4);
  bottomMoulding.castShadow = true;
  group.add(bottomMoulding);

  const leftMoulding = new THREE.Mesh(new THREE.BoxGeometry(16, 240, 20), frameMat);
  leftMoulding.position.set(-180 - 8, 0, 4);
  leftMoulding.castShadow = true;
  group.add(leftMoulding);

  const rightMoulding = new THREE.Mesh(new THREE.BoxGeometry(16, 240, 20), frameMat);
  rightMoulding.position.set(180 + 8, 0, 4);
  rightMoulding.castShadow = true;
  group.add(rightMoulding);

  // Elegant Brass Inner Reveal Border
  const topBrass = new THREE.Mesh(new THREE.BoxGeometry(362, 3, 14), brassMat);
  topBrass.position.set(0, 120 + 1.5, 5);
  group.add(topBrass);
  const btmBrass = new THREE.Mesh(new THREE.BoxGeometry(362, 3, 14), brassMat);
  btmBrass.position.set(0, -120 - 1.5, 5);
  group.add(btmBrass);
  const leftBrass = new THREE.Mesh(new THREE.BoxGeometry(3, 240, 14), brassMat);
  leftBrass.position.set(-180 - 1.5, 0, 5);
  group.add(leftBrass);
  const rightBrass = new THREE.Mesh(new THREE.BoxGeometry(3, 240, 14), brassMat);
  rightBrass.position.set(180 + 1.5, 0, 5);
  group.add(rightBrass);

  // 3. Dense 32-Sticker Pop-Culture & Street-Art Collage (Directly Inspired by Reference Image 1)
  const stickers = [
    // 1. OWLY (Upper Right Center - Reference Image 1)
    { x: 46, y: 56, z: 6.8, w: 72, h: 64, rot: 0.04, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 10); ctx.fill();
      ctx.fillStyle = '#0f172a'; drawRRect(ctx, 3, 3, w - 6, h - 6, 8); ctx.fill();
      // Red demon horns
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.moveTo(w/2 - 16, 12); ctx.lineTo(w/2 - 24, 2); ctx.lineTo(w/2 - 8, 12); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w/2 + 16, 12); ctx.lineTo(w/2 + 24, 2); ctx.lineTo(w/2 + 8, 12); ctx.fill();
      // Large comic eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(w/2 - 12, 28, 11, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w/2 + 12, 28, 11, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ec4899';
      ctx.beginPath(); ctx.arc(w/2 - 12, 29, 6, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w/2 + 12, 29, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(w/2 - 14, 27, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w/2 + 10, 27, 2.5, 0, Math.PI*2); ctx.fill();
      // OWLY text
      ctx.fillStyle = '#ffffff'; ctx.font = '900 13px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('OWLY', w/2, 54);
    }},

    // 2. HIGH ON PIZZA (Upper Center - Reference Image 1)
    { x: 8, y: 36, z: 7.2, w: 90, h: 42, rot: -0.06, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 8); ctx.fill();
      ctx.fillStyle = '#1e1b4b'; drawRRect(ctx, 3, 3, w - 6, h - 6, 6); ctx.fill();
      // Dripping melted cheese 70s text
      const pGrad = ctx.createLinearGradient(0, 0, w, 0);
      pGrad.addColorStop(0, '#facc15'); pGrad.addColorStop(0.5, '#fb923c'); pGrad.addColorStop(1, '#ef4444');
      ctx.fillStyle = pGrad;
      ctx.font = '900 14px "Permanent Marker", "Sedgwick Ave", cursive, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('HIGH ON PIZZA', w/2, h/2 - 2);
      // Pizza slice graphic
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath(); ctx.moveTo(w - 18, 10); ctx.lineTo(w - 8, 30); ctx.lineTo(w - 28, 26); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(w - 16, 20, 2.5, 0, Math.PI*2); ctx.fill();
    }},

    // 3. MEMER FLAMES (Bottom Left - Reference Image 1)
    { x: -88, y: -94, z: 7.0, w: 94, h: 42, rot: 0.04, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 6); ctx.fill();
      ctx.fillStyle = '#09090b'; drawRRect(ctx, 3, 3, w - 6, h - 6, 4); ctx.fill();
      // Blazing fire flames at bottom
      for (let i = 8; i < w - 8; i += 12) {
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.moveTo(i - 6, h - 6); ctx.quadraticCurveTo(i, h - 22, i + 6, h - 6); ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath(); ctx.moveTo(i - 4, h - 6); ctx.quadraticCurveTo(i, h - 16, i + 4, h - 6); ctx.fill();
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 16px "Arial Black", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('MEMER', w/2, 22);
    }},

    // 4. KAPX THAI (Bottom Center - Reference Image 1)
    { x: 22, y: -94, z: 7.4, w: 92, h: 42, rot: -0.05, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 6); ctx.fill();
      ctx.fillStyle = '#000000'; drawRRect(ctx, 3, 3, w - 6, h - 6, 4); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = '900 13px "Impact", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('KAPX THAI', w/2, 20);
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 8px monospace';
      ctx.fillText("Da' Big Rush", w/2, 33);
    }},

    // 5. CALL YOUR LOCAL EXORCIST (Top Right - Reference Image 1)
    { x: 95, y: 84, z: 6.9, w: 84, h: 56, rot: -0.04, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 6); ctx.fill();
      ctx.fillStyle = '#f8fafc'; drawRRect(ctx, 3, 3, w - 6, h - 6, 4); ctx.fill();
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1.5; ctx.strokeRect(6, 6, w - 12, h - 12);
      ctx.fillStyle = '#0f172a'; ctx.font = '900 7px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('CALL YOUR LOCAL', w/2, 17);
      ctx.font = '900 11px serif'; ctx.fillText('EXORCIST', w/2, 30);
      ctx.fillStyle = '#b91c1c'; ctx.font = 'bold 9px monospace';
      ctx.fillText('00-379-666', w/2, 44);
    }},

    // 6. PUMMELFEE CARTOON GUY (Center - Reference Image 1)
    { x: -42, y: -8, z: 7.8, w: 78, h: 84, rot: 0.03, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 14); ctx.fill();
      // Round head
      ctx.fillStyle = '#fed7aa'; ctx.beginPath(); ctx.arc(w/2, 36, 26, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2.5; ctx.stroke();
      // Big cartoon eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(w/2 - 9, 32, 9, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(w/2 + 9, 32, 9, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(w/2 - 8, 32, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w/2 + 8, 32, 4, 0, Math.PI*2); ctx.fill();
      // Gap tooth smile
      ctx.beginPath(); ctx.arc(w/2, 44, 12, 0, Math.PI); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(w/2 - 4, 44, 4, 5); ctx.strokeRect(w/2 - 4, 44, 4, 5);
      // Bright pink shirt
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath(); ctx.moveTo(w/2 - 28, 62); ctx.lineTo(w/2 + 28, 62); ctx.lineTo(w/2 + 34, h - 4); ctx.lineTo(w/2 - 34, h - 4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 7px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Pummelfee', w/2, h - 8);
    }},

    // 7. FRIED EGG WITH RED TAG (Center Left - Reference Image 1)
    { x: -78, y: -44, z: 7.5, w: 68, h: 68, rot: -0.12, draw: (ctx, w, h) => {
      // White die-cut outline
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(w/2, h/2, 30, 24, 0.2, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2.5; ctx.stroke();
      // Shiny yellow egg yolk
      const yGrad = ctx.createRadialGradient(w/2 - 4, h/2 - 4, 2, w/2, h/2, 16);
      yGrad.addColorStop(0, '#fef08a'); yGrad.addColorStop(0.6, '#f59e0b'); yGrad.addColorStop(1, '#ea580c');
      ctx.fillStyle = yGrad;
      ctx.beginPath(); ctx.arc(w/2 - 2, h/2 - 2, 14, 0, Math.PI*2); ctx.fill();
      // Specular glare
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath(); ctx.arc(w/2 - 6, h/2 - 6, 4, 0, Math.PI*2); ctx.fill();
      // Red street tag across yolk
      ctx.fillStyle = '#ef4444';
      ctx.font = '900 13px "Impact", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('MATE', w/2 + 10, h/2 + 14);
    }},

    // 8. GYROS 8-BIT ROBOT (Upper Right - Reference Image 1)
    { x: 140, y: 80, z: 7.1, w: 58, h: 58, rot: 0.05, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 6); ctx.fill();
      ctx.fillStyle = '#0f172a'; drawRRect(ctx, 3, 3, w - 6, h - 6, 4); ctx.fill();
      // Pixel robot
      ctx.fillStyle = '#ffffff';
      // Antenna
      ctx.fillRect(w/2 - 2, 10, 4, 6);
      ctx.fillRect(w/2 - 5, 8, 10, 3);
      // Head
      ctx.fillRect(16, 16, 26, 20);
      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(20, 22, 6, 6); ctx.fillRect(32, 22, 6, 6);
      // GYROS label
      ctx.fillStyle = '#ffffff'; ctx.font = '900 8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('GYROS', w/2, 48);
    }},

    // 9. ZACK HAS A POSSE / PRIORITY MAIL (Center Right - Reference Image 1)
    { x: 82, y: 36, z: 7.7, w: 74, h: 48, rot: 0.08, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 6); ctx.fill();
      // Blue top strip
      ctx.fillStyle = '#1d4ed8'; ctx.fillRect(4, 4, w - 8, 10);
      ctx.fillStyle = '#ffffff'; ctx.font = '900 7px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('PRIORITY MAIL', w/2, 12);
      // Body
      ctx.fillStyle = '#ffffff'; ctx.fillRect(4, 14, w - 8, 22);
      ctx.fillStyle = '#1e293b'; ctx.font = '900 8px sans-serif';
      ctx.fillText('ZACK', w/2 - 12, 24);
      ctx.font = 'bold 6px monospace';
      ctx.fillText('HAS A POSSE', w/2 + 10, 24);
      ctx.fillText("5'4  135 LB", w/2, 33);
      // Red bottom strip
      ctx.fillStyle = '#dc2626'; ctx.fillRect(4, 36, w - 8, 8);
    }},

    // 10. KOBE 24 BASKETBALL (Lower Right - Reference Image 1)
    { x: 135, y: -58, z: 7.2, w: 58, h: 72, rot: -0.05, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 8); ctx.fill();
      // Gold Jersey
      ctx.fillStyle = '#facc15'; drawRRect(ctx, 3, 3, w - 6, h - 6, 6); ctx.fill();
      // Purple collar & arm rings
      ctx.strokeStyle = '#7e22ce'; ctx.lineWidth = 3;
      ctx.strokeRect(6, 6, w - 12, h - 12);
      // Number 24
      ctx.fillStyle = '#7e22ce'; ctx.font = '900 24px "Arial Black", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('24', w/2, 42);
      ctx.font = 'bold 8px monospace'; ctx.fillText('KOBE', w/2, 58);
    }},

    // 11. XAMAN GRAFFITI TAG (Middle Right - Reference Image 1)
    { x: 88, y: 8, z: 7.3, w: 86, h: 36, rot: -0.06, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 6); ctx.fill();
      ctx.fillStyle = '#0f172a'; drawRRect(ctx, 3, 3, w - 6, h - 6, 4); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 17px "Impact", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('XAMAN', w/2, h/2);
    }},

    // 12. MERDA SPEED RACING (Bottom Center - Reference Image 1)
    { x: 14, y: -52, z: 7.6, w: 82, h: 34, rot: 0.05, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 6); ctx.fill();
      ctx.fillStyle = '#09090b'; drawRRect(ctx, 3, 3, w - 6, h - 6, 4); ctx.fill();
      ctx.fillStyle = '#ef4444'; ctx.fillRect(6, 6, 4, h - 12);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 900 15px "Arial Black", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('MERDA', w/2 + 4, h/2);
    }},

    // 13. JJJ CHROME BUBBLE THROW-UP (Center Right - Reference Image 1)
    { x: 110, y: -22, z: 7.5, w: 76, h: 48, rot: 0.12, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 8); ctx.fill();
      const bGrad = ctx.createLinearGradient(0, 0, 0, h);
      bGrad.addColorStop(0, '#c084fc'); bGrad.addColorStop(0.5, '#7e22ce'); bGrad.addColorStop(1, '#4c1d95');
      ctx.fillStyle = bGrad; drawRRect(ctx, 3, 3, w - 6, h - 6, 6); ctx.fill();
      ctx.fillStyle = '#4ade80';
      ctx.font = '900 22px "Permanent Marker", cursive, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('JJJ', w/2, h/2);
    }},

    // 14. STREET // NO HATE (Top Left - Reference Image 1)
    { x: -128, y: 74, z: 7.0, w: 70, h: 70, rot: -0.04, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#581c87'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 5, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 9, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = '900 8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('STREET', w/2, 24);
      ctx.fillStyle = '#facc15'; ctx.font = 'bold 7px monospace';
      ctx.fillText('NO HATE', w/2, 38);
      ctx.fillText('FAMILY', w/2, 50);
    }},

    // 15. NOKIA 3310 (Left Side - High-Definition Retro Icon)
    { x: -128, y: -10, z: 7.7, w: 64, h: 125, rot: -0.06, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 20); ctx.fill();
      const bodyGrad = ctx.createLinearGradient(0, 0, w, h);
      bodyGrad.addColorStop(0, '#cbd5e1'); bodyGrad.addColorStop(0.5, '#94a3b8'); bodyGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = bodyGrad; drawRRect(ctx, 3, 3, w - 6, h - 6, 17); ctx.fill();
      // Screen bezel & LCD
      ctx.fillStyle = '#0f172a'; drawRRect(ctx, 10, 14, w - 20, 38, 6); ctx.fill();
      ctx.fillStyle = '#97c433'; drawRRect(ctx, 12, 16, w - 24, 34, 4); ctx.fill();
      ctx.fillStyle = '#1e293b'; ctx.font = '900 7px monospace'; ctx.textAlign = 'left';
      ctx.fillText('SNAKE: 9999', 15, 25);
      // Snake dots
      [[20, 34], [24, 34], [28, 34], [28, 40], [32, 40]].forEach(([sx, sy]) => { ctx.fillRect(sx, sy, 3, 3); });
      ctx.fillRect(44, 32, 3, 3);
      // Keypad
      ctx.fillStyle = '#cbd5e1'; ctx.font = 'bold 7px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('NOKIA', w/2, 60);
      const keys = ['1','2','3','4','5','6','7','8','9','*','0','#'];
      keys.forEach((k, idx) => {
        const col = idx % 3; const row = Math.floor(idx / 3);
        const kx = 18 + col * 14; const ky = 74 + row * 12;
        ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.arc(kx, ky, 4.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#0f172a'; ctx.font = 'bold 6px sans-serif'; ctx.fillText(k, kx, ky + 2);
      });
    }},

    // 16. UNO REVERSE CARDS (Lower Right - Iconic Meme)
    { x: 95, y: -68, z: 7.8, w: 72, h: 54, rot: 0.14, draw: (ctx, w, h) => {
      // Overlapping Red and Blue UNO Cards
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 8); ctx.fill();
      // Blue Card
      ctx.fillStyle = '#0284c7'; drawRRect(ctx, 3, 3, w/2 + 8, h - 6, 6); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = '900 14px "Arial Black", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('⇄', 22, h/2 + 5);
      // Red Card overlapping
      ctx.fillStyle = '#dc2626'; drawRRect(ctx, w/2 - 4, 3, w/2 + 1, h - 6, 6); ctx.fill();
      ctx.fillStyle = '#facc15'; ctx.font = '900 12px "Arial Black", sans-serif';
      ctx.fillText('UNO', w - 20, h/2 + 4);
    }},

    // 17. LUCKY NEKO (Top Center - Reference Image 1)
    { x: -35, y: 82, z: 7.3, w: 56, h: 56, rot: 0.06, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 5, 0, Math.PI*2); ctx.fill();
      // Lucky cat face
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(w/2, h/2 + 2, 16, 0, Math.PI*2); ctx.fill();
      // Cat ears
      ctx.beginPath(); ctx.moveTo(w/2 - 14, 18); ctx.lineTo(w/2 - 6, 12); ctx.lineTo(w/2 - 4, 22); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w/2 + 14, 18); ctx.lineTo(w/2 + 6, 12); ctx.lineTo(w/2 + 4, 22); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('NEKO', w/2, 50);
    }},

    // 18. ALIEN UFO (Lower Center)
    { x: -8, y: -88, z: 7.5, w: 62, h: 44, rot: -0.05, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 8); ctx.fill();
      ctx.fillStyle = '#09090b'; drawRRect(ctx, 3, 3, w - 6, h - 6, 6); ctx.fill();
      // Green beam
      ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
      ctx.beginPath(); ctx.moveTo(w/2 - 6, 18); ctx.lineTo(w/2 + 6, 18); ctx.lineTo(w/2 + 18, h - 4); ctx.lineTo(w/2 - 18, h - 4); ctx.fill();
      // Saucer dome & hull
      ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(w/2, 14, 8, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.ellipse(w/2, 16, 20, 5, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#22c55e'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
      ctx.fillText('UFO // 2026', w/2, 38);
    }},

    // 19. AIRMAIL STAMP (Bottom Left)
    { x: -136, y: -78, z: 7.1, w: 68, h: 52, rot: 0.05, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 4); ctx.fill();
      ctx.fillStyle = '#f8fafc'; drawRRect(ctx, 3, 3, w - 6, h - 6, 3); ctx.fill();
      // Red/blue border stripes
      for (let i = 4; i < w - 8; i += 12) {
        ctx.fillStyle = (i % 24 === 4) ? '#ef4444' : '#2563eb';
        ctx.fillRect(i, 4, 6, 3); ctx.fillRect(i, h - 7, 6, 3);
      }
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(w/2, h/2, 14, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = '#1e293b'; ctx.font = 'bold 6.5px monospace'; ctx.textAlign = 'center';
      ctx.fillText('SHILLONG', w/2, h/2 - 2);
      ctx.fillText('AIRMAIL', w/2, h/2 + 7);
    }},

    // 20. GENGAR SHADOW (Upper Left)
    { x: -88, y: 88, z: 7.2, w: 60, h: 50, rot: -0.06, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 8); ctx.fill();
      ctx.fillStyle = '#581c87'; drawRRect(ctx, 3, 3, w - 6, h - 6, 6); ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(w/2 - 10, 20, 5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w/2 + 10, 20, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('GENGAR #94', w/2, 40);
    }},

    // 21. 8-BIT RETRO HEART (Top Center)
    { x: 12, y: 94, z: 7.4, w: 46, h: 42, rot: 0.08, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 6); ctx.fill();
      ctx.fillStyle = '#ef4444';
      // Pixel heart
      const hPx = [[14,12],[18,12],[26,12],[30,12],[10,16],[14,16],[18,16],[22,16],[26,16],[30,16],[34,16],[10,20],[14,20],[18,20],[22,20],[26,20],[30,20],[34,20],[14,24],[18,24],[22,24],[26,24],[30,24],[18,28],[22,28],[26,28],[22,32]];
      hPx.forEach(([px, py]) => { ctx.fillRect(px, py, 4, 4); });
      ctx.fillStyle = '#ffffff'; ctx.fillRect(14, 16, 4, 4);
    }},

    // 22. MADE IN PORTLAND SKULL (Upper Left)
    { x: -140, y: 35, z: 7.3, w: 58, h: 58, rot: 0.1, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 5, 0, Math.PI*2); ctx.fill();
      // Skull
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(w/2, 26, 12, 0, Math.PI*2); ctx.fill();
      ctx.fillRect(w/2 - 7, 34, 14, 8);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(w/2 - 5, 26, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w/2 + 5, 26, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center';
      ctx.fillText('PORTLAND', w/2, 51);
    }},

    // 23. CAUTION BARCODE (Lower Left)
    { x: -130, y: -46, z: 7.4, w: 64, h: 36, rot: -0.04, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 4); ctx.fill();
      ctx.fillStyle = '#facc15'; drawRRect(ctx, 2, 2, w - 4, h - 4, 3); ctx.fill();
      ctx.fillStyle = '#0f172a';
      // Barcode bars
      for (let i = 8; i < w - 8; i += 4) {
        ctx.fillRect(i, 6, (i % 3 === 0) ? 2.5 : 1.2, 16);
      }
      ctx.font = 'bold 6.5px monospace'; ctx.textAlign = 'center';
      ctx.fillText('FRAGILE // 2026', w/2, 30);
    }},

    // 24. RAMEN BOWL (Center Left)
    { x: -55, y: -85, z: 7.2, w: 56, h: 48, rot: 0.08, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 8); ctx.fill();
      ctx.fillStyle = '#dc2626'; drawRRect(ctx, 3, 3, w - 6, h - 6, 6); ctx.fill();
      // Ceramic bowl
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(w/2, 28, 16, 0, Math.PI); ctx.fill();
      // Chopsticks
      ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(w/2 - 14, 18); ctx.lineTo(w/2 + 18, 10); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
      ctx.fillText('RAMEN', w/2, 42);
    }},

    // 25. NO-FACE KAONASHI (Upper Right)
    { x: 58, y: -18, z: 7.5, w: 52, h: 62, rot: -0.07, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 10); ctx.fill();
      ctx.fillStyle = '#09090b'; drawRRect(ctx, 3, 3, w - 6, h - 6, 8); ctx.fill();
      // White mask
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(w/2, 28, 14, 18, 0, 0, Math.PI*2); ctx.fill();
      // Eyes & mouth
      ctx.fillStyle = '#09090b';
      ctx.fillRect(w/2 - 8, 24, 5, 2.5); ctx.fillRect(w/2 + 3, 24, 5, 2.5);
      ctx.fillRect(w/2 - 4, 35, 8, 3);
      // Purple cheek markings
      ctx.fillStyle = '#7e22ce';
      ctx.beginPath(); ctx.moveTo(w/2 - 8, 18); ctx.lineTo(w/2 - 6, 22); ctx.lineTo(w/2 - 10, 22); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w/2 + 8, 18); ctx.lineTo(w/2 + 6, 22); ctx.lineTo(w/2 + 10, 22); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
      ctx.fillText('NO-FACE', w/2, 54);
    }},

    // 26. JAKE THE DOG (Middle Right)
    { x: 145, y: 15, z: 7.6, w: 52, h: 52, rot: 0.05, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 5, 0, Math.PI*2); ctx.fill();
      // Jake's big eyes & jowls
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(w/2 - 8, 22, 8, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w/2 + 8, 22, 8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.arc(w/2 - 7, 22, 4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w/2 + 7, 22, 4, 0, Math.PI*2); ctx.fill();
      // Black nose
      ctx.beginPath(); ctx.arc(w/2, 32, 4, 0, Math.PI*2); ctx.fill();
      ctx.font = '900 6.5px monospace'; ctx.textAlign = 'center';
      ctx.fillText('JAKE', w/2, 46);
    }},

    // 27. LO-FI CASSETTE TAPE (Center Left)
    { x: -95, y: 18, z: 7.4, w: 66, h: 44, rot: -0.05, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 6); ctx.fill();
      ctx.fillStyle = '#1e293b'; drawRRect(ctx, 3, 3, w - 6, h - 6, 4); ctx.fill();
      // Cassette label
      ctx.fillStyle = '#fbbf24'; drawRRect(ctx, 8, 8, w - 16, 20, 3); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
      ctx.fillText('LO-FI 2026', w/2, 20);
      // Reels
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(w/2 - 12, 33, 5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w/2 + 12, 33, 5, 0, Math.PI*2); ctx.fill();
    }},

    // 28. ACID MELTED SMILEY (Center)
    { x: 8, y: -5, z: 7.9, w: 52, h: 52, rot: 0.12, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 5, 0, Math.PI*2); ctx.fill();
      // Melt drip at bottom
      ctx.beginPath(); ctx.arc(w/2 + 6, h - 8, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#0f172a';
      // Smiley eyes
      ctx.fillRect(w/2 - 8, 16, 4, 7); ctx.fillRect(w/2 + 4, 16, 4, 7);
      // Grin
      ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(w/2, 28, 11, 0.2, Math.PI - 0.2); ctx.stroke();
    }},

    // 29. POKEMON MASTER BALL (Top Right)
    { x: 48, y: 92, z: 7.2, w: 50, h: 50, rot: -0.06, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 2, 0, Math.PI*2); ctx.fill();
      // Purple top
      ctx.fillStyle = '#7e22ce'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 5, Math.PI, 0); ctx.fill();
      // White bottom
      ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 5, 0, Math.PI); ctx.fill();
      // Center band & button
      ctx.fillStyle = '#0f172a'; ctx.fillRect(4, h/2 - 2, w - 8, 4);
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(w/2, h/2, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ec4899'; ctx.font = '900 11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('M', w/2, 18);
    }},

    // 30. F1 RACING HELMET (Bottom Center)
    { x: 62, y: -92, z: 7.1, w: 56, h: 44, rot: 0.04, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; drawRRect(ctx, 0, 0, w, h, 8); ctx.fill();
      ctx.fillStyle = '#1e3a8a'; drawRRect(ctx, 3, 3, w - 6, h - 6, 6); ctx.fill();
      // Gold visor
      ctx.fillStyle = '#f59e0b'; drawRRect(ctx, 10, 14, 36, 12, 3); ctx.fill();
      ctx.fillStyle = '#ef4444'; ctx.fillRect(10, 8, 36, 3);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
      ctx.fillText('F1 SHILLONG', w/2, 36);
    }},

    // 31. FIRE CHILLI (Bottom Right)
    { x: 142, y: -95, z: 7.4, w: 48, h: 48, rot: -0.08, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 5, 0, Math.PI*2); ctx.fill();
      // Sunglasses
      ctx.fillStyle = '#09090b';
      ctx.fillRect(w/2 - 12, 18, 10, 6); ctx.fillRect(w/2 + 2, 18, 10, 6);
      ctx.fillRect(w/2 - 2, 20, 4, 2);
      ctx.fillStyle = '#22c55e'; ctx.font = '900 7px monospace'; ctx.textAlign = 'center';
      ctx.fillText('SPICY', w/2, 36);
    }},

    // 32. MADAME RETRO (Upper Center)
    { x: -38, y: 46, z: 7.1, w: 54, h: 54, rot: -0.05, draw: (ctx, w, h) => {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(w/2, h/2, w/2 - 5, 0, Math.PI*2); ctx.fill();
      // Cat-eye glasses
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.ellipse(w/2 - 9, 24, 7, 5, -0.2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w/2 + 9, 24, 7, 5, 0.2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(w/2 - 8, 23, 2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(w/2 + 10, 23, 2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
      ctx.fillText('RETRO', w/2, 42);
    }}
  ];

  stickers.forEach((st, idx) => {
    const sCanvas = document.createElement('canvas');
    sCanvas.width = st.w * 4;
    sCanvas.height = st.h * 4;
    const sCtx = sCanvas.getContext('2d');
    sCtx.scale(4, 4);
    st.draw(sCtx, st.w, st.h);

    const sTex = new THREE.CanvasTexture(sCanvas);
    sTex.generateMipmaps = true;
    sTex.minFilter = THREE.LinearMipmapLinearFilter;
    sTex.magFilter = THREE.LinearFilter;

    const sMat = new THREE.MeshStandardMaterial({
      map: sTex,
      transparent: true,
      roughness: 0.14,
      metalness: 0.10,
      envMap: envMap,
      envMapIntensity: 0.75,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1 * (idx + 1),
      polygonOffsetUnits: -1
    });
    const sMesh = new THREE.Mesh(new THREE.PlaneGeometry(st.w, st.h), sMat);
    sMesh.position.set(st.x, st.y, st.z);
    sMesh.rotation.z = st.rot;
    group.add(sMesh);
  });

  return group;
}

function drawRRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ctxCircle(ctx, cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.closePath();
}

// ── HIGH-QUALITY 3D LIQUID METALLIC CHROME LAPTOP WITH 90-DEGREE DISPLAY LID ──
function create3DDeskOpenLaptop(sharedStudioEnvMap) {
  const group = new THREE.Group();
  const envMap = sharedStudioEnvMap || createStudioChromeEnvMap();

  // Premium Liquid Mirror Chrome Chassis Base
  const lapBaseGeo = new THREE.BoxGeometry(270, 10, 168);
  const lapBaseMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.05,
    metalness: 0.96,
    envMap: envMap,
    envMapIntensity: 2.6
  });
  const lapBaseMesh = new THREE.Mesh(lapBaseGeo, lapBaseMat);
  lapBaseMesh.position.set(0, 5, 0);
  lapBaseMesh.castShadow = true;
  lapBaseMesh.receiveShadow = true;
  group.add(lapBaseMesh);

  // Recessed Keyboard Deck Tray (Brushed Dark Chrome / Gunmetal Well)
  const kbTrayGeo = new THREE.BoxGeometry(248, 2, 104);
  const kbTrayMat = new THREE.MeshStandardMaterial({
    color: 0x1e2430,
    roughness: 0.18,
    metalness: 0.88,
    envMap: envMap,
    envMapIntensity: 1.8
  });
  const kbTrayMesh = new THREE.Mesh(kbTrayGeo, kbTrayMat);
  kbTrayMesh.position.set(0, 10.5, -20);
  group.add(kbTrayMesh);

  // Precision Chrome Cylindrical Display Hinge
  const hingeGeo = new THREE.CylinderGeometry(4.2, 4.2, 230, 24);
  const hingeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    metalness: 0.98,
    roughness: 0.04,
    envMap: envMap,
    envMapIntensity: 2.8
  });
  const hingeMesh = new THREE.Mesh(hingeGeo, hingeMat);
  hingeMesh.rotation.z = Math.PI / 2;
  hingeMesh.position.set(0, 10, -82);
  group.add(hingeMesh);

  // Sleek Dark Matte Chiclet Keycaps with Metallic Accent Sheen
  const keyMat = new THREE.MeshStandardMaterial({ color: 0x181e28, roughness: 0.35, metalness: 0.2 });
  const keySpaceMat = new THREE.MeshStandardMaterial({ color: 0x121720, roughness: 0.35, metalness: 0.2 });

  const rows = [
    { y: 24, count: 14, width: 14.5, gap: 2.2 },  // Function keys
    { y: 12, count: 14, width: 14.5, gap: 2.2 },  // Numbers
    { y: 0,  count: 14, width: 14.5, gap: 2.2 },  // QWERTY
    { y: -12, count: 13, width: 15.8, gap: 2.2 }, // ASDF
    { y: -24, count: 12, width: 17.5, gap: 2.2 }  // ZXCV
  ];

  rows.forEach(r => {
    let startX = -((r.count * r.width + (r.count - 1) * r.gap) / 2) + r.width / 2;
    for (let i = 0; i < r.count; i++) {
      const kGeo = new THREE.BoxGeometry(r.width, 2.5, 9.5);
      const kMesh = new THREE.Mesh(kGeo, keyMat);
      kMesh.position.set(startX + i * (r.width + r.gap), 11.5, -20 + r.y);
      group.add(kMesh);
    }
  });

  // Spacebar
  const spacebarGeo = new THREE.BoxGeometry(92, 2.5, 9.5);
  const spacebarMesh = new THREE.Mesh(spacebarGeo, keySpaceMat);
  spacebarMesh.position.set(0, 11.5, -44);
  group.add(spacebarMesh);

  // Speaker Grilles on Left & Right of Keyboard Deck
  [-118, 118].forEach(spkX => {
    const spkGeo = new THREE.BoxGeometry(8, 0.8, 98);
    const spkMat = new THREE.MeshStandardMaterial({
      color: 0x2d3748,
      roughness: 0.3,
      metalness: 0.7,
      envMap: envMap,
      envMapIntensity: 1.2
    });
    const spkMesh = new THREE.Mesh(spkGeo, spkMat);
    spkMesh.position.set(spkX, 10.4, -20);
    group.add(spkMesh);
  });

  // Trackpad (Polished Satin Chrome with Chamfer)
  const padGeo = new THREE.BoxGeometry(84, 1.2, 52);
  const padMat = new THREE.MeshStandardMaterial({
    color: 0xdde4ec,
    roughness: 0.12,
    metalness: 0.92,
    envMap: envMap,
    envMapIntensity: 2.2
  });
  const padMesh = new THREE.Mesh(padGeo, padMat);
  padMesh.position.set(-20, 10.4, 48);
  group.add(padMesh);

  // AMD RYZEN Palm Rest Badge (Bottom Right - matching reference image)
  const ryzenGeo = new THREE.PlaneGeometry(16, 12);
  const ryzenCanvas = document.createElement('canvas');
  ryzenCanvas.width = 64; ryzenCanvas.height = 48;
  const rCtx = ryzenCanvas.getContext('2d');
  rCtx.fillStyle = '#0f172a'; rCtx.fillRect(0, 0, 64, 48);
  rCtx.fillStyle = '#dc2626'; rCtx.fillRect(44, 28, 20, 20);
  rCtx.fillStyle = '#ffffff'; rCtx.font = '900 12px sans-serif'; rCtx.fillText('AMD', 6, 20);
  rCtx.font = 'bold 9px sans-serif'; rCtx.fillText('RYZEN', 6, 36);
  const ryzenTex = new THREE.CanvasTexture(ryzenCanvas);
  const ryzenMat = new THREE.MeshStandardMaterial({ map: ryzenTex, roughness: 0.3 });
  const ryzenMesh = new THREE.Mesh(ryzenGeo, ryzenMat);
  ryzenMesh.position.set(96, 10.6, 52);
  ryzenMesh.rotation.x = -Math.PI / 2;
  group.add(ryzenMesh);

  // Laptop Screen Display Lid (90-DEGREE UPRIGHT ANGLE)
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 10, -82);
  lidGroup.rotation.x = 0; // Exactly 90 degrees upright perpendicular to table
  group.add(lidGroup);

  // Silver Screen Outer Bezel Frame
  const lidFrameGeo = new THREE.BoxGeometry(270, 172, 8);
  const lidFrameMesh = new THREE.Mesh(lidFrameGeo, lapBaseMat);
  lidFrameMesh.position.set(0, 86, 0);
  lidFrameMesh.castShadow = true;
  lidGroup.add(lidFrameMesh);

  // Dark Inner Bezel Frame (matching reference image)
  const innerBezelGeo = new THREE.PlaneGeometry(262, 164);
  const innerBezelMat = new THREE.MeshStandardMaterial({ color: 0x141822, roughness: 0.6 });
  const innerBezelMesh = new THREE.Mesh(innerBezelGeo, innerBezelMat);
  innerBezelMesh.position.set(0, 86, 4.1);
  lidGroup.add(innerBezelMesh);

  // Lenovo Logo on Bottom Center Bezel (matching reference image)
  const lenovoGeo = new THREE.PlaneGeometry(24, 6);
  const lenovoCanvas = document.createElement('canvas');
  lenovoCanvas.width = 96; lenovoCanvas.height = 24;
  const lCtx = lenovoCanvas.getContext('2d');
  lCtx.clearRect(0, 0, 96, 24);
  lCtx.fillStyle = '#94a3b8';
  lCtx.font = 'bold 16px sans-serif';
  lCtx.textAlign = 'center';
  lCtx.fillText('Lenovo', 48, 18);
  const lenovoTex = new THREE.CanvasTexture(lenovoCanvas);
  const lenovoMat = new THREE.MeshBasicMaterial({ map: lenovoTex, transparent: true });
  const lenovoMesh = new THREE.Mesh(lenovoGeo, lenovoMat);
  lenovoMesh.position.set(0, 8, 4.4);
  lidGroup.add(lenovoMesh);

  // ── USER'S CUSTOM UPLOADED WALLPAPER & UBUNTU TERMINAL CANVAS (ULTRA HIGH-DPI 2560x1600) ──
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 2560;
  screenCanvas.height = 1600;
  const sCtx = screenCanvas.getContext('2d');

  const screenTex = new THREE.CanvasTexture(screenCanvas);
  screenTex.generateMipmaps = true;
  screenTex.minFilter = THREE.LinearMipmapLinearFilter;
  screenTex.magFilter = THREE.LinearFilter;

  function drawLaptopScreenDisplay(wallpaperImg) {
    sCtx.clearRect(0, 0, 2560, 1600);

    if (wallpaperImg && wallpaperImg.complete && wallpaperImg.naturalWidth !== 0) {
      // Draw user's exact uploaded anime sky & clouds wallpaper
      sCtx.drawImage(wallpaperImg, 0, 0, 2560, 1600);
    } else {
      // High-Contrast Cyan Sky Gradient Fallback
      const skyGrad = sCtx.createLinearGradient(0, 0, 0, 1600);
      skyGrad.addColorStop(0, '#0083a0');
      skyGrad.addColorStop(0.5, '#00b4d8');
      skyGrad.addColorStop(0.85, '#48cae4');
      skyGrad.addColorStop(1.0, '#0077b6');
      sCtx.fillStyle = skyGrad;
      sCtx.fillRect(0, 0, 2560, 1600);
    }

    // 2. Ubuntu Top Panel Bar with Real-Time Clock
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const timeStr = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}  ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    sCtx.fillStyle = 'rgba(3, 10, 20, 0.92)';
    sCtx.fillRect(0, 0, 2560, 96);
    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 44px sans-serif';
    sCtx.fillText(timeStr, 48, 66);
    sCtx.fillStyle = '#94a3b8';
    sCtx.fillText('────────  ●  ────────', 1040, 66);
    sCtx.fillStyle = '#ffffff';
    sCtx.fillText('Apps   Net   Vol   Bat   Power', 1920, 66);

    // 3. Floating High-Contrast Ubuntu/Linux Terminal Window (2560x1600 scale)
    const twX = 48, twY = 128, twW = 2464, twH = 1320;
    // Terminal Shadow
    sCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    sCtx.fillRect(twX + 20, twY + 20, twW, twH);
    // Terminal Body Frame (Deep Pitch Black)
    sCtx.fillStyle = 'rgba(6, 9, 18, 0.96)';
    sCtx.fillRect(twX, twY, twW, twH);
    sCtx.strokeStyle = '#00f0ff';
    sCtx.lineWidth = 5;
    sCtx.strokeRect(twX, twY, twW, twH);

    // Terminal Header Bar (Dark Slate)
    sCtx.fillStyle = '#0f172a';
    sCtx.fillRect(twX, twY, twW, 104);

    // Windows Style Window Controls on Top-Right (─ ☐ ✕)
    const btnX = twX + twW - 280;
    sCtx.fillStyle = '#cbd5e1';
    sCtx.font = 'bold 48px sans-serif';
    sCtx.fillText('─', btnX, twY + 68);
    sCtx.fillText('☐', btnX + 88, twY + 68);
    sCtx.fillStyle = '#dc2626';
    sCtx.fillRect(btnX + 176, twY + 18, 80, 68);
    sCtx.fillStyle = '#ffffff';
    sCtx.fillText('✕', btnX + 198, twY + 68);

    sCtx.fillStyle = '#f8fafc';
    sCtx.font = 'bold 44px monospace';
    sCtx.textAlign = 'center';
    sCtx.fillText('jaden@jaden-ubuntu: ~', twX + (twW - 280) / 2, twY + 70);

    // Terminal Prompt & Executed Command
    sCtx.textAlign = 'left';
    sCtx.fillStyle = '#10b981'; // Neon Green
    sCtx.font = 'bold 44px "Courier New", monospace';
    sCtx.fillText('╭─[jaden] as jaden-d-syiem in ~', twX + 48, twY + 176);
    sCtx.fillStyle = '#10b981';
    sCtx.fillText('╰─>', twX + 48, twY + 236);
    sCtx.fillStyle = '#00f0ff';
    sCtx.fillText(' neofetch', twX + 160, twY + 236);

    // Left Side Clean Anime Character ASCII Art (Vibrant Cyan)
    sCtx.fillStyle = '#00f0ff';
    sCtx.font = '700 30px monospace';
    const asciiLines = [
      "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿",
      "⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠛⠛⠉⠉⠉⠙⠻⣅⠀⠈⢧⠀⠈⠛⠉⠉⢻⣿",
      "⣿⣿⣿⣿⣿⣿⠿⠋⠀⠀⠀⠀⠀⠀⠀⠀⣤⡶⠟⠀⠀⣈⠓⢤⣶⡶⠿⠛⠻",
      "⣿⣿⣿⣿⣿⢣⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣀⣴⠶⠿⠿⢷⡄⠀⠀⢀⣤⣾",
      "⣿⣿⣿⣿⣡⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣦⣤⣤⡀⠀⢷⡀⠀⠀⣻⣿",
      "⣿⣿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡈⠛⠶⠛⠃⠈⠈⢿⣿",
      "⣿⣿⠟⠘⠀⠀⠀⠀⠀⠀⠀⠀⢀⡆⠀⠀⠀⠀⠀⠀⣧⠀⠀⠀⠀⠀⠀⠈⣿",
      "⣿⠏⠀⠁⠀⠀⠀⠀⠀⠀⠀⢀⣶⡄⠀⠀⠀⠀⠀⠀⣡⣄⣿⡆⠀⠀⠀⠀⣿",
      "⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠚⠛⠛⢛⣲⣶⣿⣷⣉⠉⢉⣥⡄⠀⠀⠀⠨⣿",
      "⡇⢠⡆⠀⠀⢰⠀⠀⠀⠀⢸⣿⣧⣠⣿⣿⣿⣿⣿⣿⣷⣾⣿⡅⠀⠀⡄⠠⢸",
      "⣧⠸⣇⠀⠀⠘⣤⡀⠀⠀⠘⣿⣿⣿⣿⣿⠟⠛⠻⣿⣿⣿⡿⢁⠀⠀⢰⠀⢸",
      "⣿⣷⣽⣦⠀⠀⠙⢷⡀⠀⠀⠙⠻⠿⢿⣷⣾⣿⣶⠾⢟⣥⣾⣿⣧⠀⠂⢀⣿",
      "⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿"
    ];
    asciiLines.forEach((line, i) => {
      sCtx.fillText(line, twX + 40, twY + 304 + i * 64);
    });

    // Right Side Layout Block Area
    const fbX = twX + 920;
    const fbW = 1492;

    // 1. Top User Box (matching screenshot 1: box around jaden-d-syiem@jaden-ubuntu)
    const userBoxY = twY + 288;
    const userBoxH = 110;
    sCtx.strokeStyle = '#00f0ff';
    sCtx.lineWidth = 5;
    sCtx.strokeRect(fbX, userBoxY, fbW, userBoxH);

    sCtx.fillStyle = '#00f0ff';
    sCtx.font = '900 48px monospace';
    sCtx.textAlign = 'center';
    sCtx.fillText('jaden-d-syiem@jaden-ubuntu', fbX + fbW / 2, userBoxY + 72);

    // 2. Pac-Man & 5 Ghosts Row
    const pacY = userBoxY + 170;
    const pacStartX = fbX + fbW / 2 - 240;
    // Pac-Man
    sCtx.fillStyle = '#fbbf24';
    sCtx.beginPath();
    sCtx.arc(pacStartX, pacY, 26, 0.2 * Math.PI, 1.8 * Math.PI);
    sCtx.lineTo(pacStartX, pacY);
    sCtx.fill();

    // 5 Ghosts
    const ghostColors = ['#ef4444', '#06b6d4', '#10b981', '#c084fc', '#3b82f6'];
    ghostColors.forEach((gColor, gi) => {
      const gx = pacStartX + 96 + gi * 88;
      sCtx.fillStyle = gColor;
      sCtx.beginPath();
      sCtx.arc(gx, pacY - 6, 22, Math.PI, 0);
      sCtx.lineTo(gx + 22, pacY + 22);
      sCtx.lineTo(gx - 22, pacY + 22);
      sCtx.fill();

      // Ghost Eyes
      sCtx.fillStyle = '#ffffff';
      sCtx.beginPath();
      sCtx.arc(gx - 8, pacY - 8, 6.4, 0, Math.PI * 2);
      sCtx.arc(gx + 8, pacY - 8, 6.4, 0, Math.PI * 2);
      sCtx.fill();

      sCtx.fillStyle = '#000000';
      sCtx.beginPath();
      sCtx.arc(gx - 6, pacY - 8, 3.2, 0, Math.PI * 2);
      sCtx.arc(gx + 10, pacY - 8, 3.2, 0, Math.PI * 2);
      sCtx.fill();
    });

    // 3. Info Block Outline Box
    const infoBoxY = userBoxY + 224;
    const infoBoxH = 690;
    sCtx.strokeStyle = '#00f0ff';
    sCtx.lineWidth = 5;
    sCtx.strokeRect(fbX, infoBoxY, fbW, infoBoxH);

    // Styled Fastfetch Info Content with Sub-tree Arrows (╰┈➤)
    const fetchLines = [
      { isCat: true,  cat: 'KERNEL',      arrow: '───────────>', val: 'Linux 6.8.0-ubuntu' },
      { isCat: false, sub: 'Distro',      arrow: '────────> ',  val: 'Ubuntu 24.04.5 LTS x86_64' },
      { isCat: false, sub: 'Shell',       arrow: '─────────> ', val: 'zsh 5.9' },

      { isCat: true,  cat: 'EDUCATION',   arrow: '──────────>',  val: 'B.E. CS & Engg (GPA 8.0/10)' },
      { isCat: false, sub: 'College',     arrow: '────────> ',  val: 'KCG Tech, Chennai' },

      { isCat: true,  cat: 'EXPERIENCE',  arrow: '─────────>',  val: 'NIC, Datayug, NEHU, BSNL' },

      { isCat: true,  cat: 'STACK',       arrow: '────────────>', val: 'Node.js, React, Python, C++, SQL' },

      { isCat: true,  cat: 'PROJECTS',    arrow: '───────────>', val: 'Poké Guide, F1 Entropy, Stellar' },

      { isCat: true,  cat: 'IEEE PAPER',  arrow: '──────────>',  val: 'AI Doc Q&A (IEEE 10894448)' },
      { isCat: false, sub: 'Contact',     arrow: '────────> ',  val: 'jadedsyiem@gmail.com | D-Jaden' }
    ];

    sCtx.textAlign = 'left';
    sCtx.font = 'bold 32px monospace';

    fetchLines.forEach((item, i) => {
      const lineY = infoBoxY + 60 + i * 62;

      if (item.isCat) {
        sCtx.fillStyle = '#38bdf8';
        sCtx.fillText(item.cat, fbX + 32, lineY);

        sCtx.fillStyle = '#0284c7';
        sCtx.fillText(item.arrow, fbX + 350, lineY);

        sCtx.fillStyle = '#ffffff';
        sCtx.fillText(item.val, fbX + 750, lineY);
      } else {
        sCtx.fillStyle = '#00f0ff';
        sCtx.fillText('╰┈➤', fbX + 32, lineY);

        sCtx.fillStyle = '#f8fafc';
        sCtx.fillText(item.sub, fbX + 140, lineY);

        sCtx.fillStyle = '#0284c7';
        sCtx.fillText(item.arrow, fbX + 370, lineY);

        sCtx.fillStyle = '#e2e8f0';
        sCtx.fillText(item.val, fbX + 660, lineY);
      }
    });

    // 4. ULTRA HIGH-RENDITION macOS / Ubuntu Floating Translucent Glass Dock Bar (Matching Reference Image 1)
    const dockX = 480, dockY = 1440, dockW = 1600, dockH = 136;

    // Glass Outer Glow & Ambient Reflection
    sCtx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    drawRRect(sCtx, dockX, dockY, dockW, dockH, 48);
    sCtx.fill();
    sCtx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    sCtx.lineWidth = 4;
    drawRRect(sCtx, dockX, dockY, dockW, dockH, 48);
    sCtx.stroke();

    // App Icons matching Image 1: Firefox, Files (grey/blue folder), Spotify, Brave, VS Code, Pulse (green badge '3'), Terminal, SSD, Trash, Ubuntu
    const dockApps = [
      { type: 'firefox', active: true },
      { type: 'files', active: true },
      { type: 'spotify', active: false },
      { type: 'brave', active: true },
      { type: 'vscode', active: false },
      { type: 'pulse', active: true, badge: '3' },
      { type: 'terminal', active: true },
      { type: 'ssd', active: false },
      { type: 'trash', active: false },
      { type: 'ubuntu', active: false }
    ];

    dockApps.forEach((app, i) => {
      const ax = dockX + 56 + i * 148;
      const ay = dockY + 28;

      if (app.type === 'firefox') {
        sCtx.fillStyle = '#f97316'; ctxCircle(sCtx, ax + 40, ay + 40, 36); sCtx.fill();
        sCtx.fillStyle = '#0284c7'; ctxCircle(sCtx, ax + 40, ay + 40, 20); sCtx.fill();
        sCtx.fillStyle = '#eab308'; ctxCircle(sCtx, ax + 48, ay + 28, 16); sCtx.fill();
      } else if (app.type === 'files') {
        // Files folder icon matching Image 1 (Grey folder with blue top tab)
        sCtx.fillStyle = '#0284c7'; drawRRect(sCtx, ax + 4, ay + 8, 72, 24, 8); sCtx.fill();
        sCtx.fillStyle = '#94a3b8'; drawRRect(sCtx, ax, ay + 20, 80, 56, 12); sCtx.fill();
        sCtx.strokeStyle = '#475569'; sCtx.lineWidth = 3; drawRRect(sCtx, ax, ay + 20, 80, 56, 12); sCtx.stroke();
        sCtx.fillStyle = '#ffffff'; sCtx.fillRect(ax + 20, ay + 40, 40, 6);
      } else if (app.type === 'spotify') {
        sCtx.fillStyle = '#1db954'; ctxCircle(sCtx, ax + 40, ay + 40, 36); sCtx.fill();
        sCtx.strokeStyle = '#000000'; sCtx.lineWidth = 5;
        sCtx.beginPath(); sCtx.arc(ax + 40, ay + 44, 22, -0.6 * Math.PI, -0.1 * Math.PI); sCtx.stroke();
        sCtx.beginPath(); sCtx.arc(ax + 40, ay + 52, 16, -0.6 * Math.PI, -0.1 * Math.PI); sCtx.stroke();
      } else if (app.type === 'brave') {
        sCtx.fillStyle = '#ff5000'; drawRRect(sCtx, ax + 4, ay + 4, 72, 72, 20); sCtx.fill();
        sCtx.fillStyle = '#ffffff'; sCtx.font = 'bold 32px sans-serif'; sCtx.textAlign = 'center'; sCtx.fillText('🦁', ax + 40, ay + 52);
      } else if (app.type === 'vscode') {
        sCtx.fillStyle = '#007acc'; drawRRect(sCtx, ax + 4, ay + 4, 72, 72, 16); sCtx.fill();
        sCtx.fillStyle = '#ffffff'; sCtx.font = '900 36px sans-serif'; sCtx.textAlign = 'center'; sCtx.fillText('✕', ax + 40, ay + 52);
      } else if (app.type === 'pulse') {
        sCtx.fillStyle = '#181824'; drawRRect(sCtx, ax + 4, ay + 4, 72, 72, 16); sCtx.fill();
        sCtx.strokeStyle = '#38bdf8'; sCtx.lineWidth = 5;
        sCtx.beginPath(); sCtx.arc(ax + 40, ay + 48, 24, Math.PI, 0); sCtx.stroke();
        if (app.badge) {
          sCtx.fillStyle = '#16a34a'; ctxCircle(sCtx, ax + 64, ay + 16, 16); sCtx.fill();
          sCtx.fillStyle = '#ffffff'; sCtx.font = 'bold 20px sans-serif'; sCtx.textAlign = 'center'; sCtx.fillText(app.badge, ax + 64, ay + 22);
        }
      } else if (app.type === 'terminal') {
        sCtx.fillStyle = '#334155'; drawRRect(sCtx, ax + 4, ay + 4, 72, 72, 16); sCtx.fill();
        sCtx.fillStyle = '#ffffff'; sCtx.font = 'bold 28px monospace'; sCtx.textAlign = 'center'; sCtx.fillText('>_', ax + 40, ay + 48);
      } else if (app.type === 'ssd') {
        sCtx.fillStyle = '#94a3b8'; drawRRect(sCtx, ax + 8, ay + 4, 64, 72, 12); sCtx.fill();
        sCtx.fillStyle = '#475569'; sCtx.font = 'bold 20px monospace'; sCtx.textAlign = 'center'; sCtx.fillText('SSD', ax + 40, ay + 52);
      } else if (app.type === 'trash') {
        sCtx.fillStyle = '#cbd5e1'; drawRRect(sCtx, ax + 8, ay + 8, 64, 64, 12); sCtx.fill();
        sCtx.fillStyle = '#16a34a'; sCtx.font = 'bold 28px sans-serif'; sCtx.textAlign = 'center'; sCtx.fillText('♻', ax + 40, ay + 52);
      } else if (app.type === 'ubuntu') {
        sCtx.fillStyle = '#ffffff'; ctxCircle(sCtx, ax + 40, ay + 40, 32); sCtx.fill();
        sCtx.fillStyle = '#ea580c'; ctxCircle(sCtx, ax + 40, ay + 40, 20); sCtx.fill();
      }

      // Active indicator dot under open apps
      if (app.active) {
        sCtx.fillStyle = '#ffffff';
        ctxCircle(sCtx, ax + 40, dockY + dockH - 12, 5);
        sCtx.fill();
      }
    });

    screenTex.needsUpdate = true;
  }

  // Initial draw
  drawLaptopScreenDisplay(null);

  // Load user's custom uploaded wallpaper image
  const wpImg = new Image();
  wpImg.onload = () => {
    drawLaptopScreenDisplay(wpImg);
  };
  wpImg.src = 'laptop_wallpaper.png';

  // ── DEEP RICH MESH BASIC MATERIAL FOR MAXIMUM COLOR CONTRAST ──
  const screenMat = new THREE.MeshBasicMaterial({
    map: screenTex
  });
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(252, 156), screenMat);
  screenMesh.position.set(0, 86, 4.3);
  lidGroup.add(screenMesh);

  return group;
}

// ── REALISTIC ORGANIC BONSAI TREE (SMOOTH GNARLED WOOD TRUNK & FULL CANOPY) ──
function createNormalOrganicBonsaiPlant() {
  const group = new THREE.Group();

  // 1. Glazed Navy Ceramic Planter Trough
  const potGeo = new THREE.CylinderGeometry(68, 54, 44, 32);
  const potMat = new THREE.MeshStandardMaterial({
    color: 0x16202c,
    roughness: 0.2,
    metalness: 0.15
  });
  const potMesh = new THREE.Mesh(potGeo, potMat);
  potMesh.position.y = 22;
  potMesh.castShadow = true;
  potMesh.receiveShadow = true;
  group.add(potMesh);

  // Polished Rim Lip
  const rimGeo = new THREE.TorusGeometry(68, 4.5, 16, 32);
  rimGeo.rotateX(Math.PI / 2);
  const rimMesh = new THREE.Mesh(rimGeo, potMat);
  rimMesh.position.y = 44;
  group.add(rimMesh);

  // Soil Base & Moss Mounds
  const soilGeo = new THREE.CylinderGeometry(62, 62, 8, 32);
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x1a120b, roughness: 0.95 });
  const soilMesh = new THREE.Mesh(soilGeo, soilMat);
  soilMesh.position.y = 43;
  group.add(soilMesh);

  const mossMat1 = new THREE.MeshStandardMaterial({ color: 0x234e1d, roughness: 0.8 });
  const mossMat2 = new THREE.MeshStandardMaterial({ color: 0x38782a, roughness: 0.8 });
  [[-24, 14, mossMat1], [28, -14, mossMat2], [10, 26, mossMat1], [-20, -22, mossMat2]].forEach(([mx, mz, mMat]) => {
    const mossGeo = new THREE.SphereGeometry(15, 16, 16);
    const mossMesh = new THREE.Mesh(mossGeo, mMat);
    mossMesh.scale.set(1, 0.28, 1);
    mossMesh.position.set(mx, 47, mz);
    group.add(mossMesh);
  });

  // 2. Smooth Continuous Gnarled Wood Trunk using Spline Tube Geometry
  const barkMat = new THREE.MeshStandardMaterial({
    color: 0x3d2314,
    roughness: 0.85,
    metalness: 0.05
  });

  const trunkPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 44, 0),
    new THREE.Vector3(12, 72, 4),
    new THREE.Vector3(-8, 102, 10),
    new THREE.Vector3(16, 128, -2),
    new THREE.Vector3(28, 150, -8)
  ]);

  const trunkGeo = new THREE.TubeGeometry(trunkPath, 32, 14, 16, false);
  const trunkMesh = new THREE.Mesh(trunkGeo, barkMat);
  trunkMesh.castShadow = true;
  group.add(trunkMesh);

  // Secondary Branch Spreads
  const b1Path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-8, 102, 10),
    new THREE.Vector3(-34, 122, 22),
    new THREE.Vector3(-52, 134, 28)
  ]);
  const b1Geo = new THREE.TubeGeometry(b1Path, 16, 8, 12, false);
  group.add(new THREE.Mesh(b1Geo, barkMat));

  const b2Path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(16, 128, -2),
    new THREE.Vector3(42, 138, -18),
    new THREE.Vector3(60, 146, -26)
  ]);
  const b2Geo = new THREE.TubeGeometry(b2Path, 16, 7, 12, false);
  group.add(new THREE.Mesh(b2Geo, barkMat));

  // 3. Dense Multi-Tiered Foliage Clouds
  const fMat1 = new THREE.MeshStandardMaterial({ color: 0x0c381c, roughness: 0.55 });
  const fMat2 = new THREE.MeshStandardMaterial({ color: 0x155d31, roughness: 0.5 });
  const fMat3 = new THREE.MeshStandardMaterial({ color: 0x248644, roughness: 0.45 });

  const foliageClouds = [
    // Top Apex Crown Cloud
    { pos: [28, 164, -8], scale: [56, 24, 56], mat: fMat1 },
    { pos: [32, 172, -12], scale: [46, 22, 46], mat: fMat2 },
    { pos: [24, 180, -4], scale: [36, 18, 36], mat: fMat3 },
    // Left Branch Cloud
    { pos: [-52, 142, 28], scale: [48, 22, 48], mat: fMat1 },
    { pos: [-58, 148, 24], scale: [38, 18, 38], mat: fMat2 },
    // Right Branch Cloud
    { pos: [60, 154, -26], scale: [46, 20, 46], mat: fMat1 },
    { pos: [66, 160, -28], scale: [36, 16, 36], mat: fMat2 }
  ];

  foliageClouds.forEach(c => {
    const fGeo = new THREE.SphereGeometry(1, 22, 22);
    const fMesh = new THREE.Mesh(fGeo, c.mat);
    fMesh.position.set(...c.pos);
    fMesh.scale.set(...c.scale);
    fMesh.castShadow = true;
    fMesh.receiveShadow = true;
    group.add(fMesh);
  });

  return group;
}

// ── HIGH-QUALITY CRAFTSMAN PENCIL ──
function createHighQualityCraftsmanPencil() {
  const group = new THREE.Group();

  const shaftGeo = new THREE.CylinderGeometry(3.5, 3.5, 140, 6);
  const shaftMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35 });
  const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
  shaftMesh.rotation.z = Math.PI / 2;
  shaftMesh.castShadow = true;
  group.add(shaftMesh);

  const ferruleGeo = new THREE.CylinderGeometry(3.7, 3.7, 14, 16);
  const ferruleMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
  const ferruleMesh = new THREE.Mesh(ferruleGeo, ferruleMat);
  ferruleMesh.rotation.z = Math.PI / 2;
  ferruleMesh.position.x = -75;
  group.add(ferruleMesh);

  const eraserGeo = new THREE.CylinderGeometry(3.6, 3.6, 12, 16);
  const eraserMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });
  const eraserMesh = new THREE.Mesh(eraserGeo, eraserMat);
  eraserMesh.rotation.z = Math.PI / 2;
  eraserMesh.position.x = -86;
  eraserMesh.castShadow = true;
  group.add(eraserMesh);

  const coneGeo = new THREE.ConeGeometry(3.5, 16, 16);
  const coneMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.7 });
  const coneMesh = new THREE.Mesh(coneGeo, coneMat);
  coneMesh.rotation.z = -Math.PI / 2;
  coneMesh.position.x = 78;
  group.add(coneMesh);

  const tipGeo = new THREE.ConeGeometry(1.4, 5, 16);
  const tipMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.5 });
  const tipMesh = new THREE.Mesh(tipGeo, tipMat);
  tipMesh.rotation.z = -Math.PI / 2;
  tipMesh.position.x = 87;
  group.add(tipMesh);

  return group;
}

// ── HIGH-QUALITY PRECISION UTILITY CUTTER / BLADE ──
function createHighQualityUtilityKnife() {
  const group = new THREE.Group();

  const bodyGeo = new THREE.BoxGeometry(95, 9, 14);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  const gripGeo = new THREE.BoxGeometry(50, 9.8, 12);
  const gripMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const gripMesh = new THREE.Mesh(gripGeo, gripMat);
  gripMesh.position.set(-12, 0, 0);
  group.add(gripMesh);

  const sliderGeo = new THREE.BoxGeometry(14, 12, 8);
  const sliderMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
  const sliderMesh = new THREE.Mesh(sliderGeo, sliderMat);
  sliderMesh.position.set(10, 3, 0);
  group.add(sliderMesh);

  const bladeGeo = new THREE.BoxGeometry(24, 2, 8);
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.95, roughness: 0.1 });
  const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
  bladeMesh.position.set(56, 0, 0);
  bladeMesh.rotation.z = -0.15;
  bladeMesh.castShadow = true;
  group.add(bladeMesh);

  return group;
}

let isAboutThreeInitialized = false;

function initAboutThreeScene() {
  if (isAboutThreeInitialized) return;
  const container = document.getElementById('about-webgl-container');
  if (!container) return;
  if (typeof THREE === 'undefined') {
    setTimeout(initAboutThreeScene, 100);
    return;
  }
  isAboutThreeInitialized = true;

  container.innerHTML = '';
  const w = container.offsetWidth || window.innerWidth;
  const h = container.offsetHeight || window.innerHeight;

  aboutScene = new THREE.Scene();

  const aspect = w / h;
  const isPortrait = aspect < 1;
  const initialZ = isPortrait
    ? Math.round(820 * (1.25 / Math.max(aspect, 0.35)))
    : 820;
  const initialX = isPortrait ? 60 : 0;
  const initialY = isPortrait ? 100 : 45;

  aboutCamera = new THREE.PerspectiveCamera(40, aspect, 1, 4500);
  aboutCamera.position.set(initialX, initialY, initialZ);
  aboutCamera.lookAt(isPortrait ? 60 : 0, 45, 0);

  aboutRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  aboutRenderer.setSize(w, h);
  aboutRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  aboutRenderer.shadowMap.enabled = true;
  aboutRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  aboutRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  aboutRenderer.toneMappingExposure = 1.18;

  container.appendChild(aboutRenderer.domElement);

  raycaster = new THREE.Raycaster();
  mouseVec = new THREE.Vector2();

  // Vibrant Studio Lighting (Punchy Dynamic Contrast & Warm Saturation)
  const ambLight = new THREE.AmbientLight(0xfff8ed, 0.85);
  aboutScene.add(ambLight);

  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.55);
  sunLight.position.set(400, 950, 650);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.bias = -0.0001;
  aboutScene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0xd0e0ff, 0.55);
  fillLight.position.set(-500, 600, 450);
  aboutScene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffeedd, 0.70);
  rimLight.position.set(0, 750, -280);
  aboutScene.add(rimLight);

  // Dedicated soft warm-white wall wash light ensuring the pegboard is bright, crisp, and vibrant
  const pegboardWashLight = new THREE.PointLight(0xfffaed, 0.65, 1600);
  pegboardWashLight.position.set(0, 260, 50);
  aboutScene.add(pegboardWashLight);

  // Procedural Studio Softbox Reflection Map shared across all studio objects
  const sharedStudioEnvMap = createStudioChromeEnvMap();

  // 1. Rich Scandinavian Honey Oak Studio Table Top with Natural Grain Sheen (Slightly Darker Walnut Finish)
  const tableGeo = new THREE.BoxGeometry(2400, 80, 850);
  const tableMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    map: createProceduralWoodTexture(),
    roughness: 0.34,
    metalness: 0.04,
    envMap: sharedStudioEnvMap,
    envMapIntensity: 0.32
  });
  const tableMesh = new THREE.Mesh(tableGeo, tableMat);
  tableMesh.position.set(0, -160, 100);
  tableMesh.receiveShadow = true;
  tableMesh.castShadow = true;
  aboutScene.add(tableMesh);

  // Table Front Lip / Edge
  const lipGeo = new THREE.BoxGeometry(2400, 95, 28);
  const lipMat = new THREE.MeshStandardMaterial({
    color: 0x482914,
    roughness: 0.40,
    metalness: 0.04,
    envMap: sharedStudioEnvMap,
    envMapIntensity: 0.3
  });
  const lipMesh = new THREE.Mesh(lipGeo, lipMat);
  lipMesh.position.set(0, -245, 520);
  aboutScene.add(lipMesh);

  // 2. High-Fidelity Studio White Pegboard Wall Background
  const pegboardGeo = new THREE.PlaneGeometry(2800, 1400);
  const pegboardMat = new THREE.MeshStandardMaterial({
    color: 0xfcfdfd,
    map: createProceduralPegboardTexture(),
    roughness: 0.28,
    metalness: 0.02,
    emissive: 0xffffff,
    emissiveIntensity: 0.12,
    envMap: sharedStudioEnvMap,
    envMapIntensity: 0.25
  });
  const pegboardMesh = new THREE.Mesh(pegboardGeo, pegboardMat);
  pegboardMesh.position.set(0, 240, -350);
  pegboardMesh.receiveShadow = false; // Disables muddy desk shadow falloff on the white wall
  aboutScene.add(pegboardMesh);

  // 4. Elan Dark Forest Green Grid Cutting Mat
  const matGeo = new THREE.PlaneGeometry(780, 530);
  const matMat = new THREE.MeshStandardMaterial({
    map: createProceduralCuttingMatTexture(),
    color: 0x5a7d66,
    roughness: 0.72,
    metalness: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2
  });
  const matMesh = new THREE.Mesh(matGeo, matMat);
  matMesh.position.set(220, -116, 120);
  matMesh.rotation.x = -Math.PI / 2;
  matMesh.receiveShadow = true;
  aboutScene.add(matMesh);

  // 5. PURE WHITE CERAMIC COFFEE CUP WITH BLACK SHARPIE MARKER NAME 'JADEN' (NO EMOJI) & CORK COASTER
  const coasterGeo = new THREE.CylinderGeometry(80, 80, 14, 32);
  const coasterMat = new THREE.MeshStandardMaterial({ color: 0xc29357, roughness: 0.9 });
  const coasterMesh = new THREE.Mesh(coasterGeo, coasterMat);
  coasterMesh.position.set(-260, -113, 180);
  coasterMesh.castShadow = true;
  coasterMesh.receiveShadow = true;
  aboutScene.add(coasterMesh);

  // Pure Glossy White Porcelain Ceramic Coffee Cup Body
  const cupBodyGeo = new THREE.CylinderGeometry(58, 44, 135, 32);
  const cupBodyMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: createProceduralCoffeeCupTexture(),
    roughness: 0.15,
    metalness: 0.05
  });
  const cupBodyMesh = new THREE.Mesh(cupBodyGeo, cupBodyMat);
  cupBodyMesh.position.set(-260, -38, 180);
  cupBodyMesh.rotation.y = Math.PI / 2; // Rotate so 'Jaden' marker name faces camera directly!
  cupBodyMesh.castShadow = true;
  aboutScene.add(cupBodyMesh);

  // Dark Pitch Black Matte Cup Lid
  const cupLidGeo = new THREE.CylinderGeometry(62, 62, 16, 32);
  const cupLidMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.2 });
  const cupLidMesh = new THREE.Mesh(cupLidGeo, cupLidMat);
  cupLidMesh.position.set(-260, 36, 180);
  cupLidMesh.castShadow = true;
  aboutScene.add(cupLidMesh);

  // 6. High-Quality Studio Props: Realistic Organic Bonsai Plant & Designer Stationery
  const plant3D = createNormalOrganicBonsaiPlant();
  plant3D.position.set(-370, -70, 130);
  aboutScene.add(plant3D);

  const pencil3D = createHighQualityCraftsmanPencil();
  pencil3D.position.set(-80, -115, 200);
  pencil3D.rotation.y = 0.35;
  aboutScene.add(pencil3D);

  const knife3D = createHighQualityUtilityKnife();
  knife3D.position.set(40, -114, 220);
  knife3D.rotation.y = 0.15;
  aboutScene.add(knife3D);

  // 6b. Liquid Metallic Chrome 3D Laptop resting on cutting mat
  const laptop3D = create3DDeskOpenLaptop(sharedStudioEnvMap);
  laptop3D.position.set(220, -114, 90);
  laptop3D.rotation.y = -0.22; // Angled slightly towards the left facing the coffee cup
  laptop3D.name = 'laptop';
  aboutScene.add(laptop3D);

  // ── 7. HIGH-QUALITY INTERACTIVE STUDIO OBJECTS (GREEN BOARD ON LEFT & KEYBOARD ON RIGHT) ──
  interactiveFigurines = [];

  // 1. High-Quality 3D Framed Street-Art Sticker Board (Wall-Mounted to the Left)
  const greenBoard3D = create3DGreenBoard(sharedStudioEnvMap);
  greenBoard3D.position.set(-270, 140, -310);
  greenBoard3D.name = 'greenBoard';
  aboutScene.add(greenBoard3D);
  interactiveFigurines.push(greenBoard3D);

  // 2. High-Quality 3D Mechanical Keyboard (Wall-Mounted to the Right)
  const keyboard3D = createHighQuality3DKeyboard();
  keyboard3D.position.set(160, 140, -310);
  keyboard3D.name = 'keyboard';
  aboutScene.add(keyboard3D);
  interactiveFigurines.push(keyboard3D);

  // 3. Ultra-Realistic Chromish Studio Headphones (Mounted Further to the Right on Peg Hook)
  const pegHook3D = create3DWallPegHook(sharedStudioEnvMap);
  pegHook3D.position.set(510, 210, -346);
  aboutScene.add(pegHook3D);

  const headphones3D = create3DChromeHeadphones(sharedStudioEnvMap);
  headphones3D.position.set(510, 150, -314);
  headphones3D.name = 'headphones';
  aboutScene.add(headphones3D);
  interactiveFigurines.push(headphones3D);

  // 4. Interactive Laptop
  interactiveFigurines.push(laptop3D);

  // ── 3D RAYCASTER & MOUSE DRAG CONTROLS FOR ALL FIGURINES ──
  const canvasEl = aboutRenderer.domElement;
  let dragPlaneMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3000, 3000),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  aboutScene.add(dragPlaneMesh);

  let offset = new THREE.Vector3();

  // ── GREEN BOARD, LAPTOP & HEADPHONES CLICK-TO-FRONT ZOOM INTERACTION ──
  let isGreenBoardZoomed = false;
  const defaultGreenBoardPos = new THREE.Vector3(-270, 140, -310);
  const zoomedGreenBoardPos = new THREE.Vector3(0, 45, 320);
  let targetGreenBoardPos = defaultGreenBoardPos.clone();
  let targetGreenBoardScale = 1.0;

  let isLaptopZoomed = false;
  const defaultLaptopPos = new THREE.Vector3(220, -114, 90);
  const zoomedLaptopPos = new THREE.Vector3(0, 15, 460);
  let targetLaptopPos = defaultLaptopPos.clone();
  let targetLaptopScale = 1.0;
  let targetLaptopRotX = 0;
  let targetLaptopRotY = -0.12;

  let isHeadphonesZoomed = false;
  const defaultHeadphonesPos = new THREE.Vector3(510, 150, -314);
  const zoomedHeadphonesPos = new THREE.Vector3(0, 160, 310);
  let targetHeadphonesPos = defaultHeadphonesPos.clone();
  let targetHeadphonesScale = 1.0;

  const headphonesAudio = document.getElementById('headphonesAudio');
  const headphonesAudio2 = document.getElementById('headphonesAudio2');
  const nowPlayingPill = document.getElementById('nowPlayingPill');
  const nowPlayingLabel = nowPlayingPill ? nowPlayingPill.querySelector('span') : null;

  const songs = [
    {
      id: 0,
      el: headphonesAudio,
      title: 'FAMJAM4000',
      artist: 'Jordan Ward // FORWARD',
      label: 'NOW PLAYING: JORDAN WARD — FAMJAM4000',
      shortLabel: 'JORDAN WARD — FAMJAM4000'
    },
    {
      id: 1,
      el: headphonesAudio2,
      title: 'I KNOW HOW YOU GET',
      artist: 'Mk.gee // Dream Police',
      label: 'NOW PLAYING: MK.GEE — I KNOW HOW YOU GET SOMETIMES',
      shortLabel: 'MK.GEE — I KNOW HOW YOU GET SOMETIMES'
    }
  ];
  let currentSongIdx = 0;
  let isAudioPlaying = false;
  let activeAudio = null;

  function updatePlayerUI() {
    const song = songs[currentSongIdx];
    const playIcon = document.getElementById('audioPlayIcon');
    const pauseIcon = document.getElementById('audioPauseIcon');
    const labelEl = document.getElementById('nowPlayingLabel') || (nowPlayingPill ? nowPlayingPill.querySelector('span') : null);

    if (labelEl) {
      labelEl.textContent = (isAudioPlaying ? 'NOW PLAYING: ' : 'PAUSED: ') + song.shortLabel;
    }

    if (nowPlayingPill) {
      if (isAudioPlaying) {
        nowPlayingPill.classList.remove('is-paused');
      } else {
        nowPlayingPill.classList.add('is-paused');
      }
    }

    if (playIcon && pauseIcon) {
      if (isAudioPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
      } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
      }
    }

    if (headphones3D && headphones3D.userData && headphones3D.userData.renderMp3) {
      headphones3D.userData.currentTrack = song;
      headphones3D.userData.isAudioPlaying = isAudioPlaying;
      headphones3D.userData.renderMp3(isHeadphonesZoomed);
    }
  }

  function playSongAtIndex(idx, resetTime = false) {
    currentSongIdx = idx;
    const song = songs[currentSongIdx];

    // Pause any other audio
    songs.forEach((s, i) => {
      if (i !== currentSongIdx && s.el) {
        s.el.pause();
        s.el.currentTime = 0;
      }
    });

    activeAudio = song.el;
    if (activeAudio) {
      if (resetTime) {
        activeAudio.currentTime = 0;
      }
      activeAudio.play()
        .then(() => {
          isAudioPlaying = true;
          updatePlayerUI();
        })
        .catch(err => {
          console.warn('Audio playback waiting for gesture:', err);
          isAudioPlaying = false;
          updatePlayerUI();
        });
    }

    isAudioPlaying = true;
    updatePlayerUI();
    if (nowPlayingPill) nowPlayingPill.classList.add('is-active');
  }

  function togglePlayPause() {
    if (isAudioPlaying) {
      if (activeAudio) activeAudio.pause();
      isAudioPlaying = false;
      updatePlayerUI();
    } else {
      if (!activeAudio) {
        playSongAtIndex(currentSongIdx, false);
      } else {
        activeAudio.play()
          .then(() => {
            isAudioPlaying = true;
            updatePlayerUI();
          })
          .catch(e => console.warn(e));
      }
    }
  }

  function nextSong() {
    const nextIdx = (currentSongIdx + 1) % songs.length;
    playSongAtIndex(nextIdx, true);
  }

  function revSong() {
    if (activeAudio && activeAudio.currentTime > 2.5) {
      activeAudio.currentTime = 0;
      if (!isAudioPlaying) {
        activeAudio.play().then(() => { isAudioPlaying = true; updatePlayerUI(); }).catch(e => console.warn(e));
      }
    } else {
      const prevIdx = (currentSongIdx - 1 + songs.length) % songs.length;
      playSongAtIndex(prevIdx, true);
    }
  }

  function startHeadphonesAudio() {
    // Requirements: starts with Fam Jam 4000 Jordan Ward (index 0)
    if (!activeAudio || activeAudio.currentTime === 0) {
      currentSongIdx = 0;
    }
    playSongAtIndex(currentSongIdx, false);
  }

  function stopHeadphonesAudio() {
    if (activeAudio) {
      activeAudio.pause();
    }
    isAudioPlaying = false;
    updatePlayerUI();
    if (nowPlayingPill) nowPlayingPill.classList.remove('is-active');
  }

  // Auto-advance to next song on ended
  songs.forEach(song => {
    if (song.el) {
      song.el.addEventListener('ended', () => {
        nextSong();
      });
    }
  });

  // Attach controls to now playing pill buttons
  const revBtn = document.getElementById('audioRevBtn');
  const playPauseBtn = document.getElementById('audioPlayPauseBtn');
  const nextBtn = document.getElementById('audioNextBtn');

  if (revBtn) {
    revBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      revSong();
    });
  }
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlayPause();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSong();
    });
  }

  let mouseDownX = 0, mouseDownY = 0;

  canvasEl.addEventListener('mousemove', (e) => {
    const rect = canvasEl.getBoundingClientRect();
    mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    mouseX = mouseVec.x;
    mouseY = mouseVec.y;

    raycaster.setFromCamera(mouseVec, aboutCamera);

    if (isDraggingFigurine && selectedFigurine) {
      const intersects = raycaster.intersectObject(dragPlaneMesh);
      if (intersects.length > 0) {
        const targetPos = intersects[0].point.sub(offset);
        dragVelocity.subVectors(targetPos, selectedFigurine.position);
        selectedFigurine.position.copy(targetPos);
        
        // Tilt figurine slightly based on drag motion velocity
        selectedFigurine.rotation.z = -dragVelocity.x * 0.04;
        selectedFigurine.rotation.x = dragVelocity.y * 0.04;
      }
      return;
    }

    // Hover state over 3D figurines
    const hits = raycaster.intersectObjects(interactiveFigurines, true);
    if (hits.length > 0) {
      canvasEl.style.cursor = 'pointer';
      let parentObj = hits[0].object;
      while (parentObj.parent && parentObj.parent !== aboutScene) {
        parentObj = parentObj.parent;
      }
      interactiveFigurines.forEach(fig => {
        if (fig === parentObj) {
          if (
            (fig !== greenBoard3D || !isGreenBoardZoomed) &&
            (fig !== laptop3D || !isLaptopZoomed) &&
            (fig !== headphones3D || !isHeadphonesZoomed)
          ) {
            fig.scale.set(1.08, 1.08, 1.08);
          }
        } else if (
          (fig !== greenBoard3D || !isGreenBoardZoomed) &&
          (fig !== laptop3D || !isLaptopZoomed) &&
          (fig !== headphones3D || !isHeadphonesZoomed)
        ) {
          fig.scale.set(1, 1, 1);
        }
      });
    } else {
      canvasEl.style.cursor = 'default';
      interactiveFigurines.forEach(fig => {
        if (
          (fig !== greenBoard3D || !isGreenBoardZoomed) &&
          (fig !== laptop3D || !isLaptopZoomed) &&
          (fig !== headphones3D || !isHeadphonesZoomed)
        ) {
          fig.scale.set(1, 1, 1);
        }
      });
    }
  });

  canvasEl.addEventListener('mousedown', (e) => {
    mouseDownX = e.clientX;
    mouseDownY = e.clientY;

    const rect = canvasEl.getBoundingClientRect();
    mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouseVec, aboutCamera);
    const hits = raycaster.intersectObjects(interactiveFigurines, true);

    if (hits.length > 0) {
      isDraggingFigurine = true;
      let parentObj = hits[0].object;
      while (parentObj.parent && parentObj.parent !== aboutScene) {
        parentObj = parentObj.parent;
      }
      selectedFigurine = parentObj;
      canvasEl.style.cursor = 'grabbing';

      dragPlaneMesh.position.copy(selectedFigurine.position);
      dragPlaneMesh.lookAt(aboutCamera.position);

      const intersects = raycaster.intersectObject(dragPlaneMesh);
      if (intersects.length > 0) {
        offset.copy(intersects[0].point).sub(selectedFigurine.position);
      }
    }
  });

  canvasEl.addEventListener('click', (e) => {
    const clickDist = Math.hypot(e.clientX - mouseDownX, e.clientY - mouseDownY);
    if (clickDist > 6) return; // ignore if user was dragging

    const rect = canvasEl.getBoundingClientRect();
    mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouseVec, aboutCamera);
    const hits = raycaster.intersectObjects(interactiveFigurines, true);

    if (hits.length > 0) {
      let parentObj = hits[0].object;
      while (parentObj.parent && parentObj.parent !== aboutScene) {
        parentObj = parentObj.parent;
      }
      if (parentObj.name === 'greenBoard') {
        isGreenBoardZoomed = !isGreenBoardZoomed;
        if (isGreenBoardZoomed) {
          isLaptopZoomed = false;
          isHeadphonesZoomed = false;
        }
      } else if (parentObj.name === 'laptop') {
        isLaptopZoomed = !isLaptopZoomed;
        if (isLaptopZoomed) {
          isGreenBoardZoomed = false;
          isHeadphonesZoomed = false;
        }
      } else if (parentObj.name === 'headphones') {
        if (!isHeadphonesZoomed) {
          isGreenBoardZoomed = false;
          isLaptopZoomed = false;
          isHeadphonesZoomed = true;
          startHeadphonesAudio();
        } else {
          // Headphones are already zoomed - check if MP3 player or controls were clicked
          let hitObj = hits[0].object;
          let isMp3Click = false;
          let curr = hitObj;
          while (curr && curr !== headphones3D) {
            if (curr.name === 'mp3Wheel' || curr.name === 'mp3CenterBtn' || curr.name === 'mp3Screen' || curr.name === 'mp3Player') {
              isMp3Click = true;
              break;
            }
            curr = curr.parent;
          }

          if (hitObj.name === 'mp3CenterBtn' || hitObj.name === 'mp3Screen') {
            togglePlayPause();
          } else if (hitObj.name === 'mp3Wheel') {
            const localPoint = hitObj.worldToLocal(hits[0].point.clone());
            if (localPoint.x > 3) {
              nextSong();
            } else if (localPoint.x < -3) {
              revSong();
            } else {
              togglePlayPause();
            }
          } else if (isMp3Click) {
            togglePlayPause();
          } else {
            // Clicked outside MP3 player on headphones body: unzoom
            isHeadphonesZoomed = false;
            stopHeadphonesAudio();
          }
        }
      } else {
        isGreenBoardZoomed = false;
        isLaptopZoomed = false;
        if (isHeadphonesZoomed) stopHeadphonesAudio();
        isHeadphonesZoomed = false;
      }
    } else {
      isGreenBoardZoomed = false;
      isLaptopZoomed = false;
      if (isHeadphonesZoomed) stopHeadphonesAudio();
      isHeadphonesZoomed = false;
    }

    const isMobileAspect = window.innerWidth <= 768;
    if (isGreenBoardZoomed) {
      targetGreenBoardPos.copy(isMobileAspect ? new THREE.Vector3(0, 90, 750) : zoomedGreenBoardPos);
      targetGreenBoardScale = isMobileAspect ? 1.35 : 1.05;
    } else {
      targetGreenBoardPos.copy(defaultGreenBoardPos);
      targetGreenBoardScale = 1.0;
    }

    if (isHeadphonesZoomed) {
      targetHeadphonesPos.copy(isMobileAspect ? new THREE.Vector3(0, 140, 850) : zoomedHeadphonesPos);
      targetHeadphonesScale = isMobileAspect ? 1.15 : 0.85;
    } else {
      targetHeadphonesPos.copy(defaultHeadphonesPos);
      targetHeadphonesScale = 1.0;
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isGreenBoardZoomed) {
        isGreenBoardZoomed = false;
        targetGreenBoardPos.copy(defaultGreenBoardPos);
        targetGreenBoardScale = 1.0;
      }
      if (isLaptopZoomed) {
        isLaptopZoomed = false;
      }
      if (isHeadphonesZoomed) {
        isHeadphonesZoomed = false;
        stopHeadphonesAudio();
        targetHeadphonesPos.copy(defaultHeadphonesPos);
        targetHeadphonesScale = 1.0;
      }
    }
  });

  window.addEventListener('mouseup', () => {
    if (isDraggingFigurine) {
      isDraggingFigurine = false;
      if (selectedFigurine) {
        selectedFigurine.rotation.z = 0;
        selectedFigurine.rotation.x = 0;
      }
      selectedFigurine = null;
      canvasEl.style.cursor = 'default';
    }
  });

  // ── TOUCH SUPPORT FOR MOBILE (3D About Canvas) ──
  let touchStartX = 0, touchStartY = 0;

  canvasEl.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;

    const rect = canvasEl.getBoundingClientRect();
    mouseVec.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((t.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouseVec, aboutCamera);
    const hits = raycaster.intersectObjects(interactiveFigurines, true);

    if (hits.length > 0) {
      let parentObj = hits[0].object;
      while (parentObj.parent && parentObj.parent !== aboutScene) {
        parentObj = parentObj.parent;
      }
      selectedFigurine = parentObj;
      dragPlaneMesh.position.copy(selectedFigurine.position);
      dragPlaneMesh.lookAt(aboutCamera.position);
      const intersects = raycaster.intersectObject(dragPlaneMesh);
      if (intersects.length > 0) {
        offset.copy(intersects[0].point).sub(selectedFigurine.position);
      }
    }
  }, { passive: true });

  canvasEl.addEventListener('touchmove', (e) => {
    // On mobile devices, prioritize natural page scrolling over dragging
    if (window.innerWidth <= 768) return;

    const t = e.touches[0];
    const dist = Math.hypot(t.clientX - touchStartX, t.clientY - touchStartY);

    if (selectedFigurine && dist > 18) {
      isDraggingFigurine = true;
      const rect = canvasEl.getBoundingClientRect();
      mouseVec.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((t.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, aboutCamera);
      const intersects = raycaster.intersectObject(dragPlaneMesh);
      if (intersects.length > 0) {
        const targetPos = intersects[0].point.sub(offset);
        dragVelocity.subVectors(targetPos, selectedFigurine.position);
        selectedFigurine.position.copy(targetPos);
        selectedFigurine.rotation.z = -dragVelocity.x * 0.04;
        selectedFigurine.rotation.x = dragVelocity.y * 0.04;
      }
    }
  }, { passive: true });

  canvasEl.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dist = Math.hypot(t.clientX - touchStartX, t.clientY - touchStartY);

    if (isDraggingFigurine) {
      isDraggingFigurine = false;
      if (selectedFigurine) {
        selectedFigurine.rotation.z = 0;
        selectedFigurine.rotation.x = 0;
      }
      selectedFigurine = null;
    }

    // Treat short touches (< 16px movement) as taps
    if (dist < 16) {
      const rect = canvasEl.getBoundingClientRect();
      mouseVec.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((t.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, aboutCamera);
      const hits = raycaster.intersectObjects(interactiveFigurines, true);

      if (hits.length > 0) {
        let parentObj = hits[0].object;
        while (parentObj.parent && parentObj.parent !== aboutScene) {
          parentObj = parentObj.parent;
        }
        if (parentObj.name === 'greenBoard') {
          isGreenBoardZoomed = !isGreenBoardZoomed;
          if (isGreenBoardZoomed) { isLaptopZoomed = false; isHeadphonesZoomed = false; }
        } else if (parentObj.name === 'laptop') {
          isLaptopZoomed = !isLaptopZoomed;
          if (isLaptopZoomed) { isGreenBoardZoomed = false; isHeadphonesZoomed = false; }
        } else if (parentObj.name === 'headphones') {
          if (!isHeadphonesZoomed) {
            isGreenBoardZoomed = false;
            isLaptopZoomed = false;
            isHeadphonesZoomed = true;
            startHeadphonesAudio();
          } else {
            let hitObj = hits[0].object;
            let isMp3Click = false;
            let curr = hitObj;
            while (curr && curr !== headphones3D) {
              if (curr.name === 'mp3Wheel' || curr.name === 'mp3CenterBtn' || curr.name === 'mp3Screen' || curr.name === 'mp3Player') {
                isMp3Click = true;
                break;
              }
              curr = curr.parent;
            }

            if (hitObj.name === 'mp3CenterBtn' || hitObj.name === 'mp3Screen') {
              togglePlayPause();
            } else if (hitObj.name === 'mp3Wheel') {
              const localPoint = hitObj.worldToLocal(hits[0].point.clone());
              if (localPoint.x > 3) {
                nextSong();
              } else if (localPoint.x < -3) {
                revSong();
              } else {
                togglePlayPause();
              }
            } else if (isMp3Click) {
              togglePlayPause();
            } else {
              isHeadphonesZoomed = false;
              stopHeadphonesAudio();
            }
          }
        } else {
          isGreenBoardZoomed = false;
          isLaptopZoomed = false;
          if (isHeadphonesZoomed) stopHeadphonesAudio();
          isHeadphonesZoomed = false;
        }
      } else {
        isGreenBoardZoomed = false;
        isLaptopZoomed = false;
        if (isHeadphonesZoomed) stopHeadphonesAudio();
        isHeadphonesZoomed = false;
      }

      const isMobileAspect = window.innerWidth <= 768;
      if (isGreenBoardZoomed) {
        targetGreenBoardPos.copy(isMobileAspect ? new THREE.Vector3(0, 90, 750) : zoomedGreenBoardPos);
        targetGreenBoardScale = isMobileAspect ? 1.35 : 1.05;
      } else {
        targetGreenBoardPos.copy(defaultGreenBoardPos);
        targetGreenBoardScale = 1.0;
      }
      if (isHeadphonesZoomed) {
        targetHeadphonesPos.copy(isMobileAspect ? new THREE.Vector3(0, 140, 850) : zoomedHeadphonesPos);
        targetHeadphonesScale = isMobileAspect ? 1.15 : 0.85;
      } else {
        targetHeadphonesPos.copy(defaultHeadphonesPos);
        targetHeadphonesScale = 1.0;
      }
    }
  }, { passive: true });


  const laptopScreenCamPos = new THREE.Vector3(190, -18, 225);
  const laptopScreenLookAt = new THREE.Vector3(238, -18, 10);
  const defaultCamLookAt = new THREE.Vector3(0, 20, 0);

  function animateAboutScene() {
    requestAnimationFrame(animateAboutScene);

    if (greenBoard3D && (!isDraggingFigurine || selectedFigurine !== greenBoard3D)) {
      greenBoard3D.position.lerp(targetGreenBoardPos, 0.08);
      const currentScale = greenBoard3D.scale.x;
      const nextScale = THREE.MathUtils.lerp(currentScale, targetGreenBoardScale, 0.08);
      greenBoard3D.scale.set(nextScale, nextScale, nextScale);
    }

    if (headphones3D && (!isDraggingFigurine || selectedFigurine !== headphones3D)) {
      headphones3D.position.lerp(targetHeadphonesPos, 0.08);
      const currentScale = headphones3D.scale.x;
      const nextScale = THREE.MathUtils.lerp(currentScale, targetHeadphonesScale, 0.08);
      headphones3D.scale.set(nextScale, nextScale, nextScale);
      if (isHeadphonesZoomed) {
        // No rotation when zoomed - just hold steady for clean viewing
        headphones3D.rotation.y = THREE.MathUtils.lerp(headphones3D.rotation.y, 0.48, 0.04);
      } else {
        headphones3D.rotation.y = THREE.MathUtils.lerp(headphones3D.rotation.y, 0.48, 0.08);
        headphones3D.rotation.z = THREE.MathUtils.lerp(headphones3D.rotation.z, 0, 0.08);
        headphones3D.rotation.x = THREE.MathUtils.lerp(headphones3D.rotation.x, 0, 0.08);
      }
      if (headphones3D.userData && headphones3D.userData.renderMp3) {
        headphones3D.userData.renderMp3(isHeadphonesZoomed);
      }
    }

    if (isLaptopZoomed && aboutCamera) {
      // Fly camera directly into the laptop display screen
      aboutCamera.position.lerp(laptopScreenCamPos, 0.08);
      aboutCamera.lookAt(laptopScreenLookAt);
    } else if (aboutCamera && !isDraggingFigurine && !isGreenBoardZoomed && !isHeadphonesZoomed) {
      // Normal overview camera with subtle mouse parallax
      const aspect = (aboutRenderer.domElement.clientWidth || window.innerWidth) / (aboutRenderer.domElement.clientHeight || window.innerHeight);
      const isPortrait = aspect < 1;
      const baseZ = isPortrait
        ? Math.round(820 * (1.25 / Math.max(aspect, 0.35)))
        : 820;
      const targetX = isPortrait ? 60 : (mouseX * 35);
      const targetY = isPortrait ? 100 : (120 - mouseY * 25);
      const targetLookAt = isPortrait ? new THREE.Vector3(60, 45, 0) : defaultCamLookAt;
      aboutCamera.position.x += (targetX - aboutCamera.position.x) * 0.05;
      aboutCamera.position.y += (targetY - aboutCamera.position.y) * 0.05;
      aboutCamera.position.z += (baseZ - aboutCamera.position.z) * 0.05;
      aboutCamera.lookAt(targetLookAt);
    }
    aboutRenderer.render(aboutScene, aboutCamera);
  }
  animateAboutScene();

  window.addEventListener('resize', () => {
    if (!container || !aboutCamera || !aboutRenderer) return;
    const nw = container.offsetWidth || window.innerWidth;
    const nh = container.offsetHeight || window.innerHeight;
    aboutCamera.aspect = nw / nh;
    aboutCamera.updateProjectionMatrix();
    aboutRenderer.setSize(nw, nh);
  });
}

function initHeroContactForm() {
  const copyBtn = document.getElementById('hero-copy-email-btn');
  const emailText = document.getElementById('hero-email-text');
  if (copyBtn && emailText) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(emailText.textContent.trim()).then(() => {
        const origText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        copyBtn.style.background = '#10b981';
        copyBtn.style.color = '#ffffff';
        copyBtn.style.borderColor = '#10b981';
        setTimeout(() => {
          copyBtn.textContent = origText;
          copyBtn.style.background = 'transparent';
          copyBtn.style.color = '#1212B0';
          copyBtn.style.borderColor = '#1212B0';
        }, 2000);
      });
    });
  }

  const form = document.getElementById('hero-contact-form');
  const submitBtn = document.getElementById('hero-submit-btn');
  const txLog = document.getElementById('hero-tx-log');
  const txFill = document.getElementById('hero-tx-progress-fill');
  const txStatus = document.getElementById('hero-tx-status-text');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!submitBtn || !txLog) return;

      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
      txLog.classList.remove('hidden');
      txFill.style.width = '0%';
      txStatus.textContent = 'INITIALIZING TRANSMISSION PACKETS...';

      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        txFill.style.width = progress + '%';

        if (progress === 40) {
          txStatus.textContent = 'ENCRYPTING PAYLOAD WITH RSA-4096...';
        } else if (progress === 80) {
          txStatus.textContent = 'ROUTING TRANSMISSION TO JADEN D. SYIEM...';
        } else if (progress >= 100) {
          clearInterval(interval);
          txStatus.textContent = '✓ TRANSMISSION SUCCESSFUL! MESSAGE DELIVERED.';
          txStatus.style.color = '#10b981';
          submitBtn.querySelector('.btn-text').textContent = '[ TRANSMISSION SENT ]';
          form.reset();
          setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.querySelector('.btn-text').textContent = '[ TRANSMIT MESSAGE ]';
          }, 4000);
        }
      }, 400);
    });
  }
}

function bootApp() {
  try {
    const sweepOut = document.getElementById('page-sweep-out');
    if (sweepOut) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          sweepOut.classList.add('active');
        });
      });
    }
  } catch (e) { console.warn('sweepOut init error:', e); }
  
  try {
    const dims = buildRuler();
    buildGrid(dims);
  } catch (e) { console.warn('ruler init error:', e); }

  try { initStickyDrag(); } catch (e) { console.warn('sticky init error:', e); }
  try { initExperienceBillboard(); } catch (e) { console.warn('billboard init error:', e); }
  try { initScrollTriggeredDoors(); } catch (e) { console.warn('doors init error:', e); }
  try { initProjectsScrollTrigger(); } catch (e) { console.warn('projectsScrollTrigger init error:', e); }
  try { initAboutThreeScene(); } catch (e) { console.warn('aboutThree init error:', e); }
  try { initHeroContactForm(); } catch (e) { console.warn('contactForm init error:', e); }
  try { initInteractiveIDBadge(); } catch (e) { console.warn('idBadge init error:', e); }
}

function initProjectsScrollTrigger() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  
  gsap.registerPlugin(ScrollTrigger);

  const container = document.getElementById('heroDrawerContainer');
  const drawerBox = document.getElementById('drawerBox');
  const files = gsap.utils.toArray('.drawer-container .file-folder');

  if (!container || !drawerBox || files.length === 0) return;

  // Initial state setup:
  // Each file has height: 100% and y: 0.
  // File 0 is in front (zIndex: 40), active tab style, content opacity: 1.
  // Files 1, 2, 3 are stacked behind with lower zIndex, content opacity: 0.
  files.forEach((f, i) => {
    const content = f.querySelector('.folder-content');
    const tab = f.querySelector('.folder-tab');
    if (i === 0) {
      f.classList.add('is-active');
      gsap.set(f, { y: 0, opacity: 1, zIndex: 40 });
      if (tab) gsap.set(tab, { backgroundColor: '#ffffff', color: '#1212B0', borderBottomColor: '#ffffff' });
      if (content) gsap.set(content, { opacity: 1 });
    } else {
      f.classList.remove('is-active');
      gsap.set(f, { y: 0, opacity: 1, zIndex: 30 - i });
      if (tab) gsap.set(tab, { backgroundColor: '#f7f9ff', color: 'rgba(18, 18, 176, 0.75)', borderBottomColor: '#1212B0' });
      if (content) gsap.set(content, { opacity: 0 });
    }
  });

  const isMobile = window.innerWidth <= 768;
  const pinTopOffset = isMobile ? (window.innerWidth <= 480 ? 52 : 60) : 108;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: () => `top top+=${pinTopOffset}`,
      end: () => `bottom top+=${pinTopOffset + drawerBox.offsetHeight}`,
      scrub: 0.5,
      invalidateOnRefresh: true
    }
  });

  // Enable click on any tab to jump/scroll to that project smoothly
  files.forEach((f, i) => {
    const tab = f.querySelector('.folder-tab');
    if (tab) {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (tl && tl.scrollTrigger) {
          const st = tl.scrollTrigger;
          const totalProgress = i / (files.length - 1);
          const targetScroll = st.start + totalProgress * (st.end - st.start);
          window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      });
    }
  });

  const numTransitions = files.length - 1; // 3 transitions between the 4 files

  for (let i = 0; i < numTransitions; i++) {
    const prevFile = files[i];
    const prevContent = prevFile.querySelector('.folder-content');
    const prevTab = prevFile.querySelector('.folder-tab');
    
    const nextFile = files[i + 1];
    const nextContent = nextFile.querySelector('.folder-content');
    const nextTab = nextFile.querySelector('.folder-tab');
    const newZIndex = 40 + (i + 1) * 5;

    // 1. Reading hold for File i
    tl.to({}, { duration: 1.4 });

    // 2. Transition to File i + 1:
    // Ensure nextFile takes top zIndex and slides smoothly into focus
    tl.set(nextFile, { zIndex: newZIndex });

    // Toggle active class on files
    tl.call(() => {
      prevFile.classList.remove('is-active');
      nextFile.classList.add('is-active');
    }, null, '<');

    // Next file slides in with punchy presence from subtle y: 35 offset to y: 0
    tl.fromTo(nextFile,
      { y: 35, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
      '<'
    );

    // Tab highlight transition: active tab seamless white, inactive subtle tinted
    if (prevTab) {
      tl.to(prevTab, { backgroundColor: '#f7f9ff', color: 'rgba(18, 18, 176, 0.75)', borderBottomColor: '#1212B0', duration: 0.25 }, '<');
    }
    if (nextTab) {
      tl.to(nextTab, { backgroundColor: '#ffffff', color: '#1212B0', borderBottomColor: '#ffffff', duration: 0.25 }, '<');
    }

    // Cross-fade project content
    if (prevContent) {
      tl.to(prevContent, { opacity: 0, duration: 0.3 }, '<');
    }
    if (nextContent) {
      tl.to(nextContent, { opacity: 1, duration: 0.45 }, '<0.15');
    }
  }

  // Final hold for File 3 (F1 Entropy)
  tl.to({}, { duration: 1.4 });
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  bootApp();
} else {
  window.addEventListener('load', bootApp);
  document.addEventListener('DOMContentLoaded', bootApp);
}

function initInteractiveIDBadge() {
  const container = document.querySelector('.hanging-id-container');
  if (!container) return;

  let angle = -2;
  let angularVel = 0;
  let isDragging = false;
  let lastMouseX = 0;
  let dragDistance = 0;

  // Pendulum Physics Loop (Swings rope and badge together from top anchor)
  function updatePendulum() {
    if (!isDragging) {
      const springAcc = -0.4 * (angle - (-2));
      angularVel = (angularVel + springAcc * 0.1) * 0.95;
      angle += angularVel;
    }
    container.style.transform = `rotate(${angle.toFixed(2)}deg)`;
    requestAnimationFrame(updatePendulum);
  }
  requestAnimationFrame(updatePendulum);

  // Mouse Hover Inertia Physics
  container.addEventListener('mousemove', (e) => {
    if (!isDragging && lastMouseX !== 0) {
      const dx = e.clientX - lastMouseX;
      if (Math.abs(dx) > 1) {
        angularVel += dx * 0.08;
        angularVel = Math.max(-12, Math.min(12, angularVel));
      }
    }
    if (!isDragging) lastMouseX = e.clientX;
  });

  container.addEventListener('mouseleave', () => {
    lastMouseX = 0;
  });

  // Drag & Flick Physics
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    dragDistance = 0;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouseX;
    dragDistance += Math.abs(dx);
    angle += dx * 0.25;
    angle = Math.max(-45, Math.min(45, angle));
    angularVel = dx * 0.3;
    lastMouseX = e.clientX;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Click-to-Zoom Inspection View
  const clickTargets = [container, document.querySelector('.id-card-holder'), document.querySelector('.id-card')].filter(Boolean);
  clickTargets.forEach(t => {
    t.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dragDistance > 35) return;
      openIDBadgeModal();
    });
  });
}

function openIDBadgeModal() {
  let modal = document.getElementById('id-badge-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'id-badge-modal';
    modal.className = 'id-modal-overlay';
    const isHero = typeof window !== 'undefined' && window.location.pathname.includes('/hero/');
    const imgPath = isHero ? 'assets/lego_batman.png' : '../hero/assets/lego_batman.png';
    const sealPath = isHero ? 'assets/batman_seal.png' : '../hero/assets/batman_seal.png';

    modal.innerHTML = `
      <div class="id-modal-backdrop"></div>
      <div class="id-modal-container">
        <div class="id-modal-controls">
          <button class="id-modal-btn" id="flip-id-badge-btn">Flip Badge</button>
          <button class="id-modal-btn id-modal-close" id="close-id-badge-btn">✕ Close Inspection</button>
        </div>
        <div class="id-modal-card-flipper" id="modal-card-flipper">
          <div class="id-modal-card-front">
            <div class="id-card-top-bar">
              <span class="id-agency">JDS ARCHIVE SYSTEM</span>
              <span class="id-badge-no">PASS #2026-01</span>
            </div>
            <div class="id-card-body">
              <div class="id-photo-box">
                <img src="${imgPath}" alt="Lego Batman Avatar" class="id-photo-img" />
                <span class="id-photo-lbl">VERIFIED</span>
              </div>
              <div class="id-info-box">
                <div class="id-name">JADEN D. SYIEM</div>
                <div class="id-role">FULL STACK DEVELOPER</div>
                <div class="id-meta">
                  <div><span>DEPT:</span> CSE</div>
                  <div><span>CLEARANCE:</span> LEVEL 01</div>
                  <div><span>STATUS:</span> ACTIVE // OPEN</div>
                </div>
              </div>
            </div>
            <div class="id-card-footer">
              <div class="barcode">
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
              </div>
              <div class="barcode-num">98234-JDS-2026</div>
            </div>
          </div>

          <div class="id-modal-card-back">
            <div class="id-back-magstripe"></div>
            <div class="id-back-body">
              <div class="id-hologram-bat">
                <div class="bat-logo-icon">
                  <img src="${sealPath}" alt="Batman Emblem Seal" style="width: 52px; height: 30px; object-fit: contain; display: block; margin: 0 auto; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5));" />
                </div>
                <span>SEAL</span>
              </div>
              <div class="id-back-text">
                <p><strong>SECURITY CLEARANCE PASS</strong></p>
                <p>Property of JDS System Archives. Authorized personnel only. Return to comms station if found.</p>
                <div class="id-back-signature">Jaden D. Syiem</div>
              </div>
            </div>
            <div class="id-card-footer">
              <div class="barcode-num">AUTH-KEY: 99482-SYS-VOL01</div>
            </div>
          </div>
        </div>
        <div class="id-modal-hint">✦ CLICK BADGE OR FLIP BUTTON TO ROTATE 180°</div>
      </div>
    `;
    document.body.appendChild(modal);

    const flipper = document.getElementById('modal-card-flipper');
    const flipBtn = document.getElementById('flip-id-badge-btn');
    const closeBtn = document.getElementById('close-id-badge-btn');
    const backdrop = modal.querySelector('.id-modal-backdrop');

    let isFlipped = false;
    const toggleFlip = () => {
      isFlipped = !isFlipped;
      flipper.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
    };

    flipper.addEventListener('click', toggleFlip);
    flipBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      toggleFlip();
    });

    const closeModal = () => modal.classList.remove('active');
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
  }

  const flipper = document.getElementById('modal-card-flipper');
  if (flipper) flipper.style.transform = 'rotateY(0deg)';
  setTimeout(() => modal.classList.add('active'), 10);
}

window.addEventListener('resize', () => {
  document.getElementById('ruler-row').innerHTML = '';
  const dims = buildRuler();
  buildGrid(dims);
});

// Interactive Phone Mockup Screen Switcher
window.setPhoneScreen = function(imgId, src, btn) {
  const img = document.getElementById(imgId);
  if (!img) return;
  img.style.opacity = '0';
  setTimeout(() => {
    img.src = src;
    img.style.opacity = '1';
  }, 120);
  if (btn && btn.parentElement) {
    btn.parentElement.querySelectorAll('.phone-pill-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
};

// ── MACOS DOCK MAGNIFICATION (CodePen PwNeKZy Reference) ──
(function initMacDock() {
  const dock = document.querySelector('.glass-taskbar');
  if (!dock) return;
  const items = dock.querySelectorAll('.taskbar-item');
  if (!items.length) return;

  const maxDistance = 145;
  const maxScale = 1.62;
  const maxTranslateY = 18;

  dock.addEventListener('mousemove', (e) => {
    if ('ontouchstart' in window || window.innerWidth <= 768) return;
    const mouseX = e.clientX;
    items.forEach(item => {
      const rect = item.getBoundingClientRect();
      const itemCenterX = rect.left + rect.width / 2;
      const dist = Math.abs(mouseX - itemCenterX);

      if (dist < maxDistance) {
        const factor = Math.cos((dist / maxDistance) * (Math.PI / 2));
        const scale = 1 + (maxScale - 1) * factor;
        const y = -maxTranslateY * factor;
        if (window.gsap) {
          gsap.to(item, {
            scale: scale,
            y: y,
            duration: 0.16,
            ease: 'power1.out',
            overwrite: 'auto'
          });
        }
      } else {
        if (window.gsap) {
          gsap.to(item, {
            scale: 1,
            y: 0,
            duration: 0.22,
            ease: 'power1.out',
            overwrite: 'auto'
          });
        }
      }
    });
  });

  const resetItems = () => {
    if (window.gsap) {
      gsap.to(items, {
        scale: 1,
        y: 0,
        duration: 0.15,
        ease: 'power2.out',
        overwrite: 'all'
      });
    }
  };
  dock.addEventListener('mouseleave', resetItems);
  dock.addEventListener('touchstart', resetItems, { passive: true });
  dock.addEventListener('touchend', resetItems, { passive: true });
  dock.addEventListener('touchcancel', resetItems, { passive: true });

  // macOS Dock Click Bounce
  items.forEach(item => {
    item.addEventListener('click', (e) => {
      const isMobile = 'ontouchstart' in window || window.innerWidth <= 768;
      if (window.gsap) {
        if (isMobile) {
          gsap.to(items, { scale: 1, y: 0, duration: 0.1, overwrite: 'all' });
        } else {
          gsap.timeline({
            onComplete: () => {
              gsap.to(items, { scale: 1, y: 0, duration: 0.15, overwrite: 'auto' });
            }
          })
            .to(item, { y: -16, scale: 1.25, duration: 0.12, ease: 'power2.out' })
            .to(item, { y: 0, scale: 1, duration: 0.18, ease: 'bounce.out' });
        }
      }

      // If clicking Experience, About Me or Contact, trigger corresponding SVG shape overlay transition smoothly
      const href = item.getAttribute('href');
      if (href === '#aboutSection' && window.triggerShapeOverlays) {
        e.preventDefault();
        window.triggerShapeOverlays(() => {
          const target = document.getElementById('aboutSection');
          if (target) target.scrollIntoView({ behavior: 'instant' });
        }, 'ENTERING 3D STUDIO DESKTOP', 'SYSTEM SHIFT // ARCHIVE VOL.01');
      } else if (href === '#contactSection' && window.triggerContactShapeOverlays) {
        e.preventDefault();
        window.triggerContactShapeOverlays(() => {
          const target = document.getElementById('contactSection');
          if (target) target.scrollIntoView({ behavior: 'instant' });
        }, 'ENTERING CONTACT CONSOLE', 'COMMUNICATION PROTOCOL // ARCHIVE VOL.01');
      } else if (href === '#highwaySection' && window.triggerShapeOverlays) {
        e.preventDefault();
        window.triggerShapeOverlays(() => {
          const target = document.getElementById('highwaySection');
          if (target) target.scrollIntoView({ behavior: 'instant' });
        }, 'ENTERING NH 6 HIGHWAY', 'HIGHWAY ROUTE // ARCHIVE VOL.01');
      }
    });
  });
})();

// ── WAVY & DRIPPY LIQUID SHAPE OVERLAYS TRANSITION ──
function getDrippyShapePath(progress, layerIndex = 0) {
  if (progress <= 0) return 'M 0 100 L 100 100 V 100 H 0 Z';
  if (progress >= 2) return 'M 0 0 L 100 0 V 0 H 0 Z';

  const isEnter = progress <= 1;
  const v = isEnter ? progress : progress - 1;
  const baseY = 100 * (1 - v);
  const stretch = Math.sin(v * Math.PI);

  // Layer-specific offset for cascading multi-drip effect
  const layerOffsets = [0, 6.2, 12.8];
  const offset = layerOffsets[layerIndex % 3];

  const pts = [];
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;

    // Multi-harmonic sine waves
    const wave = Math.sin((x + offset) * 0.14) * 4.2 + Math.cos((x * 0.22) + offset * 0.5) * 3.0;

    // Organic viscous liquid drips
    const d1 = Math.exp(-Math.pow((x - (16 + (offset * 0.4))) / 5.5, 2)) * 14;
    const d2 = Math.exp(-Math.pow((x - (38 + (offset * 0.6))) / 7.0, 2)) * 22;
    const d3 = Math.exp(-Math.pow((x - (64 - (offset * 0.5))) / 6.0, 2)) * 18;
    const d4 = Math.exp(-Math.pow((x - (84 + (offset * 0.3))) / 7.5, 2)) * 25;
    const d5 = Math.exp(-Math.pow((x - (50 + (offset * 0.2))) / 5.0, 2)) * 10;

    // Edge taper so x=0 and x=100 stay clean at baseY
    const edgeTaper = Math.sin((x / 100) * Math.PI);
    const totalDrip = (wave + d1 + d2 + d3 + d4 + d5) * edgeTaper * stretch;

    const y = Math.max(-5, Math.min(105, baseY - totalDrip));
    pts.push({ x, y });
  }

  // Construct smooth SVG path using midpoint quad beziers
  let d = isEnter ? `M 0 100 V ${pts[0].y.toFixed(2)}` : `M 0 0 V ${pts[0].y.toFixed(2)}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const curr = pts[i];
    const next = pts[i + 1];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    d += ` Q ${curr.x.toFixed(2)} ${curr.y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`;

  if (isEnter) {
    d += ` V 100 H 0 Z`;
  } else {
    d += ` V 0 H 0 Z`;
  }
  return d;
}

// ── SVG SHAPE OVERLAYS TRANSITION (Experience -> About Me) ──
(function initShapeOverlaysTransition() {
  const transitionSection = document.getElementById('shapeOverlaysTransition');
  const p1 = document.getElementById('shapePath1');
  const p2 = document.getElementById('shapePath2');
  const p3 = document.getElementById('shapePath3');
  const caption = document.getElementById('shapeOverlaysCaption');
  const captionTitle = transitionSection ? transitionSection.querySelector('.shape-caption-title') : null;
  const captionTag = transitionSection ? transitionSection.querySelector('.shape-caption-tag') : null;

  if (!transitionSection || !p1 || !p2 || !p3) return;

  let isPlaying = false;

  function renderPaths(trigWave) {
    if (trigWave.val1 < 2) {
      p1.setAttribute('d', getDrippyShapePath(trigWave.val1, 0));
    } else {
      p1.setAttribute('d', 'M 0 0 L 100 0 V 0 H 0 Z');
    }
    if (trigWave.val2 < 2) {
      p2.setAttribute('d', getDrippyShapePath(trigWave.val2, 1));
    } else {
      p2.setAttribute('d', 'M 0 0 L 100 0 V 0 H 0 Z');
    }
    p3.setAttribute('d', getDrippyShapePath(trigWave.val3, 2));

    if (caption) {
      caption.style.opacity = trigWave.captionAlpha;
      caption.style.transform = `translate(-50%, -50%) translateY(${(1 - trigWave.captionAlpha) * 16}px)`;
    }
  }

  // Programmatic & Auto-scroll trigger
  window.triggerShapeOverlays = function(callback, customTitle, customTag) {
    if (isPlaying) {
      if (callback) callback();
      return;
    }
    if (!window.gsap) {
      if (callback) callback();
      return;
    }

    if (captionTitle) {
      captionTitle.textContent = customTitle || 'ENTERING 3D STUDIO DESKTOP';
    }
    if (captionTag) {
      captionTag.textContent = customTag || 'SYSTEM SHIFT // ARCHIVE VOL.01';
    }

    isPlaying = true;
    transitionSection.classList.add('is-active');

    const trigWave = { val1: 0, val2: 0, val3: 0, captionAlpha: 0 };
    renderPaths(trigWave);

    const tl = gsap.timeline({
      onUpdate: () => renderPaths(trigWave),
      onComplete: () => {
        transitionSection.classList.remove('is-active');
        trigWave.val1 = 0; trigWave.val2 = 0; trigWave.val3 = 0;
        renderPaths(trigWave);
        setTimeout(() => {
          isPlaying = false;
        }, 350);
      }
    });

    // Wave 1, 2, 3 sweep UP into white blanket (smooth, cinematic pacing)
    tl.to(trigWave, { val1: 1, duration: 0.72, ease: 'power2.inOut' }, 0)
      .to(trigWave, { val2: 1, duration: 0.72, ease: 'power2.inOut' }, 0.12)
      .to(trigWave, { val3: 1, duration: 0.72, ease: 'power2.inOut' }, 0.24)
      .to(trigWave, { captionAlpha: 1, duration: 0.35 }, 0.32)
      // Exactly at peak (0.96s): screen is pure white blanket
      .add(() => {
        // Zero out underlying blue/cyan layers completely so NO blue can ever show on exit
        trigWave.val1 = 2;
        trigWave.val2 = 2;
        p1.setAttribute('d', 'M 0 0 L 100 0 V 0 H 0 Z');
        p2.setAttribute('d', 'M 0 0 L 100 0 V 0 H 0 Z');
        if (callback) {
          callback();
        } else {
          const target = document.getElementById('aboutSection');
          if (target) target.scrollIntoView({ behavior: 'instant' });
        }
      }, 0.96)
      // Caption fades out, pure white liquid pulls smoothly away upwards, directly unveiling target section
      .to(trigWave, { captionAlpha: 0, duration: 0.28 }, 1.30)
      .to(trigWave, { val3: 2, duration: 0.76, ease: 'power2.inOut' }, 1.30);
  };

  // Automatic triggers for Experience <-> About Me
  if (window.ScrollTrigger) {
    // 1. Scrolling DOWN from Highway to About Me
    ScrollTrigger.create({
      trigger: '#highwaySection',
      start: 'bottom 85%',
      onEnter: () => {
        if (!isPlaying) {
          window.triggerShapeOverlays(() => {
            const target = document.getElementById('aboutSection');
            if (target) target.scrollIntoView({ behavior: 'instant' });
          }, 'ENTERING 3D STUDIO DESKTOP', 'SYSTEM SHIFT // ARCHIVE VOL.01');
        }
      }
    });

    // 2. Scrolling UP from About Me back to Highway
    ScrollTrigger.create({
      trigger: '#aboutSection',
      start: 'top 20%',
      onEnterBack: () => {
        if (!isPlaying) {
          window.triggerShapeOverlays(() => {
            const target = document.getElementById('highwaySection');
            if (target) target.scrollIntoView({ behavior: 'instant' });
          }, 'ENTERING NH 6 HIGHWAY', 'HIGHWAY ROUTE // ARCHIVE VOL.01');
        }
      }
    });
  }
})();

// ── CONTACT SVG SHAPE OVERLAYS TRANSITION (About Me <-> Contact) ──
(function initContactShapeOverlaysTransition() {
  const transitionSection = document.getElementById('contactShapeOverlaysTransition');
  const p1 = document.getElementById('contactShapePath1');
  const p2 = document.getElementById('contactShapePath2');
  const p3 = document.getElementById('contactShapePath3');
  const caption = document.getElementById('contactShapeOverlaysCaption');
  const captionTitle = transitionSection ? transitionSection.querySelector('.shape-caption-title') : null;
  const captionTag = transitionSection ? transitionSection.querySelector('.shape-caption-tag') : null;

  if (!transitionSection || !p1 || !p2 || !p3) return;

  let isPlaying = false;

  function renderPaths(trigWave) {
    if (trigWave.val1 < 2) {
      p1.setAttribute('d', getDrippyShapePath(trigWave.val1, 0));
    } else {
      p1.setAttribute('d', 'M 0 0 L 100 0 V 0 H 0 Z');
    }
    if (trigWave.val2 < 2) {
      p2.setAttribute('d', getDrippyShapePath(trigWave.val2, 1));
    } else {
      p2.setAttribute('d', 'M 0 0 L 100 0 V 0 H 0 Z');
    }
    p3.setAttribute('d', getDrippyShapePath(trigWave.val3, 2));

    if (caption) {
      caption.style.opacity = trigWave.captionAlpha;
      caption.style.transform = `translate(-50%, -50%) translateY(${(1 - trigWave.captionAlpha) * 16}px)`;
    }
  }

  // Programmatic & Auto-scroll trigger
  window.triggerContactShapeOverlays = function(callback, customTitle, customTag) {
    if (isPlaying) {
      if (callback) callback();
      return;
    }
    if (!window.gsap) {
      if (callback) callback();
      return;
    }

    if (captionTitle) {
      captionTitle.textContent = customTitle || 'ENTERING CONTACT CONSOLE';
    }
    if (captionTag) {
      captionTag.textContent = customTag || 'COMMUNICATION PROTOCOL // ARCHIVE VOL.01';
    }

    isPlaying = true;
    transitionSection.classList.add('is-active');

    const trigWave = { val1: 0, val2: 0, val3: 0, captionAlpha: 0 };
    renderPaths(trigWave);

    const tl = gsap.timeline({
      onUpdate: () => renderPaths(trigWave),
      onComplete: () => {
        transitionSection.classList.remove('is-active');
        trigWave.val1 = 0; trigWave.val2 = 0; trigWave.val3 = 0;
        renderPaths(trigWave);
        setTimeout(() => {
          isPlaying = false;
        }, 350);
      }
    });

    // Wave 1, 2, 3 sweep UP into white blanket
    tl.to(trigWave, { val1: 1, duration: 0.40, ease: 'power2.inOut' }, 0)
      .to(trigWave, { val2: 1, duration: 0.40, ease: 'power2.inOut' }, 0.05)
      .to(trigWave, { val3: 1, duration: 0.40, ease: 'power2.inOut' }, 0.10)
      .to(trigWave, { captionAlpha: 1, duration: 0.18 }, 0.18)
      // Exactly at peak (0.48s): screen is pure white blanket
      .add(() => {
        // Zero out underlying blue/cyan layers completely so NO blue can ever show on exit
        trigWave.val1 = 2;
        trigWave.val2 = 2;
        p1.setAttribute('d', 'M 0 0 L 100 0 V 0 H 0 Z');
        p2.setAttribute('d', 'M 0 0 L 100 0 V 0 H 0 Z');
        if (callback) {
          callback();
        } else {
          const target = document.getElementById('contactSection');
          if (target) target.scrollIntoView({ behavior: 'instant' });
        }
      }, 0.48)
      // Caption fades out, pure white liquid pulls smoothly away upwards, directly unveiling Contact Console!
      .to(trigWave, { captionAlpha: 0, duration: 0.16 }, 0.50)
      .to(trigWave, { val3: 2, duration: 0.44, ease: 'power2.inOut' }, 0.50);
  };

  // Automatic triggers for About Me <-> Contact
  if (window.ScrollTrigger) {
    // 1. Scrolling DOWN from About Me to Contact
    ScrollTrigger.create({
      trigger: '#aboutSection',
      start: 'bottom 85%',
      onEnter: () => {
        if (!isPlaying) {
          window.triggerContactShapeOverlays(() => {
            const target = document.getElementById('contactSection');
            if (target) target.scrollIntoView({ behavior: 'instant' });
          }, 'ENTERING CONTACT CONSOLE', 'COMMUNICATION PROTOCOL // ARCHIVE VOL.01');
        }
      }
    });

    // 2. Scrolling UP from Contact back to About Me
    ScrollTrigger.create({
      trigger: '#contactSection',
      start: 'top 20%',
      onEnterBack: () => {
        if (!isPlaying) {
          window.triggerContactShapeOverlays(() => {
            const target = document.getElementById('aboutSection');
            if (target) target.scrollIntoView({ behavior: 'instant' });
          }, 'ENTERING 3D STUDIO DESKTOP', 'SYSTEM SHIFT // ARCHIVE VOL.01');
        }
      }
    });
  }
})();

// ── GREENSOCK FOOTER BOUNCE (CodePen bGeZvpO / Cassie) ──
(function initFooterBounce() {
  const footer = document.getElementById('footerBounce') || document.querySelector('.footer-bounce-wrap');
  const path = footer ? footer.querySelector('.footer-bounce-path') : null;
  if (!footer || !window.ScrollTrigger) return;

  const pathObj = { y: 80 };

  function renderCurve() {
    if (path) {
      path.setAttribute('d', `M 0 80 Q 500 ${pathObj.y} 1000 80 L 1000 80 L 0 80 Z`);
    }
  }

  ScrollTrigger.create({
    trigger: footer,
    start: 'top bottom',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const velocity = self.getVelocity();
      // Dynamic velocity-driven rubber-band distortion
      const curveTarget = Math.max(10, Math.min(145, 80 + velocity * 0.038));
      gsap.to(pathObj, {
        y: curveTarget,
        duration: 0.18,
        ease: 'power2.out',
        overwrite: 'auto',
        onUpdate: renderCurve
      });
      // Elastic spring back to resting state
      gsap.to(pathObj, {
        y: 80,
        duration: 0.9,
        delay: 0.08,
        ease: 'elastic.out(1.2, 0.35)',
        overwrite: false,
        onUpdate: renderCurve
      });
    },
    onEnter: () => {
      // Satisfying physics overshoot bounce upon scrolling to bottom
      gsap.fromTo(footer,
        { y: 38 },
        { y: 0, duration: 1.05, ease: 'elastic.out(1.15, 0.35)', overwrite: 'auto' }
      );
      gsap.fromTo(pathObj,
        { y: 25 },
        { y: 80, duration: 1.15, ease: 'elastic.out(1.25, 0.32)', onUpdate: renderCurve, overwrite: 'auto' }
      );
    }
  });
})();
