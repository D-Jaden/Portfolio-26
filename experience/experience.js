const { onScroll, utils, animate, createTimeline, set } = window.anime;

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/* ---------------- SECTION A: lights + door ---------------- */
const lights = utils.$('.light');
const doorLeft = document.getElementById('doorLeft');
const doorRight = document.getElementById('doorRight');
const overlay = document.querySelector('.scene-overlay');
const wordmarkEl = document.getElementById('wordmarkEl');
const sceneBg = document.querySelector('.scene-bg');
const mapContainer = document.getElementById('mapContainer');
const mapRoute = document.querySelector('.map-route');
const mapPoints = utils.$('.map-point');
const mapText = document.querySelector('.map-text');

const dashoffsetStart = mapRoute.getTotalLength();
mapRoute.style.strokeDasharray = dashoffsetStart;
mapRoute.style.strokeDashoffset = dashoffsetStart;

set(mapPoints, { opacity: 0, scale: 0 });
set(mapText, { opacity: 0, translateY: 20 });

onScroll({
  target: '#lightsSection',
  enter: 'top top',
  leave: 'bottom bottom',
  sync: true,
  onUpdate: (self) => {
    const p = self.progress;

    // 1. Lights: 0 to 0.4
    const lightsStep = 0.4 / 5;
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

    // 2. Wordmark fades: 0.4 to 0.5
    const fadeP = clamp((p - 0.4) / 0.1);
    wordmarkEl.style.opacity = 1 - fadeP;
    wordmarkEl.style.transform = `translateY(${fadeP * -18}px)`;
    if(fadeP === 1) {
      wordmarkEl.style.pointerEvents = 'none';
    } else {
      wordmarkEl.style.pointerEvents = 'auto';
    }

    // 3. Doors open: 0.5 to 0.60
    const doorP = clamp((p - 0.5) / 0.1);
    const easedDoor = doorP * doorP * (3 - 2 * doorP); // smoothstep
    doorLeft.style.transform = `translateX(${-easedDoor * 100}%)`;
    doorRight.style.transform = `translateX(${easedDoor * 100}%)`;
    overlay.style.opacity = 1 - easedDoor;

    // 4. Map Reveal & Draw: 0.65 to 0.85
    const mapP = clamp((p - 0.65) / 0.2);
    if (mapP > 0) {
      mapContainer.style.opacity = 1;
    } else {
      mapContainer.style.opacity = 0;
    }

    // Manual playback of map animations based on scroll mapP
    // Stroke dashoffset for the route line
    const dashoffsetStart = mapRoute.getTotalLength();
    mapRoute.style.strokeDashoffset = dashoffsetStart * (1 - mapP);
    
    // Points & text fade in
    const textFadeP = clamp((mapP - 0.5) / 0.5);
    mapPoints.forEach(pt => {
      pt.style.opacity = mapP > 0.1 ? textFadeP : 0;
      pt.style.transform = `scale(${textFadeP})`;
    });
    mapText.style.opacity = textFadeP;
    mapText.style.transform = `translateY(${(1 - textFadeP) * 20}px)`;

    // 5. Fade to final bus image: 0.85 to 1.0
    const busP = clamp((p - 0.85) / 0.15);
    sceneBg.style.opacity = busP;
  }
});

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
    comicBubble.classList.add('show');
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
