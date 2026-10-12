// ── ARCHITECTURAL RULER GENERATOR ──
function buildRuler() {
  const ruler = document.getElementById('ruler-row');
  if (!ruler) return;
  ruler.innerHTML = '';
  const width = window.innerWidth;
  const tickSpacing = 10;
  const totalTicks = Math.floor(width / tickSpacing);

  for (let i = 0; i <= totalTicks; i++) {
    const tick = document.createElement('div');
    tick.className = 'ruler-tick';
    tick.style.left = (i * tickSpacing) + 'px';
    if (i % 10 === 0) {
      tick.style.height = '14px';
      const label = document.createElement('div');
      label.className = 'ruler-lbl';
      label.style.left = (i * tickSpacing + 3) + 'px';
      label.textContent = String(i * tickSpacing).padStart(4, '0');
      ruler.appendChild(label);
    } else if (i % 5 === 0) {
      tick.style.height = '9px';
    } else {
      tick.style.height = '5px';
    }
    ruler.appendChild(tick);
  }
}

buildRuler();
window.addEventListener('resize', buildRuler);

// ── CURSOR TRACKING BADGE ──
const badge = document.getElementById('cursor-badge');
document.addEventListener('mousemove', e => {
  if (!badge) return;
  badge.style.left = e.clientX + 'px';
  badge.style.top  = e.clientY + 'px';
  badge.textContent = `X:${String(Math.round(e.clientX)).padStart(4,'0')} Y:${String(Math.round(e.clientY)).padStart(4,'0')}`;
  badge.classList.add('visible');
});
document.addEventListener('mouseleave', () => badge && badge.classList.remove('visible'));

// ── COPY EMAIL TO CLIPBOARD ──
const copyBtn = document.getElementById('copy-email-btn');
const emailText = document.getElementById('email-text');
if (copyBtn && emailText) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(emailText.textContent.trim()).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied!';
      copyBtn.style.background = '#10b981';
      copyBtn.style.color = '#ffffff';
      copyBtn.style.borderColor = '#10b981';
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = 'transparent';
        copyBtn.style.color = '#1212B0';
        copyBtn.style.borderColor = '#1212B0';
      }, 2000);
    });
  });
}

// ── INTERACTIVE TERMINAL FORM TRANSMISSION ──
const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const txLog = document.getElementById('tx-log');
const txFill = document.getElementById('tx-progress-fill');
const txStatus = document.getElementById('tx-status-text');

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
      if (dragDistance > 35) return; // Ignore long drag releases
      openIDBadgeModal();
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInteractiveIDBadge);
} else {
  initInteractiveIDBadge();
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

// ── MACOS DOCK MAGNIFICATION (CodePen PwNeKZy Parity) ──
function initMacDock() {
  const dock = document.querySelector('.glass-taskbar');
  if (!dock) return;
  const items = dock.querySelectorAll('.taskbar-item');
  if (!items.length) return;

  const maxDistance = 145;
  const maxScale = 1.62;
  const maxTranslateY = 18;

  dock.addEventListener('mousemove', (e) => {
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

  dock.addEventListener('mouseleave', () => {
    if (window.gsap) {
      gsap.to(items, {
        scale: 1,
        y: 0,
        duration: 0.38,
        ease: 'power2.out',
        stagger: 0.02,
        overwrite: 'auto'
      });
    }
  });

  // macOS Dock Click Bounce
  items.forEach(item => {
    item.addEventListener('click', (e) => {
      if (window.gsap) {
        gsap.timeline()
          .to(item, { y: -24, scale: 1.4, duration: 0.15, ease: 'power2.out' })
          .to(item, { y: 0, scale: 1.05, duration: 0.22, ease: 'bounce.out' })
          .to(item, { y: -12, duration: 0.12, ease: 'power2.out' })
          .to(item, { y: 0, scale: 1, duration: 0.2, ease: 'bounce.out' });
      }

      const href = item.getAttribute('href');
      if (href && href !== 'contact.html' && !href.startsWith('mailto:')) {
        // Smoothly exit via wave if navigating to another page
        if (window.triggerContactPageExit) {
          e.preventDefault();
          window.triggerContactPageExit(() => {
            window.location.href = href;
          });
        }
      }
    });
  });
}

// ── SVG SHAPE OVERLAYS TRANSITION (Entry Curtain) ──
function initContactPageEntranceTransition() {
  const overlay = document.getElementById('contactPageEnterOverlay');
  const p1 = document.getElementById('contactPagePath1');
  const p2 = document.getElementById('contactPagePath2');
  const p3 = document.getElementById('contactPagePath3');
  const caption = document.getElementById('contactPageCaption');

  if (!overlay || !p1 || !p2 || !p3) return;

  function getDrippyShapePath(progress, layerIndex = 0) {
    if (progress <= 0) return 'M 0 100 L 100 100 V 100 H 0 Z';
    if (progress >= 2) return 'M 0 0 L 100 0 V 0 H 0 Z';

    const isEnter = progress <= 1;
    const v = isEnter ? progress : progress - 1;
    const baseY = 100 * (1 - v);
    const stretch = Math.sin(v * Math.PI);

    const layerOffsets = [0, 6.2, 12.8];
    const offset = layerOffsets[layerIndex % 3];

    const pts = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 100;
      const wave = Math.sin((x + offset) * 0.14) * 4.2 + Math.cos((x * 0.22) + offset * 0.5) * 3.0;
      const d1 = Math.exp(-Math.pow((x - (16 + (offset * 0.4))) / 5.5, 2)) * 14;
      const d2 = Math.exp(-Math.pow((x - (38 + (offset * 0.6))) / 7.0, 2)) * 22;
      const d3 = Math.exp(-Math.pow((x - (64 - (offset * 0.5))) / 6.0, 2)) * 18;
      const d4 = Math.exp(-Math.pow((x - (84 + (offset * 0.3))) / 7.5, 2)) * 25;
      const d5 = Math.exp(-Math.pow((x - (50 + (offset * 0.2))) / 5.0, 2)) * 10;
      const edgeTaper = Math.sin((x / 100) * Math.PI);
      const totalDrip = (wave + d1 + d2 + d3 + d4 + d5) * edgeTaper * stretch;
      const y = Math.max(-5, Math.min(105, baseY - totalDrip));
      pts.push({ x, y });
    }

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

  // Entrance sweep: starts with screen covered by liquid waves, then sweeps open
  if (window.gsap) {
    const enterWave = { val1: 1, val2: 1, val3: 1, captionAlpha: 1 };
    
    // Set initial covered state
    p1.setAttribute('d', getDrippyShapePath(1, 0));
    p2.setAttribute('d', getDrippyShapePath(1, 1));
    p3.setAttribute('d', getDrippyShapePath(1, 2));
    if (caption) caption.style.opacity = '1';

    gsap.timeline({
      delay: 0.1,
      onUpdate: () => {
        p1.setAttribute('d', getDrippyShapePath(enterWave.val1, 0));
        p2.setAttribute('d', getDrippyShapePath(enterWave.val2, 1));
        p3.setAttribute('d', getDrippyShapePath(enterWave.val3, 2));
        if (caption) {
          caption.style.opacity = enterWave.captionAlpha;
          caption.style.transform = `translate(-50%, -50%) translateY(${(1 - enterWave.captionAlpha) * 16}px)`;
        }
      },
      onComplete: () => {
        overlay.style.display = 'none';
      }
    })
    .to(enterWave, { captionAlpha: 0, duration: 0.3, ease: 'power2.out' }, 0.2)
    .to(enterWave, { val3: 2, duration: 0.8, ease: 'power2.inOut' }, 0.25)
    .to(enterWave, { val2: 2, duration: 0.8, ease: 'power2.inOut' }, 0.32)
    .to(enterWave, { val1: 2, duration: 0.8, ease: 'power2.inOut' }, 0.39);
  } else {
    overlay.style.display = 'none';
  }

  // Exit trigger when clicking links back
  window.triggerContactPageExit = function(callback) {
    if (!window.gsap) {
      if (callback) callback();
      return;
    }
    overlay.style.display = 'flex';
    const exitWave = { val1: 0, val2: 0, val3: 0, captionAlpha: 0 };
    gsap.timeline({
      onUpdate: () => {
        p1.setAttribute('d', getDrippyShapePath(exitWave.val1, 0));
        p2.setAttribute('d', getDrippyShapePath(exitWave.val2, 1));
        p3.setAttribute('d', getDrippyShapePath(exitWave.val3, 2));
        if (caption) {
          caption.style.opacity = exitWave.captionAlpha;
          caption.style.transform = `translate(-50%, -50%) translateY(${(1 - exitWave.captionAlpha) * 16}px)`;
        }
      },
      onComplete: () => {
        if (callback) callback();
      }
    })
    .to(exitWave, { val1: 1, duration: 0.7, ease: 'power2.inOut' }, 0)
    .to(exitWave, { val2: 1, duration: 0.7, ease: 'power2.inOut' }, 0.08)
    .to(exitWave, { val3: 1, duration: 0.7, ease: 'power2.inOut' }, 0.16)
    .to(exitWave, { captionAlpha: 1, duration: 0.25 }, 0.3);
  };
}

// ── GREENSOCK FOOTER BOUNCE (CodePen bGeZvpO / Cassie) ──
function initFooterBounce() {
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
}

document.addEventListener('DOMContentLoaded', () => {
  initInteractiveIDBadge();
  initMacDock();
  initContactPageEntranceTransition();
  initFooterBounce();
});
