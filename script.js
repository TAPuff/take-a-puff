const vape = document.getElementById("vape");
const smokeLayer = document.getElementById("smoke-layer");
const flavorButtons = document.querySelectorAll("#flavors button");
const sections = document.querySelectorAll("section");

let smokeColor = "#FF4FD8";
let puffCount = 0;
let audioUnlocked = false;

/* ================= PUFF COUNTER ================= */
const counter = document.createElement("div");
counter.id = "counter";
counter.innerText = "PUFFS: 0";
document.getElementById("vape-zone").appendChild(counter);

/* ================= FLAVOR DENSITY ================= */
const flavorDensity = {
  "#7DF9FF": 0.8,   // Blue Freeze
  "#FF4FD8": 1.2,   // Pink Rush
  "#C084FC": 1.1,   // Grape
  "#6EE7B7": 0.9,   // Mint
  "#FFB199": 1.0    // Peach
};

/* ================= FLAVORS ================= */
flavorButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    flavorButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    smokeColor = btn.dataset.color;
  });
});

/* ================= LONG DRAG SYSTEM ================= */
let dragStartTime = null;
let dragging = false;
let dragInterval = null;

function startDrag(e) {
  e.preventDefault();
  dragStartTime = performance.now();
  dragging = true;

  if (!audioUnlocked) startAmbient();

  dragInterval = setInterval(() => {
    const holdTime = performance.now() - dragStartTime;
    spawnSmoke(holdTime);
  }, 120);
}

function endDrag() {
  if (!dragging) return;

  const holdTime = performance.now() - dragStartTime;
  clearInterval(dragInterval);
  dragging = false;

  // Final exhale burst
  spawnSmoke(holdTime * 1.5, true);

  puffCount++;
  counter.innerText = `PUFFS: ${puffCount}`;

  screenShake(Math.min(holdTime / 120, 8));
  playPuff(holdTime);

  // OVERPUFF MODE
  if (holdTime > 2200) {
    document.body.style.filter = "brightness(1.2)";
    setTimeout(() => document.body.style.filter = "", 400);
  }
}

/* ================= SMOKE ENGINE ================= */
function spawnSmoke(holdTime, burst = false) {
  const rect = vape.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + 10;

  const intensity = Math.min(holdTime / 600, 4);
  const density = (flavorDensity[smokeColor] || 1);
  const count = Math.floor((burst ? 18 : 6) * intensity * density);

  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "smoke";
    s.style.background = smokeColor;
    s.style.left = x + Math.random() * 70 - 35 + "px";
    s.style.top = y + "px";
    s.style.opacity = Math.min(0.15 + intensity * 0.25, 0.9);
    s.style.width = s.style.height =
      28 + intensity * 16 + "px";
    s.style.setProperty(
      "--drift",
      `${Math.random() * 120 - 60}px`
    );

    smokeLayer.appendChild(s);
    setTimeout(() => s.remove(), 4500);
  }
}

/* ================= EVENTS ================= */
vape.addEventListener("mousedown", startDrag);
vape.addEventListener("touchstart", startDrag);

window.addEventListener("mouseup", endDrag);
window.addEventListener("touchend", endDrag);

/* ================= SCREEN SHAKE ================= */
function screenShake(power = 2) {
  document.body.style.transform = `translateX(${power}px)`;
  setTimeout(() => {
    document.body.style.transform = `translateX(-${power}px)`;
    setTimeout(() => (document.body.style.transform = ""), 60);
  }, 60);
}

/* ================= AUDIO ================= */
let ambientCtx, ambientOsc, ambientGain;

function startAmbient() {
  ambientCtx = new AudioContext();
  ambientOsc = ambientCtx.createOscillator();
  ambientGain = ambientCtx.createGain();

  ambientOsc.type = "sine";
  ambientOsc.frequency.value = 52;
  ambientGain.gain.value = 0.02;

  ambientOsc.connect(ambientGain);
  ambientGain.connect(ambientCtx.destination);
  ambientOsc.start();

  audioUnlocked = true;
}

function playPuff(holdTime = 200) {
  const ctx = new AudioContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();

  o.type = "triangle";
  o.frequency.value = 90 + Math.min(holdTime / 20, 80);
  g.gain.value = 0.05 + Math.min(holdTime / 2000, 0.15);

  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.25);
}

/* ================= LOGO WOBBLE ================= */
setInterval(() => {
  document.querySelector("h1").style.transform =
    `translateX(${Math.random() * 4 - 2}px)`;
}, 1200);

/* ================= GLITCH REVEAL ================= */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => e.isIntersecting && e.target.classList.add("show"));
});
sections.forEach(s => observer.observe(s));

/* ================= MOBILE GYRO TILT ================= */
if (window.DeviceOrientationEvent) {
  window.addEventListener("deviceorientation", e => {
    const tilt = Math.max(Math.min(e.gamma / 10, 4), -4);
    vape.style.transform = `translateX(${tilt}px)`;
  });
}
