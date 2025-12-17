// ===== AUDIO SYNTH =====
class VapeAudio {
  constructor() {
    this.ctx = null;
    this.inhaleNode = null;
    this.inhaleGain = null;
    this.filter = null;
    this.isInit = false;
  }

  init() {
    if (this.isInit) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
      this.isInit = true;
    }
  }

  createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  startInhale() {
    if (!this.isInit) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Stop existing if any
    if (this.inhaleNode) this.stopInhale();

    const t = this.ctx.currentTime;
    
    // Noise Source
    this.inhaleNode = this.ctx.createBufferSource();
    this.inhaleNode.buffer = this.createNoiseBuffer();
    this.inhaleNode.loop = true;

    // Filter (Lowpass to simulate air flow)
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(200, t);
    this.filter.frequency.linearRampToValueAtTime(800, t + 2); // Air flow increasing

    // Gain (Volume)
    this.inhaleGain = this.ctx.createGain();
    this.inhaleGain.gain.setValueAtTime(0, t);
    this.inhaleGain.gain.linearRampToValueAtTime(0.3, t + 0.5); // Fade in

    // Connect graph
    this.inhaleNode.connect(this.filter);
    this.filter.connect(this.inhaleGain);
    this.inhaleGain.connect(this.ctx.destination);

    this.inhaleNode.start(t);
  }

  stopInhale() {
    if (!this.inhaleNode || !this.ctx) return;
    const t = this.ctx.currentTime;
    
    // Fade out
    this.inhaleGain.gain.cancelScheduledValues(t);
    this.inhaleGain.gain.setValueAtTime(this.inhaleGain.gain.value, t);
    this.inhaleGain.gain.linearRampToValueAtTime(0, t + 0.2);

    this.inhaleNode.stop(t + 0.2);
    this.inhaleNode = null;
  }

  playExhale() {
    if (!this.isInit) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 1.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 1.5);
  }
}

const vapeAudio = new VapeAudio();

// ===== MAIN SCRIPT =====
document.addEventListener("DOMContentLoaded", () => {
  console.log("TAKE A PUFF: Script initialized");

  const vape = document.getElementById("vape");
  if (!vape) {
    console.error("Vape element not found!");
    return;
  }

  let puffCount = Number(localStorage.getItem("puffs")) || 0;
  let overpuff = Number(localStorage.getItem("longPuffs")) || 0; // persist long drags
  let smokeColor = "#FF4FD8";
  let dragging = false;
  let interval = null;
  let dragStartTime = 0;

  // ===== SFX WRAPPERS =====
  function playInhale() {
    vapeAudio.startInhale();
  }

  function playExhale() {
    vapeAudio.stopInhale();
    vapeAudio.playExhale();
  }

  function unlockAudio() {
    vapeAudio.init();
    document.removeEventListener("touchstart", unlockAudio);
    document.removeEventListener("mousedown", unlockAudio);
  }

  document.addEventListener("touchstart", unlockAudio, { once: true });
  document.addEventListener("mousedown", unlockAudio, { once: true });

  const puffCounter = document.getElementById("puff-count");
  const longCounter = document.getElementById("long-drag-count");
  if (puffCounter) puffCounter.textContent = puffCount;
  if (longCounter) longCounter.textContent = overpuff;

  if (puffCount >= 100 || localStorage.getItem("secret") === "true") {
    unlockSecretFlavor();
  }

  const shareBtn = document.getElementById("share-btn");

  // ===== SHARE PUFF SCORE =====
  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      // Check if html2canvas is loaded
      if (typeof html2canvas === 'undefined') {
        alert("Share feature not ready yet. Please check internet connection.");
        return;
      }

      const vapeZone = document.getElementById("vape-zone");
      const shareArea = document.createElement("div");
      shareArea.style.position = "fixed";
      shareArea.style.left = "-9999px";
      shareArea.style.top = "0";
      shareArea.style.width = vapeZone.offsetWidth + "px";
      shareArea.style.height = vapeZone.offsetHeight + "px";
      shareArea.style.background = "#ff4fd8";
      shareArea.style.padding = "20px";
      shareArea.style.boxSizing = "border-box";

      // Clone vape zone
      const clone = vapeZone.cloneNode(true);
      clone.classList.add("share-card");
      clone.style.pointerEvents = "none";
      clone.style.position = "relative"; // ensure image shows
      shareArea.appendChild(clone);

      // clone current smoke
      document.querySelectorAll(".smoke").forEach(smoke => {
        const s = smoke.cloneNode(true);
        s.style.position = "absolute";
        s.style.left = smoke.style.left;
        s.style.top = smoke.style.top;
        s.style.width = smoke.style.width;
        s.style.height = smoke.style.height;
        s.style.background = smoke.style.background;
        s.style.filter = smoke.style.filter;
        s.style.opacity = smoke.style.opacity;
        shareArea.appendChild(s);
      });

      document.body.appendChild(shareArea);

      html2canvas(shareArea).then(canvas => {
        canvas.toBlob(blob => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "puff-score.png";
          link.click();
        });
        shareArea.remove();
      });
    });
  }

  // ===== SPAWN SMOKE =====
  function spawnSmoke(isLongDrag = false) {
    const mouth = document.querySelector("#vape-zone #vape-mouth");
    if (!mouth) return;

    const rect = mouth.getBoundingClientRect();
    for (let i = 0; i < 6; i++) { // more smoke
      const smoke = document.createElement("div");
      smoke.className = "smoke";

      if (isLongDrag) smoke.classList.add("long-drag");

      const spreadX = (Math.random() - 0.5) * 120;  // slightly wider
      const spreadY = -300 - Math.random() * 200;   // higher rise
      const size = isLongDrag ? 50 + Math.random() * 60 : 20 + Math.random() * 40;

      smoke.style.left = rect.left + rect.width / 2 + spreadX + "px";
      smoke.style.top = rect.top - 20 + "px"; // 🔥 higher smoke
      smoke.style.width = size + "px";
      smoke.style.height = size + "px";
      smoke.style.background = smokeColor;
      smoke.style.opacity = isLongDrag ? 0.6 + Math.random() * 0.3 : 0.3 + Math.random() * 0.4;
      smoke.style.filter = `blur(${isLongDrag ? 6 + Math.random() * 4 : 3 + Math.random() * 4}px)`;

      document.body.appendChild(smoke);

      smoke.animate([
        { transform: "translateY(0) scale(0.8)", opacity: smoke.style.opacity },
        { transform: `translate(${spreadX}px, ${spreadY}px) scale(${isLongDrag ? 2.2 : 1.5})`, opacity: 0 }
      ], {
        duration: 3500 + Math.random() * 1500,
        easing: "ease-out",
        fill: "forwards"
      });

      setTimeout(() => smoke.remove(), 7000);
    }
  }

  // ===== DRAG PUFF =====
  function startDrag(e) {
    if (e.cancelable) e.preventDefault(); // Prevent default only if cancelable
    dragging = true;
    playInhale();
    spawnSmoke();
    interval = setInterval(() => spawnSmoke(false), 150);
    dragStartTime = performance.now();
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    clearInterval(interval);

    puffCount++;
    if (puffCounter) puffCounter.textContent = puffCount;
    localStorage.setItem("puffs", puffCount);

    const hold = Math.round(performance.now() - dragStartTime);
    if (hold >= 2000) { 
      overpuff++;
      if (longCounter) longCounter.textContent = overpuff;
      localStorage.setItem("longPuffs", overpuff);
      triggerCRT();
      if (overpuff % 3 === 0) triggerCough();
      spawnSmoke(true); 
    }

    // Force unlock audio
    playExhale();

    if (puffCount >= 100) unlockSecretFlavor();
  }

  ["mousedown", "touchstart"].forEach(evt => {
    vape.addEventListener(evt, startDrag, { passive: false });
  });

  ["mouseup", "touchend", "touchcancel"].forEach(evt => {
    window.addEventListener(evt, endDrag);
  });

  // ===== CURSOR SMOKE =====
  let lastMove = 0;
  const pixelCursor = document.querySelector(".pixel-cursor");

  document.addEventListener("mousemove", e => {
    if (pixelCursor) {
      pixelCursor.style.left = e.clientX + "px";
      pixelCursor.style.top = e.clientY + "px";
      pixelCursor.style.display = "block";
    }

    if (performance.now() - lastMove < 30) return;
    lastMove = performance.now();

    const puff = document.createElement("div");
    puff.className = "cursor-smoke";
    puff.style.left = e.clientX + "px";
    puff.style.top = e.clientY + "px";
    puff.style.background = smokeColor;
    puff.style.width = "16px";
    puff.style.height = "16px";
    puff.style.opacity = 0.5;
    document.body.appendChild(puff);
    setTimeout(() => puff.remove(), 1500);
  });

  // ===== FLAVORS =====
  document.querySelectorAll("#flavors button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#flavors button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      smokeColor = btn.dataset.color;
    });
  });

  // ===== SECRET FLAVOR =====
  function unlockSecretFlavor() {
    if (document.querySelector("[data-color='#FFD700']")) return;
    localStorage.setItem("secret", "true");

    const btn = document.createElement("button");
    btn.textContent = "💎 GOLDEN PUFF";
    btn.dataset.color = "#FFD700";
    btn.addEventListener("click", () => {
      smokeColor = "#FFD700";
      document.querySelectorAll("#flavors button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
    const flavorsDiv = document.getElementById("flavors");
    if (flavorsDiv) flavorsDiv.appendChild(btn);
  }

  // ===== CRT / COUGH =====
  function triggerCRT() {
    const crt = document.getElementById("crt");
    if (!crt) return;
    crt.style.opacity = "1";
    setTimeout(() => crt.style.opacity = "", 100);
    setTimeout(() => crt.style.opacity = "1", 200);
    setTimeout(() => crt.style.opacity = "", 300);
  }

  function triggerCough() {
    document.body.style.filter = "contrast(1.4)";
    setTimeout(() => document.body.style.filter = "", 300);
  }

  const sections = document.querySelectorAll("section");
  function revealSections() {
    const scrollY = window.scrollY + window.innerHeight;
    sections.forEach(section => {
      if (scrollY > section.offsetTop + 50) section.classList.add("show");
    });
  }
  
  window.addEventListener("scroll", revealSections);
  // Initial reveal
  revealSections();
});
