document.addEventListener("DOMContentLoaded", () => {
  const vape = document.getElementById("vape");
  const flavorButtons = document.querySelectorAll("#flavors button");
  const shareBtn = document.getElementById("share-btn");

  // PUFF COUNTERS & SECRET
  let puffCount = Number(localStorage.getItem("puffs")) || 0;
  let longDragCount = Number(localStorage.getItem("longDrags")) || 0;
  let secretUnlocked = localStorage.getItem("secret") === "true";

  document.getElementById("puff-count").textContent = puffCount;
  document.getElementById("long-drag-count").textContent = longDragCount;

  // DEFAULT SMOKE COLOR
  let smokeColor = "#FF4FD8";

  // MAIN CURSOR
  const mainCursor = document.createElement("div");
  mainCursor.className = "pixel-cursor main";
  document.body.appendChild(mainCursor);

  // FLAVOR BUTTONS
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
    const vapeY = vapeRect.top + vapeRect.height * 0.1;

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
      document.body.appendChild(smoke);

      setTimeout(() => smoke.remove(), 5000); // match CSS animation
    }
  }

  // DRAG INTERACTIONS
  let dragging = false;
  let dragStart = null;
  let interval = null;
  let overpuff = 0;

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
    localStorage.setItem("puffs", puffCount);
    if (hold >= 1800) {
      longDragCount++;
      localStorage.setItem("longDrags", longDragCount);
    }

    spawnSmoke(hold * 1.6, true);

    if (hold > 2500) {
      for (let i = 0; i < 3; i++) setTimeout(() => spawnSmoke(hold * 2, true), i * 200);
      screenZoom();
    }

    updateCounter();

    if (puffCount >= 100 && !secretUnlocked) unlockSecretFlavor();

    if (hold > 2600) {
      overpuff++;
      if (overpuff >= 3) triggerCough();
    } else overpuff = 0;
  }

  vape.addEventListener("mousedown", startDrag);
  vape.addEventListener("touchstart", startDrag, { passive: false });
  window.addEventListener("mouseup", endDrag);
  window.addEventListener("touchend", endDrag);

  function updateCounter() {
    document.getElementById("puff-count").textContent = puffCount;
    document.getElementById("long-drag-count").textContent = longDragCount;
  }

  function screenZoom() {
    const body = document.body;
    body.classList.add("zoom");
    setTimeout(() => body.classList.remove("zoom"), 150);
  }

  // CURSOR TRAIL
  const trailElements = [];
  const maxTrail = 25;

  document.addEventListener("mousemove", e => {
    mainCursor.style.left = e.clientX + "px";
    mainCursor.style.top = e.clientY + "px";

    const trail = document.createElement("div");
    trail.className = "pixel-cursor";
    trail.style.left = e.clientX + "px";
    trail.style.top = e.clientY + "px";
    trail.style.background = smokeColor;
    document.body.appendChild(trail);
    trailElements.push(trail);

    const driftX = (Math.random() - 0.5) * 20;
    const driftY = -20 - Math.random() * 40;

    trail.animate([
      { transform: `translate(-50%, -50%) translate(0,0) scale(0.8)`, opacity: 0.6 },
      { transform: `translate(-50%, -50%) translate(${driftX}px, ${driftY}px) scale(1.2)`, opacity: 0 }
    ], {
      duration: 2000 + Math.random() * 2000,
      easing: "ease-out",
      fill: "forwards"
    });

    if (trailElements.length > maxTrail) {
      const old = trailElements.shift();
      old.remove();
    }

    setTimeout(() => { if (trail.parentNode) trail.remove(); }, 4000);
  });

  // SECRET FLAVOR
  function unlockSecretFlavor() {
    secretUnlocked = true;
    localStorage.setItem("secret", "true");

    if (!document.getElementById("unlock-overlay")) {
      const overlay = document.createElement("div");
      overlay.id = "unlock-overlay";
      overlay.innerHTML = `
        <div id="unlock-box">
          <h2>SECRET FLAVOR</h2>
          <p>💎 GOLDEN PUFF UNLOCKED</p>
        </div>`;
      document.body.appendChild(overlay);
      setTimeout(() => overlay.remove(), 2000);
    }

    if (!document.querySelector("#flavors button[data-color='#FFD700']")) {
      const btn = document.createElement("button");
      btn.innerText = "💎 GOLDEN PUFF";
      btn.dataset.color = "#FFD700";
      btn.onclick = () => {
        document.querySelectorAll("#flavors button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        smokeColor = "#FFD700";
      };
      document.getElementById("flavors").appendChild(btn);
    }
  }

  // COUGH EASTER EGG
  function triggerCough() {
    overpuff = 0;
    document.body.style.filter = "contrast(1.4)";
    setTimeout(() => document.body.style.filter = "", 300);
  }

  // INITIAL SECRET CHECK
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
