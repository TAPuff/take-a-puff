document.addEventListener("DOMContentLoaded", () => {
  const vape = document.getElementById("vape");
  const smokeLayer = document.getElementById("smoke-layer");

  let puffCount = 0;
  let smokeColor = "#FF4FD8";
  let dragging = false;
  let interval = null;

  /* ===== SPAWN SMOKE FROM VAPE ===== */
function spawnSmoke() {
  const mouth = document.getElementById("vape-mouth");
  if (!mouth) return;

  const rect = mouth.getBoundingClientRect();
  const vapeX = rect.left;
  const vapeY = rect.top;

  const smoke = document.createElement("div");
  smoke.className = "smoke";
  smoke.style.left = vapeX + "px";
  smoke.style.top = vapeY + "px";
  smoke.style.background = smokeColor;

  document.body.appendChild(smoke);
  setTimeout(() => smoke.remove(), 3000);
}

  function startDrag(e) {
    e.preventDefault();
    dragging = true;
    spawnSmoke();
    interval = setInterval(spawnSmoke, 140);
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    clearInterval(interval);
    puffCount++;
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
      smokeColor = btn.dataset.color;
    });
  });
});
