const { animate, scrambleText } = window.anime;

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

  // Scene & Camera
  scene = new THREE.Scene();
  scene.background = null; // Let the HTML body white background show through, so CSS3D isn't blocked
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
  camera.position.set(0, 50, 4000);

  // WebGL Renderer
  glRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  glRenderer.setSize(window.innerWidth, window.innerHeight);
  glRenderer.setPixelRatio(window.devicePixelRatio);
  glContainer.appendChild(glRenderer.domElement);

  // CSS3D Renderer
  cssRenderer = new THREE.CSS3DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssContainer.appendChild(cssRenderer.domElement);

  // Orbit Controls
  controls = new THREE.OrbitControls(camera, cssRenderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 800;
  controls.maxDistance = 2500;
  controls.maxPolarAngle = Math.PI / 2 + 0.1; // Prevent going too far under

  // Monitor Group
  monitorGroup = new THREE.Group();
  scene.add(monitorGroup);

  // Materials
  const retroBeige = new THREE.MeshStandardMaterial({
    color: 0xf5ebd3, // Warmer eggshell yellow vintage plastic
    roughness: 0.9,
    metalness: 0.1
  });
  const retroDark = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.8,
    metalness: 0.2
  });
  const screenBackingMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.9,
    metalness: 0.1
  });
  const buttonRed = new THREE.MeshStandardMaterial({
    color: 0xff3333,
    roughness: 0.5,
    metalness: 0.5
  });

  window.powerButtonMesh = null;
  window.isBooted = false;

  // 1. CPU Tower (Right Side)
  const cpuGeo = new THREE.BoxGeometry(350, 900, 800);
  const cpuMesh = new THREE.Mesh(cpuGeo, retroBeige);
  cpuMesh.position.set(700, -25, 0); // Moved up to align with desk at -475
  monitorGroup.add(cpuMesh);
  
  // Power Button on CPU
  const btnGeo = new THREE.CylinderGeometry(30, 30, 20, 32);
  btnGeo.rotateX(Math.PI / 2);
  window.powerButtonMesh = new THREE.Mesh(btnGeo, buttonRed);
  window.powerButtonMesh.position.set(820, 275, 410); // Moved to right side
  monitorGroup.add(window.powerButtonMesh);
  
  // Floppy / CD slots on CPU
  const slotGeo = new THREE.BoxGeometry(200, 15, 20);
  const slot1 = new THREE.Mesh(slotGeo, retroDark);
  slot1.position.set(700, 175, 400);
  monitorGroup.add(slot1);
  const slot2 = new THREE.Mesh(slotGeo, retroDark);
  slot2.position.set(700, 125, 400);
  monitorGroup.add(slot2);

  // 2. Monitor (Left Side)
  const monitorScreenGroup = new THREE.Group();
  monitorScreenGroup.position.set(-200, -15, 0); // Moved down to align base with desk
  monitorScreenGroup.rotation.x = -0.08; // Tilt back like the reference image
  monitorGroup.add(monitorScreenGroup);

  // Main Upper Body
  const topBodyGeo = new THREE.BoxGeometry(990, 600, 600);
  const posTop = topBodyGeo.attributes.position;
  for(let i = 0; i < posTop.count; i++) {
    const z = posTop.getZ(i);
    if (z < 0) { // Back
      posTop.setX(i, posTop.getX(i) * 0.6); // Taper width
      if (posTop.getY(i) > 0) {
        posTop.setY(i, posTop.getY(i) * 0.4); // Taper top severely
      } else {
        posTop.setY(i, posTop.getY(i) * 1.0); // No taper on bottom to match lower body
      }
    }
  }
  topBodyGeo.computeVertexNormals();
  const topBodyMesh = new THREE.Mesh(topBodyGeo, retroBeige);
  topBodyMesh.position.set(0, 85, 0); 
  monitorScreenGroup.add(topBodyMesh);

  // Lower Recessed Body (Dark background for ribs)
  const botBodyGeo = new THREE.BoxGeometry(950, 170, 600); // Narrower for recessed look
  const posBot = botBodyGeo.attributes.position;
  for(let i = 0; i < posBot.count; i++) {
    if (posBot.getZ(i) < 0) posBot.setX(i, posBot.getX(i) * 0.6); 
  }
  botBodyGeo.computeVertexNormals();
  const botBodyMesh = new THREE.Mesh(botBodyGeo, retroDark);
  botBodyMesh.position.set(0, -300, 0); 
  monitorScreenGroup.add(botBodyMesh);

  // Monitor Bezel
  const bezelGeo = new THREE.BoxGeometry(1050, 800, 80);
  const bezelMesh = new THREE.Mesh(bezelGeo, retroBeige); 
  bezelMesh.position.set(0, 0, 275); 
  monitorScreenGroup.add(bezelMesh);

  // Ribs (Beige strips extending to full width, placed over the dark lower body)
  for(let i=0; i<4; i++) {
    const ribGeo = new THREE.BoxGeometry(990, 15, 600);
    const posRib = ribGeo.attributes.position;
    for(let j=0; j<posRib.count; j++) {
      if (posRib.getZ(j) < 0) posRib.setX(j, posRib.getX(j) * 0.6);
    }
    ribGeo.computeVertexNormals();
    const ribMesh = new THREE.Mesh(ribGeo, retroBeige);
    ribMesh.position.set(0, -350 + (i * 30), 0);
    monitorScreenGroup.add(ribMesh);
  }
  
  // Upper Vent (Left) - Flat thin box conforming to taper
  const sideVentGeo = new THREE.BoxGeometry(1, 40, 100);
  const leftUpperVent = new THREE.Mesh(sideVentGeo, retroDark);
  leftUpperVent.position.set(-431, 250, 100);
  leftUpperVent.rotation.y = -0.318; // Match taper slope
  monitorScreenGroup.add(leftUpperVent);

  // Upper Vent (Right)
  const rightUpperVent = new THREE.Mesh(sideVentGeo, retroDark);
  rightUpperVent.position.set(431, 250, 100);
  rightUpperVent.rotation.y = 0.318;
  monitorScreenGroup.add(rightUpperVent);

  // Monitor Base
  const neckGeo = new THREE.CylinderGeometry(80, 80, 80, 16);
  const neckMesh = new THREE.Mesh(neckGeo, retroBeige);
  neckMesh.position.set(-200, -415, 50); 
  monitorGroup.add(neckMesh);
  
  const basePlateGeo = new THREE.CylinderGeometry(300, 300, 20, 32);
  const basePlateMesh = new THREE.Mesh(basePlateGeo, retroBeige);
  basePlateMesh.position.set(-200, -465, 50); // Bottom aligns at -475
  monitorGroup.add(basePlateMesh);

  // WebGL Screen Mask (Punches a transparent hole in WebGL so CSS3D can show through)
  const maskMat = new THREE.MeshBasicMaterial({ colorWrite: false });
  const maskGeo = new THREE.BoxGeometry(800, 600, 10); // Perfectly matches .terminal size
  const maskMesh = new THREE.Mesh(maskGeo, maskMat);
  maskMesh.position.set(0, 0, 314); 
  maskMesh.renderOrder = -1; // MUST draw first to update depth buffer before bezel draws
  monitorScreenGroup.add(maskMesh);

  // 3. Keyboard
  const keyboardGroup = new THREE.Group();
  
  const kbGeo = new THREE.BoxGeometry(900, 50, 400);
  const kbMesh = new THREE.Mesh(kbGeo, retroBeige);
  kbMesh.position.set(0, 0, 0); // Local center
  keyboardGroup.add(kbMesh);

  const keybedGeo = new THREE.BoxGeometry(820, 10, 320);
  const keybedMesh = new THREE.Mesh(keybedGeo, retroDark);
  keybedMesh.position.set(0, 20, 0); // Sitting on top of base
  keyboardGroup.add(keybedMesh);

  const keyGeo = new THREE.BoxGeometry(35, 30, 35); // Taller keys
  for(let row=0; row<6; row++) {
    for(let col=0; col<20; col++) {
      const keyMesh = new THREE.Mesh(keyGeo, retroBeige);
      let x = -380 + (col * 40); // Local X relative to 0
      let z = -120 + (row * 40); // Local Z relative to 0
      let y = 30; // Sticking out above keybed
      keyMesh.position.set(x, y, z);
      keyboardGroup.add(keyMesh);
    }
  }

  // Slant the entire keyboard group and position it globally
  keyboardGroup.rotation.x = 0.15;
  keyboardGroup.position.set(-100, -450, 600);
  monitorGroup.add(keyboardGroup);


  // 3.5 Mouse
  const mouseGeo = new THREE.BoxGeometry(100, 40, 150);
  const mouseMesh = new THREE.Mesh(mouseGeo, retroBeige);
  mouseMesh.position.set(500, -455, 600); // Bottom aligns at -475
  monitorGroup.add(mouseMesh);
  
  const slitGeo = new THREE.BoxGeometry(4, 20, 60);
  const slitMesh = new THREE.Mesh(slitGeo, retroDark);
  slitMesh.position.set(500, -445, 560);
  monitorGroup.add(slitMesh);

  // 4. Desk and Chair
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x6e3c15, // Brown wood
    roughness: 0.9,
    metalness: 0.1
  });

  const tableTopGeo = new THREE.BoxGeometry(4000, 50, 2000);
  const tableTopMesh = new THREE.Mesh(tableTopGeo, woodMat);
  tableTopMesh.position.set(0, -500, 300); // Top aligns at -475
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

  const chairMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.9,
    metalness: 0.2
  });
  
  const chairGroup = new THREE.Group();
  chairGroup.position.set(-100, 0, 1700);
  monitorGroup.add(chairGroup);

  const seatGeo = new THREE.BoxGeometry(700, 50, 700);
  const seatMesh = new THREE.Mesh(seatGeo, chairMat);
  seatMesh.position.set(0, -1075, 0);
  chairGroup.add(seatMesh);

  const backrestGeo = new THREE.BoxGeometry(650, 800, 50);
  const backrestMesh = new THREE.Mesh(backrestGeo, chairMat);
  backrestMesh.position.set(0, -700, 325);
  chairGroup.add(backrestMesh);

  const postGeo = new THREE.CylinderGeometry(50, 50, 925, 16);
  const postMesh = new THREE.Mesh(postGeo, chairMat);
  postMesh.position.set(0, -1550, 0);
  chairGroup.add(postMesh);

  const baseLegGeo = new THREE.BoxGeometry(800, 50, 100);
  const baseLeg1 = new THREE.Mesh(baseLegGeo, chairMat);
  baseLeg1.position.set(0, -1975, 0);
  chairGroup.add(baseLeg1);
  const baseLeg2 = new THREE.Mesh(baseLegGeo, chairMat);
  baseLeg2.position.set(0, -1975, 0);
  baseLeg2.rotation.y = Math.PI / 2;
  chairGroup.add(baseLeg2);

  // Armrests
  const armrestGeo = new THREE.BoxGeometry(70, 250, 450);
  const leftArm = new THREE.Mesh(armrestGeo, chairMat);
  leftArm.position.set(-315, -925, 50);
  chairGroup.add(leftArm);
  const rightArm = new THREE.Mesh(armrestGeo, chairMat);
  rightArm.position.set(315, -925, 50);
  chairGroup.add(rightArm);

  // 5. Potted Bonsai Plant
  const plantGroup = new THREE.Group();
  plantGroup.position.set(-1200, -475, 400); // On left side of desk
  plantGroup.scale.set(2.2, 2.2, 2.2); // Scaled up even more
  monitorGroup.add(plantGroup);

  // Shallow Pot
  const potGeo = new THREE.CylinderGeometry(140, 110, 40, 16);
  const potMat = new THREE.MeshStandardMaterial({ color: 0xcc6644, roughness: 0.9, metalness: 0.1 }); 
  const potMesh = new THREE.Mesh(potGeo, potMat);
  potMesh.position.set(0, 20, 0); // Resting on desk
  plantGroup.add(potMesh);

  // Twisted Trunk
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2f1d, roughness: 0.9 });
  const trunk1 = new THREE.Mesh(new THREE.CylinderGeometry(15, 20, 80, 8), trunkMat);
  trunk1.position.set(0, 60, 0);
  trunk1.rotation.z = 0.2;
  plantGroup.add(trunk1);
  const trunk2 = new THREE.Mesh(new THREE.CylinderGeometry(10, 15, 70, 8), trunkMat);
  trunk2.position.set(20, 110, 0);
  trunk2.rotation.z = -0.3;
  plantGroup.add(trunk2);

  // Layered Foliage (Flattened Spheres)
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x228833, roughness: 0.8, metalness: 0.1 });
  const leafGeo = new THREE.SphereGeometry(70, 16, 16);
  const leaf1 = new THREE.Mesh(leafGeo, leafMat);
  leaf1.scale.set(1, 0.4, 1);
  leaf1.position.set(30, 140, 0);
  plantGroup.add(leaf1);

  const leaf2 = new THREE.Mesh(leafGeo, leafMat);
  leaf2.scale.set(0.8, 0.4, 0.8);
  leaf2.position.set(-20, 100, 30);
  plantGroup.add(leaf2);

  const leaf3 = new THREE.Mesh(leafGeo, leafMat);
  leaf3.scale.set(0.9, 0.4, 0.9);
  leaf3.position.set(10, 160, -20);
  plantGroup.add(leaf3);

  // 6. Books
  const booksGroup = new THREE.Group();
  booksGroup.position.set(-850, -475, 600); // Between plant and monitor
  monitorGroup.add(booksGroup);

  const bookMat1 = new THREE.MeshStandardMaterial({ color: 0x224488, roughness: 0.7 });
  const bookMat2 = new THREE.MeshStandardMaterial({ color: 0x882222, roughness: 0.7 });
  const bookMat3 = new THREE.MeshStandardMaterial({ color: 0x226622, roughness: 0.7 });

  const book1 = new THREE.Mesh(new THREE.BoxGeometry(200, 30, 280), bookMat1);
  book1.position.set(0, 15, 0);
  book1.rotation.y = 0.2;
  booksGroup.add(book1);

  const book2 = new THREE.Mesh(new THREE.BoxGeometry(190, 40, 260), bookMat2);
  book2.position.set(5, 50, -5);
  book2.rotation.y = -0.1;
  booksGroup.add(book2);

  const book3 = new THREE.Mesh(new THREE.BoxGeometry(180, 25, 250), bookMat3);
  book3.position.set(-10, 82.5, 10);
  book3.rotation.y = 0.3;
  booksGroup.add(book3);

  // 7. Neon Sign Background
  const neonElement = document.querySelector('.neon-sign-container');
  if (neonElement) {
    neonElement.style.display = 'flex';
    const neonCSS = new THREE.CSS3DObject(neonElement);
    neonCSS.position.set(0, 1200, -2000); // High up on the back wall, far away
    scene.add(neonCSS);
  }

  // 4. CSS3D Terminal Screen
  const terminalElement = document.querySelector('.terminal');
  terminalElement.style.display = 'flex'; 
  
  const cssObject = new THREE.CSS3DObject(terminalElement);
  cssObject.position.set(0, 0, 316); // Perfectly aligned with mask hole
  monitorScreenGroup.add(cssObject);

  // Lighting
  const ambient = new THREE.AmbientLight(0xfff8ed, 0.4); // Warmer ambient
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xfff8ed, 0.6); // Warmer directional
  dirLight.position.set(500, 1000, 1000);
  scene.add(dirLight);
  const rimLight = new THREE.DirectionalLight(0xccddff, 0.5);
  rimLight.position.set(-800, 500, -500);
  scene.add(rimLight);

  window.addEventListener('resize', onWindowResize);
  
  // Raycaster for Power Button
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener('click', (event) => {
    if (window.isBooted) return;
    
    // Normalize mouse coordinates to -1 to +1
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(window.powerButtonMesh);
    
    if (intersects.length > 0) {
      window.isBooted = true;
      // Change button color to green to show it's on
      window.powerButtonMesh.material.color.setHex(0x33ff33);
      
      // Turn on terminal
      terminalElement.classList.remove('off');
      const bootPrompt = document.getElementById('boot-prompt');
      if (bootPrompt) bootPrompt.classList.add('hidden');
      
      // Start sequence
      setTimeout(runStep, 500);
    }
  });

  animateScene();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  glRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
}

function animateScene() {
  requestAnimationFrame(animateScene);
  controls.update();
  
  // Static scene, no floating animation
  // monitorGroup.position.y = Math.sin(time) * 10;
  // monitorGroup.rotation.y = Math.sin(time * 0.5) * 0.05;

  glRenderer.render(scene, camera);
  cssRenderer.render(scene, camera);
}

window.addEventListener('load', initThreeScene);

btn.addEventListener('click', () => {
  const terminal = document.querySelector('.terminal');
  if (terminal) terminal.classList.add('sweep-up');
  setTimeout(() => {
    window.location.href = './hero/hero.html';
  }, 850);
});
