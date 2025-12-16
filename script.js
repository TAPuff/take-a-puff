let count = 0;
let smokeColor = '#ff7ac8';
let soundOn = true;


const vape = document.getElementById('vape');
const origin = document.getElementById('smoke-origin');
const countEl = document.getElementById('count');


const sfxClick = document.getElementById('sfxClick');
const sfxHover = document.getElementById('sfxHover');
const sfxFlavor = document.getElementById('sfxFlavor');


function play(s){ if(soundOn){ s.currentTime=0; s.play(); }}


vape.addEventListener('click', () => {
play(sfxClick);
count++;
countEl.textContent = count;


let amount = count>=420 ? 40 : 16;
for(let i=0;i<amount;i++) spawnSmoke(origin);
});


vape.addEventListener('mouseenter',()=>play(sfxHover));


// flavors
document.querySelectorAll('.flavors button').forEach(b=>{
b.addEventListener('click',()=>{
smokeColor = b.dataset.color;
play(sfxFlavor);
});
});


// cursor trail
window.addEventListener('mousemove',e=>{
spawnSmoke(document.body,e.clientX,e.clientY,true);
});


function spawnSmoke(parent,x,y,isCursor=false){
const s=document.createElement('div');
s.className='smoke';
s.style.background=smokeColor;
s.style.left=(isCursor?x:0)+'px';
s.style.top=(isCursor?y:0)+'px';
s.style.setProperty('--x',(Math.random()*60-30)+'px');
(isCursor?document.body:parent).appendChild(s);
setTimeout(()=>s.remove(),3000);
}


// mute
const mute=document.getElementById('mute');
mute.onclick=()=>{ soundOn=!soundOn; mute.textContent=soundOn?'🔊':'🔇'; play(sfxHover); }