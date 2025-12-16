document.addEventListener("DOMContentLoaded", () => {
  const vape = document.getElementById("vape");
  const smokeLayer = document.getElementById("smoke-layer");
  const flavorButtons = document.querySelectorAll("#flavors button");
  const shareBtn = document.getElementById("share-btn");

  // ONE SET OF VARIABLES
  let puffCount = Number(localStorage.getItem("puffs")) || 0;
  let longDragCount = Number(localStorage.getItem("longDrags")) || 0;
  let secretUnlocked = localStorage.getItem("secret") === "true";
  let dragging = false;
  let dragStart = null;
  let interval = null;
  let overpuff = 0;
  let smokeColor = "#FF4FD8";

  // SCREEN ZOOM EFFECT FOR CINEMATIC CLOUD
function screenZoom() {
  const body = document.body;
  body.classList.add("zoom");

  // Add a quick shake
  const start = performance.now();
  const duration = 150;
  const amplitude = 6; // shake distance in px

  function shakeFrame(time) {
    const progress = (time - start) / duration;
    if (progress < 1) {
      const x = (Math.random() - 0.5) * amplitude;
      const y = (Math.random() - 0.5) * amplitude;
      body.style.transform = `scale(1.02) translate(${x}px, ${y}px)`;
      requestAnimationFrame(shakeFrame);
    } else {
      body.style.transform = ""; // reset
      body.classList.remove("zoom");
    }
  }
  requestAnimationFrame(shakeFrame);
}

  // COUNTER ELEMENT
  const counter = document.getElementById("counter");
  document.getElementById("puff-count").textContent = puffCount;
  document.getElementById("long-drag-count").textContent = longDragCount;
}

  // FLAVOR SELECTION
  flavorButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      flavorButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      smokeColor = btn.dataset.color;
    });
  });

  // VAPE INTERACTIONS
  function spawnSmoke(hold, burst = false) {
  const vapeZone = document.getElementById("vape-zone");
  const vapeRect = vape.getBoundingClientRect();
  const zoneRect = vapeZone.getBoundingClientRect();

  // Position relative to vape-zone
  const vapeX = vape.offsetLeft + vape.width * 0.52; // mouthpiece X
  const vapeY = vape.offsetTop + vape.height * 0.1;  // mouthpiece Y

  const intensity = Math.min(hold / 600, 5);
  const baseCount = burst ? 20 : 6;
  const count = Math.floor(baseCount * intensity);

  for (let i = 0; i < count; i++) {
    const cluster = document.createElement("div");
    cluster.className = "smoke-cluster";

    // position inside vape-zone
    cluster.style.position = "absolute";
    cluster.style.left = vapeX + "px";
    cluster.style.top = vapeY + "px";
    cluster.style.opacity = 0.6 + Math.random() * 0.3;

    vapeZone.appendChild(cluster);

    const puffTypeRand = Math.random();
    let squares, sizeRange, driftRange, durationRange, opacityRange;

    if (puffTypeRand < 0.4) { // Tiny puff
      squares = 2 + Math.floor(Math.random() * 3);
      sizeRange = [4, 8];
      driftRange = [40, 120];
      durationRange = [1500, 2500];
      opacityRange = [0.3, 0.5];
    } else if (puffTypeRand < 0.85) { // Normal puff
      squares = 5 + Math.floor(Math.random() * 6);
      sizeRange = [8, 14];
      driftRange = [80, 160];
      durationRange = [2000, 3000];
      opacityRange = [0.5, 0.7];
    } else { // Cinematic puff
      squares = 8 + Math.floor(Math.random() * 6);
      sizeRange = [12, 28];
      driftRange = [120, 240];
      durationRange = [2500, 4000];
      opacityRange = [0.55, 0.85];
    }

    for (let j = 0; j < squares; j++) {
      const s = document.createElement("div");
      s.className = "smoke";
      const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
      s.style.width = s.style.height = size + "px";
      s.style.background = smokeColor;
      s.style.position = "absolute";

      // slight random offset inside cluster
      s.style.left = Math.random() * 30 - 15 + "px";
      s.style.top = Math.random() * 30 - 15 + "px";
      s.style.opacity = opacityRange[0] + Math.random() * (opacityRange[1] - opacityRange[0]);

      cluster.appendChild(s);

      const driftX = Math.random() * driftRange[1] - driftRange[1]/2;
      const driftY = -driftRange[0] - Math.random() * (driftRange[1]-driftRange[0]);
      const duration = durationRange[0] + Math.random() * (durationRange[1]-durationRange[0]);

      s.animate([
        { transform: "translate(0px,0px) scale(0.8)", opacity: parseFloat(s.style.opacity) },
        { transform: `translate(${driftX}px, ${driftY}px) scale(${0.8 + Math.random()})`, opacity: 0 }
      ], { duration: duration, easing: "cubic-bezier(0.4,0,0.2,1)", fill: "forwards" });
    }

    setTimeout(() => cluster.remove(), 4000);
  }
}


  function startDrag(e){
    e.preventDefault();
    dragging = true;
    dragStart = performance.now();
    interval = setInterval(()=>{
      spawnSmoke(performance.now() - dragStart);
    },140);
  }

  function endDrag(){
    if(!dragging) return;
    dragging = false;
    clearInterval(interval);

    const hold = performance.now() - dragStart;
    puffCount++;
    localStorage.setItem("puffs", puffCount);
    if(hold>=1800){
      longDragCount++;
      localStorage.setItem("longDrags", longDragCount);
    }

    spawnSmoke(hold*1.6,true);

    // ===== EXTRA CINEMATIC CLOUD FOR REALLY LONG DRAG =====
  if (hold > 2500) {
    for (let i = 0; i < 3; i++) { // spawn 3 extra massive clusters
      setTimeout(() => spawnSmoke(hold*2, true), i*200);
    }
    screenZoom(); // shake/zoom effect
  }

    updateCounter();

    if(puffCount>=100 && !secretUnlocked) unlockSecretFlavor();
    if(hold > 2500){
  // Spawn 3 extra massive smoke clusters
  for(let i = 0; i < 3; i++){
    setTimeout(() => spawnSmoke(hold*2, true), i * 200);
  }
  screenZoom(); // screen shake for cinematic effect
}

// Handle coughing like before
if(hold > 2600){
  overpuff++;
  if(overpuff >= 3) triggerCough();
} else overpuff = 0;
  }

  vape.addEventListener("mousedown", startDrag);
  vape.addEventListener("touchstart", startDrag,{passive:false});
  window.addEventListener("mouseup", endDrag);
  window.addEventListener("touchend", endDrag);

  // SECRET FLAVOR
  function unlockSecretFlavor(){
    secretUnlocked=true;
    localStorage.setItem("secret","true");
    const overlay = document.createElement("div");
    overlay.id="unlock-overlay";
    overlay.innerHTML=`
      <div id="unlock-box">
        <h2>SECRET FLAVOR</h2>
        <p>💎 GOLDEN PUFF UNLOCKED</p>
      </div>`;
    document.body.appendChild(overlay);

    setTimeout(()=>overlay.remove(),2000);

    const btn = document.createElement("button");
    btn.innerText="💎 GOLDEN PUFF";
    btn.dataset.color="#FFD700";
    btn.onclick=()=>{
      document.querySelectorAll("#flavors button").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      smokeColor="#FFD700";
    };
    document.getElementById("flavors").appendChild(btn);
  }

  // COUGH EASTER EGG
  function triggerCough(){
    overpuff=0;
    document.body.style.filter="contrast(1.4)";
    setTimeout(()=>document.body.style.filter="",300);
  }

  // SHARE PUFF SCORE
  shareBtn.addEventListener("click",()=>{
    const canvas=document.createElement("canvas");
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    const ctx=canvas.getContext("2d");
    ctx.fillStyle="#FFB6D9";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    document.querySelectorAll(".smoke").forEach(s=>{
      const rect=s.getBoundingClientRect();
      ctx.fillStyle=s.style.background;
      ctx.globalAlpha=parseFloat(s.style.opacity);
      ctx.fillRect(rect.left,rect.top,parseFloat(s.style.width),parseFloat(s.style.height));
      ctx.globalAlpha=1;
    });

    const vapeRect=vape.getBoundingClientRect();
    const img=new Image();
    img.crossOrigin="anonymous";
    img.src=vape.src;
    img.onload=()=>{
      ctx.drawImage(img,vapeRect.left,vapeRect.top,vapeRect.width,vapeRect.height);
      ctx.font="20px 'Press Start 2P'";
      ctx.fillStyle="#FFD700";
      ctx.fillText(`PUFFS: ${puffCount}`,20,40);
      ctx.fillText(`LONG DRAGS: ${longDragCount}`,20,70);
      if(secretUnlocked) ctx.fillText("💎 GOLDEN PUFF UNLOCKED!",20,100);
      canvas.toBlob(blob=>{
        const url=URL.createObjectURL(blob);
        const a=document.createElement("a");
        a.href=url;
        a.download=`PUFF_SCORE_${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };
  });

const sections = document.querySelectorAll("section");
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("show");
    }
  });
},{threshold: 0.2});

sections.forEach(sec => observer.observe(sec));

// ===== PIXEL CURSOR + SMOOTH TRAIL =====
const pixelCursor = document.createElement("div");
pixelCursor.className = "pixel-cursor";
document.body.appendChild(pixelCursor);

const trailElements = [];
const maxTrail = 15;

document.addEventListener("mousemove", e => {
  // Move main cursor
  pixelCursor.style.left = e.clientX + "px";
  pixelCursor.style.top = e.clientY + "px";

  // Add new trail element
  const trail = document.createElement("div");
  trail.className = "pixel-cursor";
  trail.style.left = e.clientX + "px";
  trail.style.top = e.clientY + "px";
  trail.style.opacity = 0.6;
  trail.style.background = "#FF4FD8"; 
  trail.style.width = "12px";
  trail.style.height = "12px";
  trail.style.borderRadius = "50%";
  trail.style.pointerEvents = "none";
  trail.style.position = "fixed";
  trail.style.transform = "translate(-50%, -50%) scale(0.8)";
  document.body.appendChild(trail);
  trailElements.push(trail);

  // Animate trail fade
  let alpha = 0.6;
  const fade = setInterval(() => {
    alpha -= 0.05;
    if (alpha <= 0) {
      trail.remove();
      trailElements.shift();
      clearInterval(fade);
    } else trail.style.opacity = alpha;
  }, 16);

  // Keep trail array limited
  if (trailElements.length > maxTrail) {
    const old = trailElements.shift();
    old.remove();
  }
});
