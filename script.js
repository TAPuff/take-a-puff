document.addEventListener("DOMContentLoaded", () => {
  const vape = document.getElementById("vape");
  const smokeLayer = document.getElementById("smoke-layer");

  let puffCount = Number(localStorage.getItem("puffs")) || 0;
  document.getElementById("puff-count").textContent = puffCount;
  let secretUnlocked = localStorage.getItem("secret") === "true";
  let smokeColor = "#FF4FD8";
  let dragging = false;
  let interval = null;
  let overpuff = 0; // for cough or long drag effects

  if (secretUnlocked) unlockSecretFlavor();

  const shareBtn = document.getElementById("share-btn");

  /* ===== SHARE PUFF SCORE ===== */
  let shareTimeout;
  shareBtn.addEventListener("click", () => {
    clearTimeout(shareTimeout);

    const text = `💨 TAKE A PUFF 💨\nPUFFS: ${puffCount}\nTicker: $PUFF`;
    navigator.clipboard.writeText(text);

    shareBtn.innerText = "COPIED!";
    shareTimeout = setTimeout(() => {
      shareBtn.innerText = "📸 SHARE PUFF SCORE";
    }, 1200);
  });

  /* ===== SPAWN SMOKE FROM VAPE ===== */
  function spawnSmoke() {
    const mouth = document.getElementById("vape-mouth");
    if (!mouth) return;

    const rect = mouth.getBoundingClientRect();

    for (let i = 0; i < 4; i++) {
      const smoke = document.createElement("div");
      smoke.className = "smoke";

      const spreadX = (Math.random() - 0.5) * 60;
      const size = 24 + Math.random() * 40;

      smoke.style.left = rect.left + rect.width / 2 + spreadX + "px";
      smoke.style.top = rect.top + "px";
      smoke.style.width = size + "px";
      smoke.style.height = size + "px";
      smoke.style.background = smokeColor;
      smoke.style.opacity = 0.4 + Math.random() * 0.3;
      smoke.style.filter = `blur(${2 + Math.random() * 4}px)`;

      document.body.appendChild(smoke);

      smoke.animate([
        { transform: "translateY(0) scale(0.8)", opacity: smoke.style.opacity },
        { transform: `translate(${spreadX}px, ${-180 - Math.random() * 200}px) scale(1.6)`, opacity: 0 }
      ], {
        duration: 3500 + Math.random() * 2000,
        easing: "ease-out",
        fill: "forwards"
      });

      setTimeout(() => smoke.remove(), 6000);
    }

    // PLAY INHALE SFX
    playInhale();
  }

  /* ===== DRAG INTERACTIONS ===== */
  function startDrag(e) {
    e.preventDefault();
    dragging = true;
    spawnSmoke();
    interval = setInterval(spawnSmoke, 140);
    dragStartTime = performance.now(); // for mobile long-press
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    clearInterval(interval);

    puffCount++;
    document.getElementById("puff-count").textContent = puffCount;
    localStorage.setItem("puffs", puffCount);

    // Long drag effects
    const hold = performance.now() - dragStartTime;
    if (hold >= 2000) {
      triggerCRT();
      overpuff++;
      if (overpuff >= 3) triggerCough();
    } else {
      overpuff = 0;
    }

    // Unlock secret flavor
    if (puffCount >= 100) unlockSecretFlavor();

    // Play exhale SFX after puff
    playExhale();
  }

  vape.addEventListener("mousedown", startDrag);
  vape.addEventListener("touchstart", startDrag, { passive: false });
  window.addEventListener("mouseup", endDrag);
  window.addEventListener("touchend", endDrag);

  /* ===== CURSOR SMOKE ===== */
  document.addEventListener("mousemove", e => {
    const puff = document.createElement("div");
    puff.className = "cursor-smoke";
    puff.style.left = e.clientX + "px";
    puff.style.top = e.clientY + "px";
    puff.style.background = smokeColor;

    document.body.appendChild(puff);
    setTimeout(() => puff.remove(), 1500);
  });

  /* ===== FLAVOR BUTTONS ===== */
  document.querySelectorAll("#flavors button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#flavors button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      smokeColor = btn.dataset.color;
    });
  });

  /* ===== SECRET FLAVOR ===== */
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

  /* ===== CRT FLICKER FOR LONG DRAG ===== */
  function triggerCRT() {
    const crt = document.getElementById("crt");
    crt.style.opacity = "1";
    setTimeout(() => crt.style.opacity = "", 100);
    setTimeout(() => crt.style.opacity = "1", 200);
    setTimeout(() => crt.style.opacity = "", 300);
  }

  /* ===== COUGH / OVERPUFF EFFECT ===== */
  function triggerCough() {
    document.body.style.filter = "contrast(1.4)";
    setTimeout(() => document.body.style.filter = "", 300);
    overpuff = 0;
  }

  /* ===== SFX ===== */
  const inhaleSFX = new Audio("sounds/inhale.mp3"); // Add your sound file
  const exhaleSFX = new Audio("sounds/exhale.mp3");

  function playInhale() {
    inhaleSFX.currentTime = 0;
    inhaleSFX.play();
  }

  function playExhale() {
    exhaleSFX.currentTime = 0;
    exhaleSFX.play();
  }

  /* ===== MOBILE LONG-PRESS TUNING ===== */
  let dragStartTime = 0;
  vape.addEventListener("touchstart", startDrag, { passive: false });
  vape.addEventListener("touchend", endDrag);

});
