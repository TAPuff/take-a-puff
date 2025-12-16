document.addEventListener("DOMContentLoaded", () => {
  const vape = document.getElementById("vape");
  const smokeLayer = document.getElementById("smoke-layer");
  const flavorButtons = document.querySelectorAll("#flavors button");
  const shareBtn = document.getElementById("share-btn");

  let puffCount = Number(localStorage.getItem("puffs")) || 0;
  let longDragCount = Number(localStorage.getItem("longDrags")) || 0;
  let secretUnlocked = localStorage.getItem("secret") === "true";
  let dragging = false;
  let dragStart = null;
  let interval = null;
  let overpuff = 0;
  let smokeColor = "#FF4FD8";

  const counter = document.getElementById("counter");
  document.getElementById("puff-count").textContent = puffCount;
  document.getElementById("long-drag-count").textContent = longDragCount;

  // FLAVOR SELECTION
  flavorButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      flavorButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      smokeColor = btn.dataset.color;
    });
  });

  // ===== SPAWN SMOKE =====
  function spawnSmoke(hold, burst = false) {
    const vapeRect = vape.getBoundingClientRect();
    const layerRect = smokeLayer.getBoundingClientRect();

    // Vape tip relative to smoke-layer
    const vapeX = vapeRect.left + vapeRect.width * 0.52 - layerRect.left;
    const vapeY = vapeRect.top + vapeRect.height * 0.2 - layerRect.top;

    const intensity = Math.min(hold / 600, 5);
    const baseCount = burst ? 20 : 6;
    const count = Math.floor(baseCount * intensity);

    for (let i = 0; i < count; i++) {
      const cluster = document.createElement("div");
      cluster.className = "smoke-cluster";
      cluster.style.left = vapeX + "px";
      cluster.style.top = vapeY + "px";
      smokeLayer.appendChild(cluster);

      const squares = 3 + Math.floor(Math.random() * 5);
      for (let j = 0; j < squares; j++) {
        const s = document.createElement("div");
        s.className = "smoke";
        const size = 8 + Math.random() * 24;
        s.style.width = s.style.height = size + "px";
        s.style.background = smokeColor;
        s.style.left = Math.random() * 20 - 10 + "px";
        s.style.top = Math.random() * 20 - 10 + "px";
        s.style.opacity = 0.4 + Math.random() * 0.4;

        cluster.appendChild(s);

        const driftX = Math.random() * 120 - 60;
        const driftY = -Math.random() * 200 - 80;
        const duration = 2000 + Math.random() * 2000;

        s.animate([
          { transform: "translate(0,0) scale(0.8)", opacity: parseFloat(s.style.opacity) },
          { transform: `translate(${driftX}px, ${driftY}px) scale(${1 + Math.random()})`, opacity: 0 }
        ], { duration, easing: "cubic-bezier(0.4,0,0.2,1)", fill: "forwards" });
      }

      setTimeout(() => cluster.remove(), 5000);
    }
  }

  // ===== DRAG INTERACTIONS =====
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
    document.body.classList.add("zoom");
    setTimeout(() => document.body.classList.remove("zoom"), 150);
  }

  // ===== CURSOR TRAIL AS SMOKE =====
  const trailElements = [];
  const maxTrail = 25;

  const cursorTrailLayer = document.createElement("div");
  cursorTrailLayer.style.position = "fixed";
  cursorTrailLayer.style.left = 0;
  cursorTrailLayer.style.top = 0;
  cursorTrailLayer.style.width = "100%";
  cursorTrailLayer.style.height = "100%";
  cursorTrailLayer.style.pointerEvents = "none";
  cursorTrailLayer.style.zIndex = "9999";
  document.body.appendChild(cursorTrailLayer);

  document.addEventListener("mousemove", e => {
    const trail = document.createElement("div");
    trail.className = "smoke";
    const size = 8 + Math.random() * 16;
    trail.style.width = trail.style.height = size + "px";
    trail.style.background = smokeColor;
    trail.style.opacity = 0.2 + Math.random() * 0.3;
    trail.style.position = "fixed";
    trail.style.left = e.clientX + "px";
    trail.style.top = e.clientY + "px";
    trail.style.transform = "translate(-50%, -50%) scale(0.8)";
    cursorTrailLayer.appendChild(trail);
    trailElements.push(trail);

    const driftX = Math.random() * 40 - 20;
    const driftY = -Math.random() * 80 - 20;
    const duration = 2000 + Math.random() * 2000;

    trail.animate([
      { transform: "translate(0,0) scale(0.8)", opacity: parseFloat(trail.style.opacity) },
      { transform: `translate(${driftX}px, ${driftY}px) scale(${1 + Math.random()})`, opacity: 0 }
    ], { duration, easing: "cubic-bezier(0.4,0,0.2,1)", fill: "forwards" });

    setTimeout(() => {
      trail.remove();
      trailElements.shift();
    }, 2200);

    if (trailElements.length > maxTrail) {
      const old = trailElements.shift();
      old.remove();
    }
  });

  // ===== SHARE PUFF SCORE =====
  shareBtn.addEventListener("click",()=> {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFB6D9";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    document.querySelectorAll(".smoke").forEach(s => {
      const rect = s.getBoundingClientRect();
      ctx.fillStyle = s.style.background;
      ctx.globalAlpha = parseFloat(s.style.opacity);
      ctx.fillRect(rect.left, rect.top, parseFloat(s.style.width), parseFloat(s.style.height));
      ctx.globalAlpha = 1;
    });

    const vapeRect = vape.getBoundingClientRect();
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = vape.src;
    img.onload = () => {
      ctx.drawImage(img, vapeRect.left, vapeRect.top, vapeRect.width, vapeRect.height);
      ctx.font = "20px 'Press Start 2P'";
      ctx.fillStyle = "#FFD700";
      ctx.fillText(`PUFFS: ${puffCount}`,20,40);
      ctx.fillText(`LONG DRAGS: ${longDragCount}`,20,70);
      if(secretUnlocked) ctx.fillText("💎 GOLDEN PUFF UNLOCKED!",20,100);
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `PUFF_SCORE_${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };
  });

  // ===== SECRET FLAVOR =====
  function unlockSecretFlavor() {
    secretUnlocked = true;
    localStorage.setItem("secret","true");
    const overlay = document.createElement("div");
    overlay.id = "unlock-overlay";
    overlay.innerHTML = `<div id="unlock-box"><h2>SECRET FLAVOR</h2><p>💎 GOLDEN PUFF UNLOCKED</p></div>`;
    document.body.appendChild(overlay);
    setTimeout(()=>overlay.remove(),2000);

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

  // ===== COUGH EASTER EGG =====
  function triggerCough() {
    overpuff = 0;
    document.body.style.filter = "contrast(1.4)";
    setTimeout(()=>document.body.style.filter="",300);
  }

  // ===== SECTION OBSERVER (unchanged) =====
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