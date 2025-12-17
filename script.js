document.addEventListener("DOMContentLoaded", () => {
  const vape = document.getElementById("vape");
  let puffCount = Number(localStorage.getItem("puffs")) || 0;
  let overpuff = Number(localStorage.getItem("longPuffs")) || 0; // persist long drags
  let smokeColor = "#FF4FD8";
  let dragging = false;
  let interval = null;
  let dragStartTime = 0;

// ===== SFX =====
  const inhaleSFX = new Audio("sounds/inhale.mp3");
  const exhaleSFX = new Audio("sounds/exhale.mp3");
  inhaleSFX.preload = "auto";
  exhaleSFX.preload = "auto";
  inhaleSFX.load();
  exhaleSFX.load();

  function unlockAudio() {
    inhaleSFX.play().then(() => inhaleSFX.pause()).catch(() => {});
    exhaleSFX.play().then(() => exhaleSFX.pause()).catch(() => {});
    document.removeEventListener("touchstart", unlockAudio);
    document.removeEventListener("mousedown", unlockAudio);
  }

  document.addEventListener("touchstart", unlockAudio, { once: true });
  document.addEventListener("mousedown", unlockAudio, { once: true });

  const puffCounter = document.getElementById("puff-count");
  const longCounter = document.getElementById("long-drag-count");
  puffCounter.textContent = puffCount;
  longCounter.textContent = overpuff;

  const shareBtn = document.getElementById("share-btn");

  // ===== SHARE PUFF SCORE =====
shareBtn.addEventListener("click", () => {
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
  clone.style.pointerEvents = "none";
  shareArea.appendChild(clone);

  // Clone active smoke
  document.querySelectorAll(".smoke").forEach(smoke => {
    const s = smoke.cloneNode(true);
    s.style.position = "absolute";
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

      smoke.style.left = window.scrollX + rect.left + rect.width / 2 + spreadX + "px";
      smoke.style.top = window.scrollY + rect.top + "px";
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

  playInhale();
}

  // ===== DRAG PUFF =====
  function startDrag(e) {
    e.preventDefault();
    dragging = true;
    spawnSmoke();
    interval = setInterval(() => spawnSmoke(false), 150);
    dragStartTime = performance.now();
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    clearInterval(interval);

    puffCount++;
    puffCounter.textContent = puffCount;
    localStorage.setItem("puffs", puffCount);

const hold = Math.round(performance.now() - dragStartTime);
if (hold >= 2000) { // long drag
  overpuff++;
  longCounter.textContent = overpuff;
  localStorage.setItem("longPuffs", overpuff);
  triggerCRT();
  if (overpuff % 3 === 0) triggerCough();

  // Spawn bigger smoke for long drag
  spawnSmoke(true); // <-- call spawnSmoke with "long drag" flag
}

    playExhale();

    if (puffCount >= 100) unlockSecretFlavor();
  }

  vape.addEventListener("mousedown", startDrag);
  vape.addEventListener("touchstart", startDrag, { passive: false });
  window.addEventListener("mouseup", endDrag);
  window.addEventListener("touchend", endDrag);

  // ===== CURSOR SMOKE =====
let lastMove = 0;
document.addEventListener("mousemove", e => {
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
    document.getElementById("flavors").appendChild(btn);
  }

  // ===== CRT / COUGH =====
  function triggerCRT() {
    const crt = document.getElementById("crt");
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
window.addEventListener("load", revealSections);