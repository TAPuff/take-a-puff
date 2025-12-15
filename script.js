let count = 0;
let smokeColor = '#ff9ad5';


const vape = document.getElementById('vape');
const container = document.getElementById('smoke-container');
const countEl = document.getElementById('count');


const sfxClick = document.getElementById('sfxClick');
const sfxHover = document.getElementById('sfxHover');
const sfxFlavor = document.getElementById('sfxFlavor');


vape.addEventListener('click', () => {
sfxClick.play();
count++;
countEl.textContent = count;
for (let i = 0; i < 12; i++) createSmoke();
});


vape.addEventListener('mouseenter', () => sfxHover.play());


document.querySelectorAll('.flavors button').forEach(btn => {
btn.addEventListener('click', () => {
sfxFlavor.play();
smokeColor = btn.dataset.color;
});
});


function createSmoke() {
const s = document.createElement('div');
s.className = 'smoke';
s.style.background = smokeColor;
s.style.left = Math.random()*40+'px';
s.style.top = '120px';
container.appendChild(s);
let y = 120;
const rise = setInterval(() => {
y -= 2;
s.style.top = y+'px';
if (y < 0) { clearInterval(rise); s.remove(); }
}, 30);
}
