const vape = document.getElementById("vape");
const smokeLayer = document.getElementById("smoke-layer");
const flavorButtons = document.querySelectorAll("#flavors button");
const sections = document.querySelectorAll("section");

let smokeColor = "#FF4FD8";
let puffCount = 0;
let audioUnlocked = false;

/* COUNTER */
const counter = document.createElement("div");
counter.id = "counter";
counter.innerText = "PUFFS: 0";
document.getElementById("vape-zone").appendChild(counter);

/* FLAVORS */
flavorButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    flavorButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    smokeColor = btn.dataset.color;
  });
});

/* PUFF */
function puff() {
  const rect = vape.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + 12;

  for (let i = 0; i < 14; i++) {
    const s = document.createElement("div");
    s.className = "smoke";
    s.style.background = smokeColor;
    s.style.left = x + Math.random() * 50 - 25 + "px";
    s.style.top = y + "px";
    s.style.setProperty("--drift", `${Math.random() * 80 - 40}px`);
    smokeLayer.appendChild(s);
    setTimeout(() => s.remove(), 4000);
  }

  puffCount++;
  counter.innerText = `PUFFS: ${puffCount}`;

  screenShake();
  playPuff();
  if (!audioUnlocked) startAmbient();
}

vape.addEventListener("click", puff);
vape.addEventListener("touchstart", puff);

/* SCREEN SHAKE */
function screenShake() {
  document.body.style.transform = "translateX(-3px)";
  setTimeout(() => {
    document.body.style.transform = "translateX(3px)";
    setTimeout(() => document.body.style.transform = "", 40);
  }, 40);
}

/* AUDIO */
let ambientCtx, ambientOsc, ambientGain;

function startAmbient() {
  ambientCtx = new AudioContext();
  ambientOsc = ambientCtx.createOscillator();
  ambientGain = ambientCtx.createGain();
  ambientOsc.type = "sine";
  ambientOsc.frequency.value = 55;
  ambientGain.gain.value = .02;
  ambientOsc.connect(ambientGain);
  ambientGain.connect(ambientCtx.destination);
  ambientOsc.start();
  audioUnlocked = true;
}

function playPuff() {
  const ctx = new AudioContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.value = 100 + Math.random() * 40;
  g.gain.value = .08;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + .18);
}

/* GLITCH REVEAL */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => e.isIntersecting && e.target.classList.add("show"));
});
sections.forEach(s => observer.observe(s));
