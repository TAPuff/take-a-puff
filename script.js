// ====== STATE ======
let count = 0;
let smokeColor = '#ff9ad5';
let soundOn = true;


// ====== ELEMENTS ======
const vape = document.getElementById('vape');
const container = document.getElementById('smoke-container');
const countEl = document.getElementById('count');


const sfxClick = document.getElementById('sfxClick');
const sfxHover = document.getElementById('sfxHover');
const sfxFlavor = document.getElementById('sfxFlavor');


// ====== SOUND HELPER ======
function play(sound) {
if (!soundOn) return;
sound.currentTime = 0;
sound.play();
}


// ====== VAPE CLICK ======
vape.addEventListener('click', () => {
play(sfxClick);
count++;
countEl.textContent = count;


let particles = 12;


if (count === 69) {
particles = 24;
}


if (count === 420) {
particles = 60;
document.body.classList.add('hue');
setTimeout(() => document.body.classList.remove('hue'), 800);
}


if (count === 666) {
particles = 80;
document.body.classList.add('glitch');
setTimeout(() => document.body.classList.remove('glitch'), 800);
}


for (let i = 0; i < particles; i++) {
createSmoke();
}
});


vape.addEventListener('mouseenter', () => play(sfxHover));


// ====== FLAVORS ======
document.querySelectorAll('.flavors button').forEach(btn => {
btn.addEventListener('click', () => {
play(sfxFlavor);
smokeColor = btn.dataset.color;
});
});


});

