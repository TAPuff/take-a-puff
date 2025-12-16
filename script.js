const vape = document.getElementById("vape");
const smokeLayer = document.getElementById("smoke-layer");
const flavorButtons = document.querySelectorAll("#flavors button");
const sections = document.querySelectorAll("section");

let puffCount = Number(localStorage.getItem("puffs")) || 0;
let longDragCount = Number(localStorage.getItem("longDrags")) || 0;
let secretUnlocked = localStorage.getItem("secret") === "true";

/* ================== PERSISTENCE ================== */
let puffCount = Number(localStorage.getItem("puffs")) || 0;
let longDragCount = Number(localStorage.getItem("longDrags")) || 0;
let secretUnlocked = localStorage.getItem("secret") === "true";

/* ================= SECRET FLAVOR ================= */
let secretUnlocked = false;

/* ================= PUFF COUNTER ================= */
const counter = document.createElement("div");
counter.id = "counter";
updateCounter();
document.getElementById("vape-zone").appendChild(counter);

function updateCounter() {
  counter.innerText = `PUFFS: ${puffCount}  |  LONG DRAGS: ${longDragCount}`;
}

/* ================= FLAVOR DENSITY ================= */
let smokeColor = "#FF4FD8";

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
let interval = null;
let overpuff = 0;

function startDrag(e) {
  e.preventDefault();
  dragging = true;
  dragStart = performance.now();

  interval = setInterval(() => {
    spawnSmoke(performance.now() - dragStart);
  }, 140);
}

function endDrag() {
  if (!dragging) return;
  dragging = false;
  clearInterval(interval);

  const hold = performance.now() - dragStart;
  puffCount++;
  localStorage.setItem("puffs", puffCount);

  if (hold >= 1800) {
    longDragCount++;
    localStorage.setItem("longDrags", longDragCount);
  }

  spawnSmoke(hold * 1.6, true);
  updateCounter();

  if (puffCount >= 100 && !secretUnlocked) {
    unlockSecretFlavor();
  }

  if (hold > 2600) {
    overpuff++;
    if (overpuff >= 3) triggerCough();
  } else overpuff = 0;
}

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
function spawnSmoke(hold, burst = false) {
  const rect = vape.getBoundingClientRect();
  const intensity = Math.min(hold / 600, 4);
  const count = Math.floor((burst ? 22 : 7) * intensity * (flavorDensity[smokeColor] || 1));

  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "smoke";
    s.style.background = smokeColor;
    s.style.left = rect.left + rect.width / 2 + Math.random() * 80 - 40 + "px";
    s.style.top = rect.top + 6 + "px";
    s.style.opacity = Math.min(0.25 + intensity * 0.25, 0.9);
    s.style.width = s.style.height = 26 + intensity * 18 + "px";
    s.style.setProperty("--drift", `${Math.random() * 120 - 60}px`);
    smokeLayer.appendChild(s);
    setTimeout(() => s.remove(), 5000);
  }
}

/* ================== PARTICLE BURSTS ================== */
function spawnParticles() {
  const rect = vape.getBoundingClientRect();
  for (let i = 0; i < 6; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.background = smokeColor;
    p.style.left = rect.left + rect.width/2 + Math.random()*40 -20 + "px";
    p.style.top = rect.top + 6 + "px";
    p.style.setProperty("--dx", `${Math.random()*60-30}px`);
    p.style.setProperty("--dy", `${-80-Math.random()*40}px`);
    document.body.appendChild(p);
    setTimeout(()=>p.remove(), 800);
  }
}

/* ================== SCREEN ZOOM ================== */
function screenZoom() {
  document.body.classList.add("zoom");
  setTimeout(()=>document.body.classList.remove("zoom"), 150);
}

/* ================= EVENTS ================= */
vape.addEventListener("touchstart", startDrag, { passive: false });
vape.addEventListener("mousedown", startDrag);

window.addEventListener("touchend", endDrag);
window.addEventListener("mouseup", endDrag);

/* ================= SECRET FLAVOR ================= */
function unlockSecretFlavor() {
  secretUnlocked = true;
  localStorage.setItem("secret", "true");

  const overlay = document.createElement("div");
  overlay.id = "unlock-overlay";
  overlay.innerHTML = `
    <div id="unlock-box">
      <h2>SECRET FLAVOR</h2>
      <p>💎 GOLDEN PUFF UNLOCKED</p>
    </div>
  `;
  document.body.appendChild(overlay);

  const goldenSmoke = document.createElement("div");
  goldenSmoke.id = "golden-smoke";
  document.body.appendChild(goldenSmoke);

  // erupt golden smoke
  for(let i=0;i<40;i++){
    setTimeout(spawnGoldenSmoke, i*50);
  }

  setTimeout(()=>{
    overlay.remove();
    goldenSmoke.remove();
  },2000);

  const btn = document.createElement("button");
  btn.innerText = "💎 GOLDEN PUFF";
  btn.dataset.color = "#FFD700";

  btn.onclick = () => {
    document.querySelectorAll("#flavors button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    smokeColor = "#FFD700";
  };
  document.getElementById("flavors").appendChild(btn);
}

function spawnGoldenSmoke() {
  const rect = vape.getBoundingClientRect();
  const s = document.createElement("div");
  s.className = "smoke";
  s.style.background = "#FFD700";
  s.style.left = rect.left + rect.width/2 + Math.random()*100 -50 + "px";
  s.style.top = rect.top + 6 + "px";
  s.style.opacity = 0.7;
  s.style.width = s.style.height = 30 + Math.random()*20 + "px";
  s.style.setProperty("--drift", `${Math.random()*200 -100}px`);
  document.body.appendChild(s);
  setTimeout(()=>s.remove(), 2500);
}

/* ================== COUGH ================== */
function triggerCough() {
  overpuff = 0;
  document.body.style.filter = "contrast(1.4)";
  setTimeout(() => document.body.style.filter = "", 300);
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

/* ================== RESTORE SECRET ================== */
if (secretUnlocked) {
  unlockSecretFlavor();
}

/* ================= SHARE PUFF SCORE ================= */
const shareBtn = document.getElementById("share-btn");

shareBtn.addEventListener("click", async () => {
  // Create temporary canvas
  const canvas = document.createElement("canvas");
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Capture background (pink haze)
  ctx.fillStyle = "#FFB6D9";
  ctx.fillRect(0, 0, width, height);

  // Capture smoke
  document.querySelectorAll(".smoke").forEach(s => {
    const rect = s.getBoundingClientRect();
    ctx.fillStyle = s.style.background;
    const size = parseFloat(s.style.width);
    ctx.globalAlpha = parseFloat(s.style.opacity);
    ctx.fillRect(rect.left, rect.top, size, size);
    ctx.globalAlpha = 1;
  });

  // Capture vape
  const vapeRect = vape.getBoundingClientRect();
  const vapeImg = vape.querySelector("img") || vape; // If img inside vape div
  if (vapeImg && vapeImg.src) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = vapeImg.src;
    img.onload = () => {
      ctx.drawImage(img, vapeRect.left, vapeRect.top, vapeRect.width, vapeRect.height);
      drawTextAndDownload(ctx);
    };
  } else {
    drawTextAndDownload(ctx);
  }
});

function drawTextAndDownload(ctx) {
  // Add counters
  ctx.font = "20px 'Press Start 2P'";
  ctx.fillStyle = "#FFD700";
  ctx.fillText(`PUFFS: ${puffCount}`, 20, 40);
  ctx.fillText(`LONG DRAGS: ${longDragCount}`, 20, 70);
  if (secretUnlocked) {
    ctx.fillStyle = "#FFDD00";
    ctx.fillText("💎 GOLDEN PUFF UNLOCKED!", 20, 100);
  }

  // Convert canvas to image
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PUFF_SCORE_${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/* ================== GIF PUFF SHARE ================== */
const shareGifBtn = document.getElementById("share-gif-btn");

shareGifBtn.addEventListener("click", () => {
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: window.innerWidth,
    height: window.innerHeight,
    workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
  });

  const duration = 4000; // 4 sec GIF to include golden smoke
  const frameRate = 8;   // 8 fps
  const totalFrames = Math.floor(duration / (1000 / frameRate));
  let frame = 0;

  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  const vapeRect = vape.getBoundingClientRect();

  function drawFrame() {
    ctx.fillStyle = "#FFB6D9"; // pink haze background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Smoke particles
    document.querySelectorAll(".smoke").forEach(s => {
      const rect = s.getBoundingClientRect();
      const size = parseFloat(s.style.width);
      ctx.globalAlpha = parseFloat(s.style.opacity);
      ctx.fillStyle = s.style.background;
      ctx.fillRect(rect.left, rect.top, size, size);
      ctx.globalAlpha = 1;
    });

    // Vape image
    const vapeImg = vape.querySelector("img") || vape;
    if(vapeImg && vapeImg.src){
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = vapeImg.src;
      img.onload = () => ctx.drawImage(img, vapeRect.left, vapeRect.top, vapeRect.width, vapeRect.height);
    }

    // Flavor icon (tiny square on top-left)
    ctx.fillStyle = smokeColor;
    ctx.fillRect(10, 10, 18, 18);

    // Counters
    ctx.font = "16px 'Press Start 2P'";
    ctx.fillStyle = "#FFD700";
    ctx.fillText(`PUFFS: ${puffCount}`, 10, 50);
    ctx.fillText(`LONG DRAGS: ${longDragCount}`, 10, 80);
    if(secretUnlocked) ctx.fillText("💎 GOLDEN PUFF!", 10, 110);

    // Optional: screen shake during long drag
    if(dragging) {
      const offsetX = (Math.random()-0.5)*8;
      const offsetY = (Math.random()-0.5)*8;
      ctx.translate(offsetX, offsetY);
    }

    // Golden smoke effect during GIF if secret unlocked
    if(secretUnlocked && frame >= Math.floor(totalFrames/2)){
      for(let i=0;i<6;i++){
        const gsX = vapeRect.left + vapeRect.width/2 + Math.random()*100 -50;
        const gsY = vapeRect.top + 6;
        const size = 20 + Math.random()*15;
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(gsX, gsY, size, size);
        ctx.globalAlpha = 1;
      }
    }

    gif.addFrame(ctx, {copy:true, delay: 1000/frameRate});
    frame++;
    if(frame < totalFrames) requestAnimationFrame(drawFrame);
    else {
      gif.on('finished', function(blob){
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PUFF_GIF_${Date.now()}.gif`;
        a.click();
        URL.revokeObjectURL(url);
      });
      gif.render();
    }
  }

  drawFrame();
});
