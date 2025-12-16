document.addEventListener("DOMContentLoaded", () => {
  const vape = document.getElementById("vape");
  const smokeLayer = document.getElementById("smoke-layer");
  const flavorButtons = document.querySelectorAll("#flavors button");
  const shareBtn = document.getElementById("share-btn");
  const shareGifBtn = document.getElementById("share-gif-btn");

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
  document.body.classList.add("zoom");
  setTimeout(() => document.body.classList.remove("zoom"), 150);
}

  // COUNTER ELEMENT
  const counter = document.createElement("div");
  counter.id = "counter";
  updateCounter();
  document.getElementById("vape-zone").appendChild(counter);

  function updateCounter() {
    counter.innerText = `PUFFS: ${puffCount}  |  LONG DRAGS: ${longDragCount}`;
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
  const rect = vape.getBoundingClientRect();
  const intensity = Math.min(hold / 600, 5); // intensity grows faster for long drag
  const baseCount = burst ? 20 : 6; // more clusters for burst (long drag)
  const count = Math.floor(baseCount * intensity);

  for (let i = 0; i < count; i++) {
    const cluster = document.createElement("div");
    cluster.className = "smoke-cluster";
    cluster.style.left = rect.left + rect.width / 2 + (Math.random() * 40 - 20) + "px";
    cluster.style.top = rect.top - 10 + "px"; // tip of vape
    cluster.style.opacity = 0.6 + Math.random() * 0.3;
    smokeLayer.appendChild(cluster);

    const squares = Math.floor(5 + Math.random() * 6); // more squares for dense cloud
    for (let j = 0; j < squares; j++) {
      const s = document.createElement("div");
      s.className = "smoke";
      s.style.width = s.style.height = 8 + Math.random() * 12 + "px";
      s.style.background = smokeColor;
      s.style.position = "absolute";
      s.style.left = Math.random() * 30 - 15 + "px";
      s.style.top = Math.random() * 30 - 15 + "px";
      s.style.opacity = Math.random() * 0.6 + 0.3;
      cluster.appendChild(s);

      // cinematic drift
      const driftX = Math.random() * 120 - 60;
      const driftY = -100 - Math.random() * 80;
      const duration = 2500 + Math.random() * 1000;
      s.animate([
        { transform: "translate(0px,0px)", opacity: parseFloat(s.style.opacity) },
        { transform: `translate(${driftX}px, ${driftY}px)`, opacity: 0 }
      ], { duration: duration, easing: "cubic-bezier(0.4,0,0.2,1)", fill: "forwards" });
    }

    setTimeout(() => cluster.remove(), 3000);
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

  // SHARE GIF
  shareGifBtn.addEventListener("click",()=>{
    const gif=new GIF({
      workers:2,
      quality:10,
      width:window.innerWidth,
      height:window.innerHeight,
      workerScript:'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
    });

    const duration=4000;
    const frameRate=8;
    const totalFrames=Math.floor(duration/(1000/frameRate));
    let frame=0;

    const canvas=document.createElement("canvas");
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    const ctx=canvas.getContext("2d");

    const vapeRect=vape.getBoundingClientRect();

    function drawFrame(){
      ctx.fillStyle="#FFB6D9";
      ctx.fillRect(0,0,canvas.width,canvas.height);

      document.querySelectorAll(".smoke").forEach(s=>{
        const rect=s.getBoundingClientRect();
        ctx.fillStyle=s.style.background;
        ctx.globalAlpha=parseFloat(s.style.opacity);
        ctx.fillRect(rect.left,rect.top,parseFloat(s.style.width),parseFloat(s.style.height));
        ctx.globalAlpha=1;
      });

      const img=new Image();
      img.crossOrigin="anonymous";
      img.src=vape.src;
      img.onload=()=>ctx.drawImage(img,vapeRect.left,vapeRect.top,vapeRect.width,vapeRect.height);

      ctx.fillStyle=smokeColor;
      ctx.fillRect(10,10,18,18);

      ctx.font="16px 'Press Start 2P'";
      ctx.fillStyle="#FFD700";
      ctx.fillText(`PUFFS: ${puffCount}`,10,50);
      ctx.fillText(`LONG DRAGS: ${longDragCount}`,10,80);
      if(secretUnlocked) ctx.fillText("💎 GOLDEN PUFF!",10,110);

      if(dragging){
        const offsetX=(Math.random()-0.5)*8;
        const offsetY=(Math.random()-0.5)*8;
        ctx.translate(offsetX,offsetY);
      }

      frame++;
      gif.addFrame(ctx,{copy:true,delay:1000/frameRate});
      if(frame<totalFrames) requestAnimationFrame(drawFrame);
      else{
        gif.on('finished',blob=>{
          const url=URL.createObjectURL(blob);
          const a=document.createElement('a');
          a.href=url;
          a.download=`PUFF_GIF_${Date.now()}.gif`;
          a.click();
          URL.revokeObjectURL(url);
        });
        gif.render();
      }
    }
    drawFrame();
  });

  // CURSOR + TRAIL
  const pixelCursor=document.createElement("div");
  pixelCursor.className="pixel-cursor";
  document.body.appendChild(pixelCursor);
  document.addEventListener("mousemove",e=>{
    pixelCursor.style.left=e.clientX+"px";
    pixelCursor.style.top=e.clientY+"px";

    const trail=document.createElement("div");
    trail.className="pixel-cursor";
    trail.style.left=e.clientX+"px";
    trail.style.top=e.clientY+"px";
    trail.style.opacity=0.5;
    document.body.appendChild(trail);
    setTimeout(()=>trail.remove(),500);
  });

});
