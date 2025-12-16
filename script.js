const vape = document.getElementById("vape");
const smokeLayer = document.getElementById("smoke-layer");
const flavorButtons = document.querySelectorAll("#flavors button");
const sections = document.querySelectorAll("section");

let smokeColor = "#FF4FD8";
let audioUnlocked = false;

/* ================= FLAVORS ================= */

flavorButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    flavorButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    smokeColor = btn.dataset.color;
  });
});

/* ================= SMOKE FROM TIP ================= */

function puff() {
  const rect = vape.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + 8;

  for (let i = 0; i < 16; i++) {
    const s = document.createElement("div");
    s.className = "smoke";
    s.style.background = smokeColor;
    s.style.left = originX + Math.random() * 36 - 18 + "px";
    s.style.top = originY + "px";
    smokeLayer.appendChild(s);
    setTimeout(() => s.remove(), 3800);
  }

  if (!audioUnlocked) {
    startAmbient();
    audioUnlocked = true;
  }

  playPuff();
}

vape.addEventListener("click", puff);
vape.addEventListener("touchstart", puff);

/* ================= AUDIO ================= */

let ambientCtx, ambientOsc, ambientGain;

function startAmbient() {
  ambientCtx = new AudioContext();
  ambientOsc = ambientCtx.createOscillator();
  ambientGain = ambientCtx.createGain();

  ambientOsc.type = "sine";
  ambientOsc.frequency.value = 55;
  ambientGain.gain.value = 0.02;

  ambientOsc.connect(ambientGain);
  ambientGain.connect(ambientCtx.destination);
  ambientOsc.start();
}

function playPuff() {
  const ctx = new AudioContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.value = 120;
  g.gain.value = 0.08;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.18);
}

/* ================= CURSOR TRAIL ================= */

document.addEventListener("mousemove", e => {
  const p = document.createElement("div");
  p.style.position = "fixed";
  p.style.left = e.clientX + "px";
  p.style.top = e.clientY + "px";
  p.style.width = "6px";
  p.style.height = "6px";
  p.style.background = "#ffb3d9";
  p.style.pointerEvents = "none";
  p.style.zIndex = 1000;
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 300);
});

/* ================= BACKGROUND SMOKE ================= */

["bg1", "bg2", "bg3"].forEach(cls => {
  const d = document.createElement("div");
  d.className = `bg-smoke ${cls}`;
  document.body.appendChild(d);
});

/* ================= PIXEL STARS ================= */

for (let i = 0; i < 40; i++) {
  const s = document.createElement("div");
  s.className = "star";
  s.style.left = Math.random() * 100 + "vw";
  s.style.animationDelay = Math.random() * 12 + "s";
  document.body.appendChild(s);
}

/* ================= GLITCH REVEAL ================= */

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

sections.forEach(sec => observer.observe(sec));
