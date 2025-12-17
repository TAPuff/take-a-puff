document.addEventListener("DOMContentLoaded", () => {
  const vape = document.getElementById("vape");
  let puffCount = Number(localStorage.getItem("puffs")) || 0;
  let overpuff = Number(localStorage.getItem("longPuffs")) || 0; // persist long drags
  let smokeColor = "#FF4FD8";
  let dragging = false;
  let interval = null;
  let dragStartTime = 0;

  const puffCounter = document.getElementById("puff-count");
  const longCounter = document.getElementById("long-drag-count");
  puffCounter.textContent = puffCount;
  longCounter.textContent = overpuff;

  const shareBtn = document.getElementById("share-btn");

  // ===== SHARE PUFF SCORE =====
  shareBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(`💨 TAKE A PUFF 💨\nPUFFS: ${puffCount}\nLONG DRAGS: ${overpuff}\nTicker: $PUFF`);
    shareBtn.innerText = "COPIED!";
    setTimeout(() => shareBtn.innerText = "📸 SHARE PUFF SCORE", 1200);
  });

  // ===== SPAWN SMOKE =====
  function spawnSmoke() {
    const mouth = document.getElementById("vape-mouth");
    if (!mouth) return;

    const rect = mouth.getBoundingClientRect();
    for (let i = 0; i < 6; i++) { // more smoke
      const smoke = document.createElement("div");
      smoke.className = "smoke";

      const spreadX = (Math.random() - 0.5) * 100; // wider
      const size = 30 + Math.random() * 50; // bigger smoke

      smoke.style.left = rect.left + rect.width / 2 + spreadX + "px";
      smoke.style.top = rect.top + "px";
      smoke.style.width = size + "px";
      smoke.style.height = size + "px";
      smoke.style.background = smokeColor;
      smoke.style.opacity = 0.3 + Math.random() * 0.5;
      smoke.style.filter = `blur(${3 + Math.random() * 6}px)`;

      document.body.appendChild(smoke);

      smoke.animate([
        { transform: "translateY(0) scale(0.8)", opacity: smoke.style.opacity },
        { transform: `translate(${spreadX}px, ${-250 - Math.random() * 200}px) scale(2)`, opacity: 0 }
      ], {
        duration: 4000 + Math.random() * 2000,
        easing: "ease-out",
        fill: "forwards"
      });

      setTimeout(() => smoke.remove(), 7000);
    }

    // play inhale
    playInhale();
  }

  // ===== DRAG PUFF =====
  function startDrag(e) {
    e.preventDefault();
    dragging = true;
    spawnSmoke();
    interval = setInterval(spawnSmoke, 150);
    dragStartTime = performance.now();
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    clearInterval(interval);

    puffCount++;
    puffCounter.textContent = puffCount;
    localStorage.setItem("puffs", puffCount);

    const hold = performance.now() - dragStartTime;
    if (hold >= 2000) { // long drag
      overpuff++;
      longCounter.textContent = overpuff;
      localStorage.setItem("longPuffs", overpuff);
      triggerCRT();
      if (overpuff % 3 === 0) triggerCough(); // every 3 long drags
    }

    playExhale();

    if (puffCount >= 100) unlockSecretFlavor();
  }

  vape.addEventListener("mousedown", startDrag);
  vape.addEventListener("touchstart", startDrag, { passive: false });
  window.addEventListener("mouseup", endDrag);
  window.addEventListener("touchend", endDrag);

  // ===== CURSOR SMOKE =====
  document.addEventListener("mousemove", e => {
    const puff = document.createElement("div");
    puff.className = "cursor-smoke";
    puff.style.left = e.clientX + "px";
    puff.style.top = e.clientY + "px";
    puff.style.background = smokeColor;
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

  // ===== SFX =====
  const inhaleSFX = new Audio("sounds/inhale.mp3");
  const exhaleSFX = new Audio("sounds/exhale.mp3");

  function playInhale() {
    inhaleSFX.currentTime = 0;
    inhaleSFX.play();
  }

  function playExhale() {
    exhaleSFX.currentTime = 0;
    exhaleSFX.play();
  }
});
