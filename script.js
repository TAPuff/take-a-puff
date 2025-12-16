const vape = document.getElementById("vape");
const smokeLayer = document.getElementById("smoke-layer");
const flavorButtons = document.querySelectorAll("#flavors button");

let smokeColor = "#ff4fd8";

flavorButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    flavorButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    smokeColor = btn.dataset.color;
  });
});

vape.addEventListener("click", () => {
  puff();
  playPuff();
});

function puff() {
  for (let i = 0; i < 12; i++) {
    const s = document.createElement("div");
    s.className = "smoke";
    s.style.background = smokeColor;
    s.style.left = (window.innerWidth / 2 + Math.random() * 40 - 20) + "px";
    s.style.bottom = "200px";
    smokeLayer.appendChild(s);
    setTimeout(() => s.remove(), 3000);
  }
}

function playPuff() {
  const ctx = new AudioContext();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.value = 120;
  g.gain.value = 0.1;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.15);
}
