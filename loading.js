/* ── Live clock ── */
function updateClock() {
  const now = new Date();

  const days   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  const day  = days[now.getDay()];
  const dd   = String(now.getDate()).padStart(2,'0');
  const mon  = months[now.getMonth()];
  const yyyy = now.getFullYear();

  const hh   = String(now.getHours()).padStart(2,'0');
  const mm   = String(now.getMinutes()).padStart(2,'0');
  const ss   = String(now.getSeconds()).padStart(2,'0');

  document.getElementById('live-date').textContent = `${day}  ${dd} ${mon} ${yyyy}`;
  document.getElementById('live-time').textContent = `${hh}:${mm}:${ss}`;
}
updateClock();
setInterval(updateClock, 1000);

/* ── Typewriter engine ── */
const out    = document.getElementById('brief-text');
const cursor = document.getElementById('cursor');
const btn    = document.getElementById('start-btn');

/* Files to "load" */
const FILES = [
  'about.dat',
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
  function tick() {
    if (i < text.length) {
      out.textContent += text[i];
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

  const fname   = document.createElement('span');
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

/* Kick off */
setTimeout(runStep, 700);
