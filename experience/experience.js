const { onScroll, utils, animate, createTimeline, set } = window.anime;

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/* ---------------- SECTION B: the highway (Route Map) ---------------- */
const busFigure = document.getElementById('busFigure');
const routeProgress = document.getElementById('routeProgress');
const stations = utils.$('.station');
const boardContents = utils.$('.board-content');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const highwaySection = document.getElementById('highwaySection');

const comicBubble = document.getElementById('comicBubble');

const STOPS = stations.length;
let activeStop = 0;
let isAnimating = false;

const stopNames = ['NIC', 'NEHU', 'KCG', 'TERMINUS']; // Next stop labels

function goToStop(index) {
  if (index < 0 || index >= STOPS) return;
  
  activeStop = index;
  
  // Update buttons
  prevBtn.disabled = activeStop === 0;
  nextBtn.disabled = activeStop === STOPS - 1;
  
  // Toggle comic bubble at end
  if (activeStop === STOPS - 1) {
    setTimeout(() => {
      if (activeStop === STOPS - 1) comicBubble.classList.add('show');
    }, 800);
  } else {
    comicBubble.classList.remove('show');
  }

  // Update Route Map
  stations.forEach((st, i) => {
    st.classList.toggle('is-active', i <= activeStop);
  });
  
  // Fill progress line (0%, 33%, 66%, 100%)
  const progressPercent = (activeStop / (STOPS - 1)) * 100;
  routeProgress.style.width = `${progressPercent}%`;

  // Update Billboard Content
  boardContents.forEach((content, i) => {
    content.classList.toggle('is-active', i === activeStop);
  });

  // Animate Bus
  // Bus needs to move across the screen. We'll animate 'left' property from 10% to about 70%
  const startLeft = 10;
  const endLeft = 60;
  const targetLeft = startLeft + (activeStop / (STOPS - 1)) * (endLeft - startLeft);
  
  // Make the bus bob while moving
  animate(busFigure, {
    left: `${targetLeft}%`,
    translateY: [
      { value: -10, duration: 200, easing: 'easeOutQuad' },
      { value: 0, duration: 200, easing: 'easeInQuad' },
      { value: -10, duration: 200, easing: 'easeOutQuad' },
      { value: 0, duration: 200, easing: 'easeInQuad' }
    ],
    duration: 800,
    easing: 'easeOutCubic'
  });
}

// Event Listeners for Navigation
prevBtn.addEventListener('click', () => {
  goToStop(activeStop - 1);
});

nextBtn.addEventListener('click', () => {
  goToStop(activeStop + 1);
});

stations.forEach((st, i) => {
  st.addEventListener('click', () => {
    goToStop(i);
  });
});

// Arrow Keys
window.addEventListener('keydown', (e) => {
  // Only trigger if we are scrolled down to the highway section
  const rect = highwaySection.getBoundingClientRect();
  if (rect.top > window.innerHeight / 2) return; // not in view yet
  
  if (e.key === 'ArrowRight') {
    goToStop(activeStop + 1);
  } else if (e.key === 'ArrowLeft') {
    goToStop(activeStop - 1);
  }
});

// Initialize
goToStop(0);

// Add entry animation with the card
const transOverlay = document.createElement('div');
transOverlay.className = 'transition-overlay active';
document.body.appendChild(transOverlay);

const card = document.createElement('div');
card.className = 'jack-card active';
card.innerHTML = `
  <div class="jack-card-inner">
    <div class="jack-front" style="background-image: url('../jack_trimmed.png'); background-size: 100% 100%; border: none;"></div>
    <div class="jack-back"></div>
  </div>
`;
document.body.appendChild(card);

setTimeout(() => {
  transOverlay.classList.remove('active');
  card.classList.remove('active');
}, 50);

setTimeout(() => {
  if (transOverlay.parentNode) transOverlay.parentNode.removeChild(transOverlay);
  if (card.parentNode) card.parentNode.removeChild(card);
}, 900);
