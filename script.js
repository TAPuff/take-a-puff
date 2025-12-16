const vape = document.getElementById("vape");
const smokeLayer = document.getElementById("smoke-layer");
const flavorButtons = document.querySelectorAll("#flavors button");
const sections = document.querySelectorAll("section");

let smokeColor = "#FF4FD8";
let puffCount = 0;
let audioUnlocked = false;

/* ================= SECRET FLAVOR ================= */
let secretUnlocked = false;

/* ================= PUFF COUNTER ================= */
const counter = document.createElement("div");
counter.id = "counter";
counter.innerText = "PUFFS: 0";
document.getElementById("vape-zone").appendChild(counter);

/* ================= FLAVOR DENSITY ================= */
const flavorDensity = {
  "#203ee6ff": 0.8,
  "#e40db5ff": 1.2,
  "#6b24b3ff": 1.1,
  "#6EE7B7": 0.9,
  "#e4643dff": 1.0,
  "#FFD700": 1.8 // SECRET FLAVOR
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
let dragStart = null;
let dragging = false;
let dragInterval = null;
let overpuffCounter = 0;

function startDrag(e) {
  e.preventDefault(); // 🔥 stops image menu
  dragStart = performance.now();
  dragging = true;

  if (!audioUnlocked) startAmbient();

  dragInterval = setInterval(() => {
    const holdTime = performance.now() - dragStart;
    spawnSmoke(holdTime);
  }, 130);
}

function endDrag() {
  if (!dragging) return;

  const holdTime = performance.now() - dragStart;
  clearInterval(dragInterval);
  dragging = false;

  spawnSmoke(holdTime * 1.6, true);

  puffCount++;
  counter.innerText = `PUFFS: ${puffCount}`;

  screenShake(Math.min(holdTime / 140, 8));
  playPuff(holdTime);

  /* ===== SECRET FLAVOR UNLOCK ===== */
  if (puffCount >= 100 && !secretUnlocked) {
    unlockSecretFlavor();
  }

  /* ===== COUGH EASTER EGG ===== */
  if (holdTime > 2600) {
    overpuffCounter++;
    if (overpuffCounter >= 3) triggerCough();
  } else {
    overpuffCounter = 0;
  }
}

/* ================= SMOKE ENGINE ================= */
function spawnSmoke(holdTime, burst = false) {
  const rect = vape.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + 10;

  const intensity = Math.min(holdTime / 600, 4);
  const density = flavorDensity[smokeColor] || 1;
  const count = Math.floor((burst ? 20 : 7) * intensity * density);

  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "smoke";
    s.style.background = smokeColor;
    s.style.left = x + Math.random() * 80 - 40 + "px";
    s.style.top = y + "px";
    s.style.opacity = Math.min(0.2 + intensity * 0.25, 0.9);
    s.style.width = s.style.height = 28 + intensity * 18 + "px";
    s.style.setProperty("--drift", `${Math.random() * 140 - 70}px`);
    smokeLayer.appendChild(s);
    setTimeout(() => s.remove(), 4800);
  }
}

/* ================= EVENTS ================= */
vape.addEventListener("touchstart", startDrag, { passive: false });
vape.addEventListener("mousedown", startDrag);

window.addEventListener("touchend", endDrag);
window.addEventListener("mouseup", endDrag);

/* ================= SECRET FLAVOR ================= */
function unlockSecretFlavor() {
  secretUnlocked = true;

  const btn = document.createElement("button");
  btn.innerText = "💎 GOLDEN PUFF";
  btn.dataset.color = "#FFD700";

  btn.addEventListener("click", () => {
    flavorButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    smokeColor = "#FFD700";
  });

  document.getElementById("flavors").appendChild(btn);

  // visual feedback
  document.body.style.filter = "brightness(1.3)";
  setTimeout(() => (document.body.style.filter = ""), 400);
}

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

/* ================= PUFF SOUND ================= */
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
