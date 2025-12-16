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
  const vapeX = vapeRect.left + vapeRect.width*0.52 - layerRect.left;
  const vapeY = vapeRect.top + vapeRect.height*0.1 - layerRect.top;

  const intensity = Math.min(hold / 600, 5);
  const baseCount = burst ? 20 : 6;
  const count = Math.floor(baseCount * intensity);

  for (let i=0; i<count; i++){
    const smoke = document.createElement("div");
    smoke.className = "pixel-cursor"; // use same style as cursor trail
    smoke.style.left = vapeX + "px";
    smoke.style.top = vapeY + "px";
    smoke.style.width = (8 + Math.random()*12) + "px";
    smoke.style.height = smoke.style.width;
    smoke.style.background = smokeColor;
    smoke.style.opacity = 0.4 + Math.random()*0.4;
    smoke.style.filter = `blur(${1+Math.random()*2}px)`;
    smoke.style.position = "absolute";
    smokeLayer.appendChild(smoke);

    // Animate float upwards like smoke
    const driftX = (Math.random()-0.5)*40;
    const driftY = -50 - Math.random()*80;
    const duration = 2000 + Math.random()*2000;

    smoke.animate([
      { transform: `translate(0px,0px) scale(0.8)`, opacity: parseFloat(smoke.style.opacity) },
      { transform: `translate(${driftX}px, ${driftY}px) scale(1.2)`, opacity: 0 }
    ], {
      duration,
      easing: "ease-out",
      fill: "forwards"
    });

    setTimeout(()=>smoke.remove(), duration+50);
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
  const body = document.body;
  body.classList.add("zoom");

  // Quick shake for cinematic effect
  const start = performance.now();
  const duration = 150;
  const amplitude = 6; 

  function shakeFrame(time) {
    const progress = (time - start)/duration;
    if(progress < 1){
      const x = (Math.random()-0.5)*amplitude;
      const y = (Math.random()-0.5)*amplitude;
      body.style.transform = `scale(1.02) translate(${x}px, ${y}px)`;
      requestAnimationFrame(shakeFrame);
    } else {
      body.style.transform = "";
      body.classList.remove("zoom");
    }
  }
  requestAnimationFrame(shakeFrame);
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

 // ===== PIXELATED SMOKE CURSOR TRAIL =====
const trailElements = [];
const maxTrail = 20; // more particles for smoother smoke

document.addEventListener("mousemove", e => {
  // Main “cursor” stays invisible
  let mainCursor = document.querySelector(".pixel-cursor.main");
  if (!mainCursor) {
    mainCursor = document.createElement("div");
    mainCursor.className = "pixel-cursor main";
    document.body.appendChild(mainCursor);
  }
  mainCursor.style.left = e.clientX + "px";
  mainCursor.style.top = e.clientY + "px";

  // Spawn smoke trail particles
  const trail = document.createElement("div");
  trail.className = "pixel-cursor";
  trail.style.left = e.clientX + "px";
  trail.style.top = e.clientY + "px";
  trail.style.background = smokeColor || "#FF4FD8"; // matches vape flavor
  trail.style.width = (8 + Math.random() * 12) + "px"; // random size like smoke
  trail.style.height = trail.style.width;
  trail.style.opacity = 0.4 + Math.random() * 0.4;
  trail.style.filter = `blur(${1 + Math.random()*2}px)`;
  trail.style.transform = "translate(-50%, -50%) scale(0.8)";
  document.body.appendChild(trail);
  trailElements.push(trail);

  // Animate trail float upwards
  const driftX = (Math.random() - 0.5) * 20;
  const driftY = -20 - Math.random() * 40;
  trail.animate([
    { transform: `translate(-50%, -50%) translate(0px,0px) scale(0.8)`, opacity: parseFloat(trail.style.opacity) },
    { transform: `translate(-50%, -50%) translate(${driftX}px, ${driftY}px) scale(1.2)`, opacity: 0 }
  ], {
    duration: 2000 + Math.random() * 2000,
    easing: "ease-out",
    fill: "forwards"
  });

  // Remove old trails
  if (trailElements.length > maxTrail) {
    const old = trailElements.shift();
    old.remove();
  }

  // Automatically remove after 4s (just in case)
  setTimeout(() => {
    if (trail.parentNode) trail.remove();
  }, 4000);
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

  // ===== SECRET FLAVOR PERSISTENCE =====
function unlockSecretFlavor(){
  secretUnlocked = true;
  localStorage.setItem("secret", "true");

  // Show overlay only once per unlock
  if (!document.getElementById("unlock-overlay")) {
    const overlay = document.createElement("div");
    overlay.id="unlock-overlay";
    overlay.innerHTML=`
      <div id="unlock-box">
        <h2>SECRET FLAVOR</h2>
        <p>💎 GOLDEN PUFF UNLOCKED</p>
      </div>`;
    document.body.appendChild(overlay);
    setTimeout(()=>overlay.remove(),2000);
  }

  // Add button if not already in DOM
  if (!document.querySelector("#flavors button[data-color='#FFD700']")) {
    const btn = document.createElement("button");
    btn.innerText="💎 GOLDEN PUFF";
    btn.dataset.color="#FFD700";
    btn.onclick = () => {
      document.querySelectorAll("#flavors button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      smokeColor = "#FFD700";
    };
    document.getElementById("flavors").appendChild(btn);
  }
}

// ===== ON PAGE LOAD: RESTORE SECRET + COUNTER =====
document.addEventListener("DOMContentLoaded", () => {
  // Restore puff counts
  puffCount = Number(localStorage.getItem("puffs")) || 0;
  longDragCount = Number(localStorage.getItem("longDrags")) || 0;
  secretUnlocked = localStorage.getItem("secret") === "true";

  document.getElementById("puff-count").textContent = puffCount;
  document.getElementById("long-drag-count").textContent = longDragCount;

  // Restore secret flavor if unlocked
  if (secretUnlocked) unlockSecretFlavor();
});


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