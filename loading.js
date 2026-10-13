/* ── Live clock ── */
function updateClock() {
  const now = new Date();

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const day = days[now.getDay()];
  const dd = String(now.getDate()).padStart(2, '0');
  const mon = months[now.getMonth()];
  const yyyy = now.getFullYear();

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  document.getElementById('live-date').textContent = `${day}  ${dd} ${mon} ${yyyy}`;
  document.getElementById('live-time').textContent = `${hh}:${mm}:${ss}`;
}
updateClock();
setInterval(updateClock, 1000);

/* ── Typewriter engine ── */
const out = document.getElementById('brief-text');
const cursor = document.getElementById('cursor');
const btn = document.getElementById('start-btn');

/* Files to "load" */
const FILES = [
  'humor.txt',
  'charisma.dat',
  'about.html',
  'skills.cfg',
  'projects.log',
  'experience.rec',
  'contact.enc',
];

/* Build the sequence as a list of actions */
/* Each action: { type, ... } */
const sequence = [];

/* Phase 1 — greeting */
sequence.push({ type: 'type', text: 'HELLO.\n\nWELCOME TO MY PORTFOLIO.\n\n' });

/* Phase 2 — loading header */
sequence.push({ type: 'type', text: 'LOADING FILES...\n' });

/* Phase 3 — each file appears one by one */
FILES.forEach(f => {
  sequence.push({ type: 'file', name: f });
});

/* Phase 4 — done line */
sequence.push({ type: 'type', text: '\nALL SYSTEMS READY.' });

/* Phase 5 — show button */
sequence.push({ type: 'button' });

let stepIndex = 0;

function runStep() {
  if (stepIndex >= sequence.length) return;
  const step = sequence[stepIndex++];

  if (step.type === 'type') {
    typeText(step.text, runStep);
  } else if (step.type === 'file') {
    appendFileLine(step.name, runStep);
  } else if (step.type === 'button') {
    cursor.style.display = 'none';
    btn.classList.add('show');
  }
}

/* ── Web Audio Synthesizer (Robust, Bulletproof Autoplay, High Volume) ── */
let audioCtx = null;
let masterGain = null;

function unlockAudio() {
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => {
        if (masterGain && audioCtx) {
          masterGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
        }
      });
    }
  } catch (e) {
    console.warn('Audio unlock error:', e);
  }
}

// Unlock audio on any initial user interaction anywhere on the screen
['pointerdown', 'mousedown', 'touchstart', 'touchend', 'keydown', 'click'].forEach(evt => {
  window.addEventListener(evt, unlockAudio, { passive: true, once: false });
});

/* 1. Ultra-Crisp Mechanical Mouse Switch Click Sound */
function playMouseClickSound() {
  unlockAudio();
  if (!audioCtx) return;

  const startPlay = () => {
    try {
      const now = audioCtx.currentTime + 0.005; // Small offset prevents initial transient clipping

      // Primary click snap (High-frequency snap)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1600, now);
      osc1.frequency.exponentialRampToValueAtTime(150, now + 0.045);

      gain1.gain.setValueAtTime(0.9, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc1.connect(gain1);
      gain1.connect(masterGain || audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.045);

      // Body pop transient (Low mechanical thud)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(420, now);
      osc2.frequency.exponentialRampToValueAtTime(60, now + 0.035);

      gain2.gain.setValueAtTime(0.6, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc2.connect(gain2);
      gain2.connect(masterGain || audioCtx.destination);
      osc2.start(now);
      osc2.stop(now + 0.035);
    } catch (e) {
      console.warn('Mouse click sound error:', e);
    }
  };

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(startPlay);
  } else {
    startPlay();
  }
}

/* 2. Authentic Mechanical Keyboard Typing Sound */
function playTypingKeySound(isSpaceOrEnter = false) {
  unlockAudio();
  if (!audioCtx) return;

  const startPlay = () => {
    try {
      const now = audioCtx.currentTime + 0.003;
      const baseFreq = isSpaceOrEnter ? 320 : 750 + (Math.random() * 400 - 200);
      const duration = isSpaceOrEnter ? 0.06 : 0.038;

      // Click transient
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = isSpaceOrEnter ? 'triangle' : 'square';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(isSpaceOrEnter ? 80 : 120, now + duration);

      const vol = isSpaceOrEnter ? 0.8 : 0.55;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(masterGain || audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);

      // Low housing bottom-out bump
      const bumpOsc = audioCtx.createOscillator();
      const bumpGain = audioCtx.createGain();
      bumpOsc.type = 'sine';
      bumpOsc.frequency.setValueAtTime(180, now);
      bumpOsc.frequency.exponentialRampToValueAtTime(50, now + duration + 0.01);

      bumpGain.gain.setValueAtTime(0.4, now);
      bumpGain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.01);

      bumpOsc.connect(bumpGain);
      bumpGain.connect(masterGain || audioCtx.destination);

      bumpOsc.start(now);
      bumpOsc.stop(now + duration + 0.01);
    } catch (e) {
      console.warn('Typing key sound error:', e);
    }
  };

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(startPlay);
  } else {
    startPlay();
  }
}

/* Typewriter: writes text char by char, calls done() when finished */
function typeText(text, done) {
  let i = 0;
  const span = document.createElement('span');
  out.appendChild(span);

  function tick() {
    if (i < text.length) {
      span.textContent += text[i];
      i++;
      const ch = text[i - 1];
      playTypingKeySound(ch === ' ' || ch === '\n');
      const delay = ch === '\n' ? 180
        : ch === '.' ? 140
          : Math.random() * 40 + 22;
      setTimeout(tick, delay);
    } else {
      done && done();
    }
  }
  tick();
}

/* File line: show filename + animated dots then OK */
function appendFileLine(name, done) {
  /* create a div for this file row */
  const row = document.createElement('div');
  row.className = 'file-line';

  const fname = document.createElement('span');
  fname.className = 'fname';
  fname.textContent = '  > ' + name;

  const fstatus = document.createElement('span');
  fstatus.className = 'fstatus';
  fstatus.textContent = '......';

  row.appendChild(fname);
  row.appendChild(fstatus);
  out.appendChild(row);

  /* animate dots then flip to OK */
  let dots = 0;
  const dotFrames = ['......', '.....', '....', '...', '..', '.', '..', '...', '....'];
  let frame = 0;
  const iv = setInterval(() => {
    fstatus.textContent = dotFrames[frame % dotFrames.length];
    frame++;
    if (frame >= 9) {
      clearInterval(iv);
      fstatus.textContent = '[ OK ]';
      fstatus.classList.add('ok');
      setTimeout(done, 120);
    }
  }, 60);
}

/* ── 3D CRT Monitor Scene ── */
let scene, camera, glRenderer, cssRenderer, controls;
let monitorGroup;

function initThreeScene() {
  const glContainer = document.getElementById('webgl-container');
  const cssContainer = document.getElementById('css3d-container');
  if (!glContainer || !cssContainer || typeof THREE === 'undefined') {
    setTimeout(runStep, 700);
    return;
  }

  // Scene & Camera (Angle & Framing matched to User Reference Screenshot)
  scene = new THREE.Scene();
  scene.background = null;
  const aspect = window.innerWidth / window.innerHeight;
  const initialFov = aspect < 1 ? Math.min(70, 45 * Math.sqrt(1 / aspect)) : 45;
  camera = new THREE.PerspectiveCamera(initialFov, aspect, 1, 5000);
  camera.position.set(-1180, 560, 1180);

  // WebGL Renderer
  glRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  glRenderer.setSize(window.innerWidth, window.innerHeight);
  glRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  glRenderer.shadowMap.enabled = true;
  glRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  glRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  glRenderer.toneMappingExposure = 1.15;
  glContainer.appendChild(glRenderer.domElement);

  // CSS3D Renderer
  cssRenderer = new THREE.CSS3DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssContainer.appendChild(cssRenderer.domElement);

  // Orbit Controls (Framed to match screenshot perspective)
  controls = new THREE.OrbitControls(camera, cssRenderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 500;
  controls.maxDistance = 2400;
  controls.maxPolarAngle = Math.PI / 2 + 0.1;
  controls.target.set(-20, -140, 200);
  controls.update();

  // Monitor Group
  monitorGroup = new THREE.Group();
  scene.add(monitorGroup);

  // High Quality Materials System
  const retroBeige = new THREE.MeshStandardMaterial({
    color: 0xded6c5, // Vintage Classic Macintosh Ivory/Beige
    roughness: 0.4,
    metalness: 0.08
  });
  const retroDark = new THREE.MeshStandardMaterial({
    color: 0x1f2226, // Deep charcoal slate accent
    roughness: 0.55,
    metalness: 0.25
  });
  const buttonRed = new THREE.MeshStandardMaterial({
    color: 0xff3333,
    roughness: 0.35,
    metalness: 0.25,
    emissive: 0x330000,
    emissiveIntensity: 0.2
  });
  const ledGreen = new THREE.MeshStandardMaterial({
    color: 0x33ff33,
    emissive: 0x22aa22,
    emissiveIntensity: 0.8
  });

  window.powerButtonMesh = null;
  window.cpuPowerButtonMesh = null;
  window.isBooted = false;

  // 1. CLASSIC MACINTOSH VINTAGE CRT MONITOR WITH BACK CURVES & STAND
  const monitorScreenGroup = new THREE.Group();
  monitorScreenGroup.position.set(-120, 0, 0);
  monitorGroup.add(monitorScreenGroup);

  // Main Cabinet with Stepped Rear Crown & Curved Back Profile (Widened for Legible Text)
  const cabGeo = new THREE.BoxGeometry(940, 720, 580);
  const posCab = cabGeo.attributes.position;
  for (let i = 0; i < posCab.count; i++) {
    const y = posCab.getY(i);
    const z = posCab.getZ(i);
    
    // Taper rear vertices inward (X & Y) to form iconic CRT back curves
    if (z < 0) {
      posCab.setX(i, posCab.getX(i) * 0.65);
      posCab.setY(i, posCab.getY(i) * 0.75);
    }
    // Stepped Crown Notch on upper back casing
    if (z < -80 && y > 100) {
      posCab.setY(i, posCab.getY(i) * 0.88);
    }
  }
  cabGeo.computeVertexNormals();
  const cabMesh = new THREE.Mesh(cabGeo, retroBeige);
  cabMesh.position.set(0, 40, -40);
  cabMesh.castShadow = true;
  cabMesh.receiveShadow = true;
  monitorScreenGroup.add(cabMesh);

  // Front Outer Bezel Frame
  const bezelGeo = new THREE.BoxGeometry(960, 740, 60);
  const bezelMesh = new THREE.Mesh(bezelGeo, retroBeige);
  bezelMesh.position.set(0, 40, 240);
  bezelMesh.castShadow = true;
  bezelMesh.receiveShadow = true;
  monitorScreenGroup.add(bezelMesh);

  // Curved CRT Screen Bezel Inset (Widened for Large Screen Text Display)
  const screenBezelGeo = new THREE.BoxGeometry(820, 520, 40);
  const screenBezelMesh = new THREE.Mesh(screenBezelGeo, retroBeige);
  screenBezelMesh.position.set(0, 110, 260);
  monitorScreenGroup.add(screenBezelMesh);

  // Lower Front Chin (Floppy Drive Slot & Power Button)
  const chinGeo = new THREE.BoxGeometry(960, 150, 70);
  const chinMesh = new THREE.Mesh(chinGeo, retroBeige);
  chinMesh.position.set(0, -235, 245);
  chinMesh.castShadow = true;
  monitorScreenGroup.add(chinMesh);

  // Horizontal 3.5" Floppy Disk Drive Slot
  const slotGeo = new THREE.BoxGeometry(320, 12, 16);
  const slotMesh = new THREE.Mesh(slotGeo, retroDark);
  slotMesh.position.set(-80, -215, 275);
  monitorScreenGroup.add(slotMesh);

  // Red Power Button on Front Lower Right Chin
  const btnGeo = new THREE.CylinderGeometry(18, 18, 16, 32);
  btnGeo.rotateX(Math.PI / 2);
  window.powerButtonMesh = new THREE.Mesh(btnGeo, buttonRed);
  window.powerButtonMesh.position.set(240, -215, 275);
  monitorScreenGroup.add(window.powerButtonMesh);

  const btnRingGeo = new THREE.CylinderGeometry(23, 23, 8, 32);
  btnRingGeo.rotateX(Math.PI / 2);
  const btnRingMesh = new THREE.Mesh(btnRingGeo, retroDark);
  btnRingMesh.position.set(240, -215, 270);
  monitorScreenGroup.add(btnRingMesh);

  // Left & Right Side Rear Cooling Vent Grilles (Inset Flush on Cabinet Walls)
  const ventMat = retroDark;
  [-1, 1].forEach(side => {
    for (let i = 0; i < 9; i++) {
      const ventGeo = new THREE.BoxGeometry(8, 14, 160);
      const ventMesh = new THREE.Mesh(ventGeo, ventMat);
      ventMesh.position.set(side * 285, -100 + (i * 22), -60);
      ventMesh.rotation.y = side * 0.16;
      monitorScreenGroup.add(ventMesh);
    }
  });

  // Monitor Desk Stand Assembly (Sits Directly on Desk Surface at y = -475)
  const standGroup = new THREE.Group();
  monitorScreenGroup.add(standGroup);

  // Stand Desk Base Plate
  const standBaseGeo = new THREE.BoxGeometry(540, 30, 480);
  const standBaseMesh = new THREE.Mesh(standBaseGeo, retroBeige);
  standBaseMesh.position.set(0, -460, -20);
  standBaseMesh.castShadow = true;
  standBaseMesh.receiveShadow = true;
  standGroup.add(standBaseMesh);

  // Stand Support Neck Stem
  const standNeckGeo = new THREE.BoxGeometry(260, 110, 220);
  const standNeckMesh = new THREE.Mesh(standNeckGeo, retroBeige);
  standNeckMesh.position.set(0, -395, -20);
  standNeckMesh.castShadow = true;
  standGroup.add(standNeckMesh);

  // Swivel Hinge Collar Ring
  const collarGeo = new THREE.CylinderGeometry(140, 140, 20, 32);
  const collarMesh = new THREE.Mesh(collarGeo, retroDark);
  collarMesh.position.set(0, -335, -20);
  standGroup.add(collarMesh);

  // Rubber Foot Pads Under Stand Base (Resting directly on Desk at y = -475)
  [[-230, -472, -200], [230, -472, -200], [-230, -472, 160], [230, -472, 160]].forEach(pos => {
    const footMesh = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 6, 16), retroDark);
    footMesh.position.set(...pos);
    standGroup.add(footMesh);
  });

  // 2. SEPARATE DESKTOP CPU TOWER BOX (RESTORED ALONGSIDE MONITOR ON DESK)
  const cpuTowerGroup = new THREE.Group();
  cpuTowerGroup.position.set(620, -215, 60);
  monitorGroup.add(cpuTowerGroup);

  // Main CPU Tower Cabinet
  const cpuGeo = new THREE.BoxGeometry(300, 520, 580);
  const cpuMesh = new THREE.Mesh(cpuGeo, retroBeige);
  cpuMesh.position.set(0, 0, 0);
  cpuMesh.castShadow = true;
  cpuMesh.receiveShadow = true;
  cpuTowerGroup.add(cpuMesh);

  // CPU Front Bezel Face
  const cpuBezelGeo = new THREE.BoxGeometry(310, 530, 30);
  const cpuBezelMesh = new THREE.Mesh(cpuBezelGeo, retroBeige);
  cpuBezelMesh.position.set(0, 0, 295);
  cpuTowerGroup.add(cpuBezelMesh);

  // 5.25" CD-ROM Drive Bay
  const cdBayGeo = new THREE.BoxGeometry(240, 42, 14);
  const cdBayMesh = new THREE.Mesh(cdBayGeo, retroDark);
  cdBayMesh.position.set(0, 170, 310);
  cpuTowerGroup.add(cdBayMesh);

  // 3.5" Floppy Drive Bay
  const floppyBayGeo = new THREE.BoxGeometry(200, 18, 14);
  const floppyBayMesh = new THREE.Mesh(floppyBayGeo, retroDark);
  floppyBayMesh.position.set(0, 100, 310);
  cpuTowerGroup.add(floppyBayMesh);

  // Main Glowing Red CPU Power Button
  const cpuBtnGeo = new THREE.CylinderGeometry(22, 22, 18, 32);
  cpuBtnGeo.rotateX(Math.PI / 2);
  window.cpuPowerButtonMesh = new THREE.Mesh(cpuBtnGeo, buttonRed);
  window.cpuPowerButtonMesh.position.set(-65, -140, 315);
  cpuTowerGroup.add(window.cpuPowerButtonMesh);

  const cpuBtnRingGeo = new THREE.CylinderGeometry(28, 28, 10, 32);
  cpuBtnRingGeo.rotateX(Math.PI / 2);
  const cpuBtnRingMesh = new THREE.Mesh(cpuBtnRingGeo, retroDark);
  cpuBtnRingMesh.position.set(-65, -140, 310);
  cpuTowerGroup.add(cpuBtnRingMesh);

  // CPU Green Power Indicator LED
  const cpuLedGeo = new THREE.SphereGeometry(8, 16, 16);
  const cpuLedMesh = new THREE.Mesh(cpuLedGeo, ledGreen);
  cpuLedMesh.position.set(45, -140, 312);
  cpuTowerGroup.add(cpuLedMesh);

  // CPU Air Vent Grilles
  for (let i = 0; i < 6; i++) {
    const ventGeo = new THREE.BoxGeometry(220, 6, 10);
    const ventMesh = new THREE.Mesh(ventGeo, retroDark);
    ventMesh.position.set(0, -200 + (i * 14), 310);
    cpuTowerGroup.add(ventMesh);
  }

  // WebGL Screen Mask
  const maskMat = new THREE.MeshBasicMaterial({ colorWrite: false });
  const maskGeo = new THREE.BoxGeometry(780, 490, 10);
  const maskMesh = new THREE.Mesh(maskGeo, maskMat);
  maskMesh.position.set(0, 110, 276); 
  maskMesh.renderOrder = -1;
  monitorScreenGroup.add(maskMesh);

  // 3. Keyboard (Detailed Mechanical Keybed)
  const keyboardGroup = new THREE.Group();
  
  const kbGeo = new THREE.BoxGeometry(900, 45, 400);
  const kbMesh = new THREE.Mesh(kbGeo, retroBeige);
  kbMesh.position.set(0, 0, 0);
  keyboardGroup.add(kbMesh);

  const keybedGeo = new THREE.BoxGeometry(840, 12, 330);
  const keybedMesh = new THREE.Mesh(keybedGeo, retroDark);
  keybedMesh.position.set(0, 20, 0);
  keyboardGroup.add(keybedMesh);

  const keyGeo = new THREE.BoxGeometry(34, 25, 34);
  const escKeyMat = new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.4 });
  const enterKeyMat = new THREE.MeshStandardMaterial({ color: 0x1976d2, roughness: 0.4 });

  for(let row=0; row<6; row++) {
    for(let col=0; col<20; col++) {
      let keyMat = retroBeige;
      if (row === 0 && col === 0) keyMat = escKeyMat; // Red ESC Key
      else if (row === 3 && col === 18) keyMat = enterKeyMat; // Blue Enter Key
      else if (row === 5 && (col >= 5 && col <= 14)) continue; // Spacebar slot

      const keyMesh = new THREE.Mesh(keyGeo, keyMat);
      let x = -380 + (col * 40);
      let z = -120 + (row * 40);
      let y = 30;
      keyMesh.position.set(x, y, z);
      keyboardGroup.add(keyMesh);
    }
  }

  // Spacebar Key
  const spaceGeo = new THREE.BoxGeometry(380, 25, 34);
  const spaceMesh = new THREE.Mesh(spaceGeo, retroDark);
  spaceMesh.position.set(0, 30, 80);
  keyboardGroup.add(spaceMesh);

  keyboardGroup.rotation.x = 0.15;
  keyboardGroup.position.set(-100, -450, 600);
  monitorGroup.add(keyboardGroup);

  // 3.5 Mouse (Curved Contour & Scroll Wheel)
  const mouseGroup = new THREE.Group();
  mouseGroup.position.set(500, -455, 600);
  monitorGroup.add(mouseGroup);

  const mouseGeo = new THREE.BoxGeometry(110, 42, 160);
  const mouseMesh = new THREE.Mesh(mouseGeo, retroBeige);
  mouseMesh.position.set(0, 0, 0);
  mouseGroup.add(mouseMesh);

  const wheelGeo = new THREE.CylinderGeometry(10, 10, 12, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMesh = new THREE.Mesh(wheelGeo, retroDark);
  wheelMesh.position.set(0, 16, -45);
  mouseGroup.add(wheelMesh);

  const seamGeo = new THREE.BoxGeometry(3, 15, 65);
  const seamMesh = new THREE.Mesh(seamGeo, retroDark);
  seamMesh.position.set(0, 18, -45);
  mouseGroup.add(seamMesh);

  // 4. Desk and Chair (High Contrast Wood & Chrome Base)
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x4a2a18, // Rich dark mahogany wood
    roughness: 0.4,
    metalness: 0.05
  });

  const tableTopGeo = new THREE.BoxGeometry(4000, 50, 2000);
  const tableTopMesh = new THREE.Mesh(tableTopGeo, woodMat);
  tableTopMesh.position.set(0, -500, 300);
  monitorGroup.add(tableTopMesh);

  const legGeo = new THREE.BoxGeometry(100, 1500, 100);
  const legY = -525 - 750;
  [
    [-1800, legY, -600], [1800, legY, -600],
    [-1800, legY, 1200], [1800, legY, 1200]
  ].forEach(pos => {
    const legMesh = new THREE.Mesh(legGeo, woodMat);
    legMesh.position.set(...pos);
    monitorGroup.add(legMesh);
  });

  const chairLeatherMat = new THREE.MeshStandardMaterial({
    color: 0x141619, // Deep black leather
    roughness: 0.35,
    metalness: 0.15
  });

  const chairChromeMat = new THREE.MeshStandardMaterial({
    color: 0xdcdcdc, // Chrome metal base
    roughness: 0.2,
    metalness: 0.85
  });
  
  const chairGroup = new THREE.Group();
  chairGroup.position.set(-100, 0, 1700);
  monitorGroup.add(chairGroup);

  const seatGeo = new THREE.BoxGeometry(700, 60, 700);
  const seatMesh = new THREE.Mesh(seatGeo, chairLeatherMat);
  seatMesh.position.set(0, -1075, 0);
  chairGroup.add(seatMesh);

  const backrestGeo = new THREE.BoxGeometry(650, 800, 55);
  const backrestMesh = new THREE.Mesh(backrestGeo, chairLeatherMat);
  backrestMesh.position.set(0, -700, 325);
  chairGroup.add(backrestMesh);

  const postGeo = new THREE.CylinderGeometry(40, 40, 925, 24);
  const postMesh = new THREE.Mesh(postGeo, chairChromeMat);
  postMesh.position.set(0, -1550, 0);
  chairGroup.add(postMesh);

  const baseLegGeo = new THREE.BoxGeometry(820, 45, 90);
  const baseLeg1 = new THREE.Mesh(baseLegGeo, chairChromeMat);
  baseLeg1.position.set(0, -1975, 0);
  chairGroup.add(baseLeg1);
  const baseLeg2 = new THREE.Mesh(baseLegGeo, chairChromeMat);
  baseLeg2.position.set(0, -1975, 0);
  baseLeg2.rotation.y = Math.PI / 2;
  chairGroup.add(baseLeg2);

  // Armrests
  const armrestGeo = new THREE.BoxGeometry(75, 260, 450);
  const leftArm = new THREE.Mesh(armrestGeo, chairLeatherMat);
  leftArm.position.set(-320, -925, 50);
  chairGroup.add(leftArm);
  const rightArm = new THREE.Mesh(armrestGeo, chairLeatherMat);
  rightArm.position.set(320, -925, 50);
  chairGroup.add(rightArm);

  // 5. Potted Bonsai Plant (Vibrant Foliage & Terracotta Pot)
  const plantGroup = new THREE.Group();
  plantGroup.position.set(-1200, -475, 400);
  plantGroup.scale.set(2.3, 2.3, 2.3);
  monitorGroup.add(plantGroup);

  const potGeo = new THREE.CylinderGeometry(140, 105, 45, 32);
  const potMat = new THREE.MeshStandardMaterial({ color: 0xd95a32, roughness: 0.7, metalness: 0.08 }); 
  const potMesh = new THREE.Mesh(potGeo, potMat);
  potMesh.position.set(0, 22.5, 0);
  plantGroup.add(potMesh);

  const soilGeo = new THREE.CylinderGeometry(130, 130, 8, 32);
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x221810, roughness: 0.95 });
  const soilMesh = new THREE.Mesh(soilGeo, soilMat);
  soilMesh.position.set(0, 42, 0);
  plantGroup.add(soilMesh);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.85 });
  const trunk1 = new THREE.Mesh(new THREE.CylinderGeometry(16, 22, 85, 12), trunkMat);
  trunk1.position.set(0, 70, 0);
  trunk1.rotation.z = 0.2;
  plantGroup.add(trunk1);
  const trunk2 = new THREE.Mesh(new THREE.CylinderGeometry(12, 16, 75, 12), trunkMat);
  trunk2.position.set(20, 120, 0);
  trunk2.rotation.z = -0.3;
  plantGroup.add(trunk2);

  // Layered Vibrant Foliage
  const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.6, metalness: 0.05 });
  const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6, metalness: 0.05 });
  const leafMat3 = new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.6, metalness: 0.05 });
  
  const leafGeo = new THREE.SphereGeometry(72, 24, 24);
  
  const leaf1 = new THREE.Mesh(leafGeo, leafMat1);
  leaf1.scale.set(1, 0.42, 1);
  leaf1.position.set(32, 150, 0);
  plantGroup.add(leaf1);

  const leaf2 = new THREE.Mesh(leafGeo, leafMat2);
  leaf2.scale.set(0.82, 0.42, 0.82);
  leaf2.position.set(-22, 110, 32);
  plantGroup.add(leaf2);

  const leaf3 = new THREE.Mesh(leafGeo, leafMat3);
  leaf3.scale.set(0.92, 0.42, 0.92);
  leaf3.position.set(12, 172, -22);
  plantGroup.add(leaf3);

  // 6. Books (Jewel Tones with Paper Pages Edge)
  const booksGroup = new THREE.Group();
  booksGroup.position.set(-850, -475, 600);
  monitorGroup.add(booksGroup);

  const bookMat1 = new THREE.MeshStandardMaterial({ color: 0x15325b, roughness: 0.5 }); // Sapphire Blue
  const bookMat2 = new THREE.MeshStandardMaterial({ color: 0x7a1818, roughness: 0.5 }); // Crimson Red
  const bookMat3 = new THREE.MeshStandardMaterial({ color: 0x1b4d24, roughness: 0.5 }); // Emerald Green
  const pagesMat = new THREE.MeshStandardMaterial({ color: 0xeae5d9, roughness: 0.9 });

  // Helper to make detailed book with cover & page block
  function createDetailedBook(w, h, d, mat) {
    const bg = new THREE.Group();
    const cover = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    bg.add(cover);
    const pages = new THREE.Mesh(new THREE.BoxGeometry(w - 10, h - 6, d - 10), pagesMat);
    pages.position.set(4, 0, 0);
    bg.add(pages);
    return bg;
  }

  const book1 = createDetailedBook(200, 32, 280, bookMat1);
  book1.position.set(0, 16, 0);
  book1.rotation.y = 0.2;
  booksGroup.add(book1);

  const book2 = createDetailedBook(190, 38, 260, bookMat2);
  book2.position.set(5, 51, -5);
  book2.rotation.y = -0.12;
  booksGroup.add(book2);

  const book3 = createDetailedBook(180, 26, 250, bookMat3);
  book3.position.set(-10, 83, 10);
  book3.rotation.y = 0.28;
  booksGroup.add(book3);

  // 4. CSS3D Terminal Screen
  const terminalElement = document.querySelector('.terminal');
  terminalElement.style.display = 'flex'; 
  
  const cssObject = new THREE.CSS3DObject(terminalElement);
  cssObject.position.set(0, 110, 277);
  monitorScreenGroup.add(cssObject);

  // Enable Shadows Across All 3D Objects
  monitorGroup.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Balanced High-Contrast Studio Lighting
  const ambient = new THREE.AmbientLight(0xfff8ed, 0.35);
  scene.add(ambient);

  const mainLight = new THREE.DirectionalLight(0xfffaed, 1.25);
  mainLight.position.set(800, 1400, 1000);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 2048;
  mainLight.shadow.mapSize.height = 2048;
  mainLight.shadow.camera.near = 500;
  mainLight.shadow.camera.far = 4000;
  mainLight.shadow.camera.left = -2000;
  mainLight.shadow.camera.right = 2000;
  mainLight.shadow.camera.top = 2000;
  mainLight.shadow.camera.bottom = -2000;
  mainLight.shadow.bias = -0.0005;
  const fillLight = new THREE.DirectionalLight(0xd0e0ff, 0.45);
  fillLight.position.set(-900, 600, 800);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffeedd, 0.65);
  rimLight.position.set(0, 1000, -1200);
  scene.add(rimLight);

  window.addEventListener('resize', onWindowResize);
  
  // Raycaster for Power Buttons (CPU Tower & Monitor Front)
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function handlePowerClick(clientX, clientY) {
    if (window.isBooted) return;
    
    // Normalize coordinates to -1 to +1
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const targets = [window.powerButtonMesh, window.cpuPowerButtonMesh].filter(Boolean);
    const intersects = raycaster.intersectObjects(targets);
    
    if (intersects.length > 0) {
      playMouseClickSound();
      window.isBooted = true;
      // Change button colors to green to show power is ON
      targets.forEach(b => { if (b.material) b.material.color.setHex(0x33ff33); });
      
      const bootPrompt = document.getElementById('boot-prompt');
      if (bootPrompt) bootPrompt.classList.add('hidden');

      // Swipe black screen first with slight delay before displaying welcome screen
      const blackSwipe = document.getElementById('crt-black-swipe');
      if (blackSwipe) blackSwipe.classList.add('active');

      setTimeout(() => {
        terminalElement.classList.remove('off');
        if (blackSwipe) {
          setTimeout(() => {
            blackSwipe.classList.remove('active');
          }, 250);
        }
        setTimeout(runStep, 400);
      }, 650);
    }
  }

  // Mouse click
  window.addEventListener('click', (event) => {
    handlePowerClick(event.clientX, event.clientY);
  });

  // Touch support for mobile - use touchend to get final touch position without blocking other UI touches
  window.addEventListener('touchend', (event) => {
    if (window.isBooted) return;
    if (event.target && (event.target.id === 'start-btn' || (event.target.closest && event.target.closest('#start-btn')))) return;
    if (event.changedTouches && event.changedTouches.length > 0) {
      const t = event.changedTouches[0];
      handlePowerClick(t.clientX, t.clientY);
    }
  });

  animateScene();
  
  // Play the retro pixel intro animation
  playPixelIntro();
}

function onWindowResize() {
  if (!camera) return;
  const aspect = window.innerWidth / window.innerHeight;
  camera.aspect = aspect;
  if (aspect < 1) {
    camera.fov = Math.min(70, 45 * Math.sqrt(1 / aspect));
  } else {
    camera.fov = 45;
  }
  camera.updateProjectionMatrix();
  if (glRenderer) glRenderer.setSize(window.innerWidth, window.innerHeight);
  if (cssRenderer) cssRenderer.setSize(window.innerWidth, window.innerHeight);
}

function animateScene() {
  requestAnimationFrame(animateScene);
  controls.update();

  glRenderer.render(scene, camera);
  cssRenderer.render(scene, camera);
}

window.addEventListener('load', initThreeScene);

let sequenceInitiated = false;
function triggerInitiateSequence(e) {
  if (sequenceInitiated) return;
  sequenceInitiated = true;
  if (e) {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
  }
  playMouseClickSound();
  const terminal = document.querySelector('.terminal');
  if (terminal) terminal.classList.add('sweep-up');
  setTimeout(() => {
    window.location.href = './hero/hero.html';
  }, 850);
}

window.triggerInitiateSequence = triggerInitiateSequence;

if (btn) {
  btn.addEventListener('click', triggerInitiateSequence);
  btn.addEventListener('touchend', triggerInitiateSequence);
}

function playPixelIntro() {
  const overlay = document.getElementById('grid-overlay');
  const blocks = document.querySelectorAll('.pixel-block');
  const statusText = document.getElementById('pixel-loading-status');
  if (!overlay) return;

  const messages = [
    'Initializing system core...',
    'Loading brand strategy...',
    'Mounting retro 3D workspace...',
    'Configuring UI components...',
    'Loading humor.txt & charisma.dat...',
    'All systems ready.'
  ];

  // Slower, unhurried loading duration (4.8 seconds)
  const duration = 4800;
  let startTime = null;

  function animateLoading(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);

    if (blocks && blocks.length > 0) {
      const activeCount = Math.floor(progress * (blocks.length + 1));
      blocks.forEach((block, idx) => {
        if (idx < activeCount) {
          block.classList.add('active');
        } else {
          block.classList.remove('active');
        }
      });
    }

    if (statusText) {
      const msgIdx = Math.min(Math.floor(progress * messages.length), messages.length - 1);
      statusText.textContent = messages[msgIdx];
    }

    if (progress < 1) {
      requestAnimationFrame(animateLoading);
    } else {
      setTimeout(() => {
        overlay.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease-out';
        overlay.style.transform = 'scale(1.06)';
        overlay.style.opacity = '0';

        setTimeout(() => {
          overlay.style.display = 'none';
          const bootPrompt = document.getElementById('boot-prompt');
          if (bootPrompt) {
            bootPrompt.classList.remove('hidden');
          }
        }, 500);
      }, 350);
    }
  }

  requestAnimationFrame(animateLoading);
}
