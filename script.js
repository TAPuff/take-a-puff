document.addEventListener("DOMContentLoaded", () => {
  const vape = document.getElementById("vape");
  const flavorButtons = document.querySelectorAll("#flavors button");
  const smokeLayer = document.getElementById("smoke-layer");

  let puffCount = Number(localStorage.getItem("puffs")) || 0;
  let longDragCount = Number(localStorage.getItem("longDrags")) || 0;
  let secretUnlocked = localStorage.getItem("secret") === "true";
  let smokeColor = "#FF4FD8";
  let dragging = false;
  let dragStart = null;
  let interval = null;

  // UPDATE COUNTERS
  function updateCounter() {
    document.getElementById("puff-count").textContent = puffCount;
    document.getElementById("long-drag-count").textContent = longDragCount;
  }
  updateCounter();

  // FLAVOR SELECTION
  flavorButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      flavorButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      smokeColor = btn.dataset.color;
    });
  });

  // SPAWN SMOKE
  function spawnSmoke(hold = 500, burst = false) {
    const vapeRect = vape.getBoundingClientRect();
    const vapeX = vapeRect.left + vapeRect.width / 2;
    const vapeY = vapeRect.top + vapeRect.height / 2;

    const intensity = Math.min(hold / 600, 5);
    const baseCount = burst ? 20 : 6;
    const count = Math.floor(baseCount * intensity);

    for (let i = 0; i < count; i++) {
      const smoke = document.createElement("div");
      smoke.className = "smoke";
      smoke.style.left = vapeX + "px";
      smoke.style.top = vapeY + "px";
      smoke.style.background = smokeColor;
      smoke.style.setProperty("--drift", `${(Math.random() - 0.5) * 100}px`);
      smokeLayer.appendChild(smoke);

      // Remove after animation
      smoke.addEventListener("animationend", () => smoke.remove());
    }
  }

  // DRAG INTERACTIONS
  function startDrag(e) {
    e.preventDefault();
    dragging = true;
    dragStart = performance.now();
    interval = setInterval(() => spawnSmoke(performance.now() - dragStart), 140);
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    clearInterval(interval);

    const hold = performance.now() - dragStart;
    puffCount++;
    if (hold >= 1800) longDragCount++;
    updateCounter();

    spawnSmoke(hold * 1.5, true);

    if (puffCount >= 100 && !secretUnlocked) unlockSecretFlavor();
  }

  vape.addEventListener("mousedown", startDrag);
  vape.addEventListener("touchstart", startDrag, { passive: false });
  window.addEventListener("mouseup", endDrag);
  window.addEventListener("touchend", endDrag);

  // SECRET FLAVOR
  function unlockSecretFlavor() {
    secretUnlocked = true;
    localStorage.setItem("secret", "true");

    const overlay = document.createElement("div");
    overlay.id = "unlock-overlay";
    overlay.innerHTML = `
      <div id="unlock-box">
        <h2>SECRET FLAVOR</h2>
        <p>💎 GOLDEN PUFF UNLOCKED</p>
      </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 2000);

    const btn = document.createElement("button");
    btn.innerText = "💎 GOLDEN PUFF";
    btn.dataset.color = "#FFD700";
    btn.onclick = () => {
      flavorButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      smokeColor = "#FFD700";
    };
    document.getElementById("flavors").appendChild(btn);
  }
  if (secretUnlocked) unlockSecretFlavor();
});

  // ===== SECTION OBSERVER =====
  const sections = document.querySelectorAll("section");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("show");
      }
    });
  },{threshold: 0.2});

  sections.forEach(sec => observer.observe(sec));
});
