/**
 * TAKE A PUFF - CORE LOGIC
 * Rewritten for stability and performance.
 */

/* ================= AUDIO SYSTEM ================= */
class VapeAudio {
  constructor() {
    this.ctx = null;
    this.inhaleNode = null;
    this.inhaleGain = null;
    this.isInit = false;
  }

  init() {
    if (this.isInit) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.isInit = true;
      console.log("Audio Initialized");
    } catch (e) {
      console.error("Audio Init Failed:", e);
    }
  }

  createNoise() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  startInhale() {
    if (!this.isInit) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Prevent stacking
    if (this.inhaleNode) return;

    const t = this.ctx.currentTime;
    
    // Source
    this.inhaleNode = this.ctx.createBufferSource();
    this.inhaleNode.buffer = this.createNoise();
    this.inhaleNode.loop = true;

    // Filter (Ramp up to simulate drag)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.linearRampToValueAtTime(1200, t + 3);

    // Gain (Fade in)
    this.inhaleGain = this.ctx.createGain();
    this.inhaleGain.gain.setValueAtTime(0, t);
    this.inhaleGain.gain.linearRampToValueAtTime(0.2, t + 0.5);

    // Connect
    this.inhaleNode.connect(filter);
    filter.connect(this.inhaleGain);
    this.inhaleGain.connect(this.ctx.destination);

    this.inhaleNode.start(t);
  }

  stopInhale() {
    if (!this.inhaleNode || !this.ctx) return;
    
    const t = this.ctx.currentTime;
    // Quick fade out
    this.inhaleGain.gain.cancelScheduledValues(t);
    this.inhaleGain.gain.setValueAtTime(this.inhaleGain.gain.value, t);
    this.inhaleGain.gain.linearRampToValueAtTime(0, t + 0.1);

    this.inhaleNode.stop(t + 0.1);
    this.inhaleNode = null;
    this.inhaleGain = null;
  }

  playExhale() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const src = this.ctx.createBufferSource();
    src.buffer = this.createNoise();

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 1.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    src.start(t);
    src.stop(t + 1.5);
  }
}

/* ================= CURSOR SYSTEM ================= */
class PixelCursor {
  constructor() {
    this.el = document.querySelector('.pixel-cursor');
    this.isVisible = false;
    this.init();
  }

  init() {
    if (!this.el) return;
    
    // Only activate custom cursor on non-touch devices initially
    // But we listen to mousemove to activate it dynamically
    document.addEventListener('mousemove', (e) => this.move(e));
    
    // Hide on leave
    document.addEventListener('mouseleave', () => this.hide());
    document.addEventListener('mouseenter', () => this.show());
  }

  move(e) {
    if (!this.isVisible) this.show();
    this.el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  }

  show() {
    this.isVisible = true;
    this.el.style.display = 'block';
    document.body.classList.remove('loading'); // Hide default cursor
  }

  hide() {
    this.isVisible = false;
    this.el.style.display = 'none';
  }
}

/* ================= MAIN APP ================= */
class VapeApp {
  constructor() {
    this.audio = new VapeAudio();
    this.cursor = new PixelCursor();
    
    this.vapeBtn = document.getElementById('vape');
    this.origin = document.getElementById('smoke-origin');
    
    this.smokeColor = '#FF4FD8'; // Default Pink
    this.isDragging = false;
    this.dragStart = 0;
    this.smokeInterval = null;

    this.puffCount = parseInt(localStorage.getItem('puffs') || '0');
    this.longCount = parseInt(localStorage.getItem('longs') || '0');

    this.init();
  }

  init() {
    this.updateUI();
    this.bindEvents();
    this.bindFlavors();
    this.bindShare();
    
    console.log("VapeApp Ready");
  }

  bindEvents() {
    // Mouse
    this.vapeBtn.addEventListener('mousedown', (e) => this.startDrag(e));
    window.addEventListener('mouseup', () => this.endDrag());

    // Touch
    this.vapeBtn.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevent scroll while puffing
      this.startDrag(e);
    }, { passive: false });
    window.addEventListener('touchend', () => this.endDrag());
    
    // First interaction to unlock audio
    const unlock = () => {
      this.audio.init();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
  }

  startDrag(e) {
    if (this.isDragging) return;
    this.isDragging = true;
    this.dragStart = Date.now();

    // Visuals
    this.vapeBtn.style.transform = 'scale(0.95)';
    
    // Audio
    this.audio.startInhale();

    // Constant small smoke
    this.smokeInterval = setInterval(() => this.spawnSmoke(false), 100);
    this.spawnSmoke(false);
  }

  endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    clearInterval(this.smokeInterval);

    // Visuals
    this.vapeBtn.style.transform = 'scale(1)';

    // Audio
    this.audio.stopInhale();
    this.audio.playExhale();

    // Logic
    const duration = Date.now() - this.dragStart;
    this.puffCount++;
    
    // Long Drag? (> 2 seconds)
    if (duration > 2000) {
      this.longCount++;
      this.spawnCloud(true); // Big Cloud
      this.triggerGlitch();
    } else {
      this.spawnCloud(false); // Normal Cloud
    }

    this.saveStats();
    this.updateUI();
  }

  spawnSmoke(isBig) {
    if (!this.origin) return;
    const rect = this.origin.getBoundingClientRect();
    
    const smoke = document.createElement('div');
    smoke.className = 'smoke';
    
    const size = isBig ? 60 + Math.random() * 40 : 20 + Math.random() * 20;
    const x = rect.left + (Math.random() * 20 - 10);
    const y = rect.top + (Math.random() * 20 - 10);

    smoke.style.width = `${size}px`;
    smoke.style.height = `${size}px`;
    smoke.style.left = `${x}px`;
    smoke.style.top = `${y}px`;
    smoke.style.background = this.smokeColor;

    document.body.appendChild(smoke);

    // Animation
    const angle = (Math.random() - 0.5) * 60; // -30 to 30 degrees
    const dist = isBig ? 300 : 100;
    
    const destX = x + Math.sin(angle * Math.PI / 180) * dist;
    const destY = y - dist - Math.random() * 100; // Always go up

    smoke.animate([
      { transform: 'scale(0.5)', opacity: 0.6 },
      { transform: `translate(${destX - x}px, ${destY - y}px) scale(2)`, opacity: 0 }
    ], {
      duration: isBig ? 3000 : 1500,
      easing: 'ease-out'
    }).onfinish = () => smoke.remove();
  }

  spawnCloud(isBig) {
    // Spawn multiple particles for a "cloud"
    const count = isBig ? 15 : 5;
    for (let i = 0; i < count; i++) {
      setTimeout(() => this.spawnSmoke(isBig), i * 50);
    }
  }

  triggerGlitch() {
    const crt = document.getElementById('crt');
    if (crt) {
      crt.style.opacity = '0.9';
      setTimeout(() => crt.style.opacity = '0.6', 200);
    }
  }

  bindFlavors() {
    const buttons = document.querySelectorAll('#flavors button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Reset active
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Set color
        this.smokeColor = btn.getAttribute('data-color');
      });
    });
  }

  bindShare() {
    const btn = document.getElementById('share-btn');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
      if (typeof html2canvas === 'undefined') {
        alert('Share not ready. Please wait.');
        return;
      }
      
      const target = document.querySelector('main'); // Capture main area
      html2canvas(target, {
        backgroundColor: null, // Transparent
        scale: 2
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `PUFF_SCORE_${this.puffCount}.png`;
        link.href = canvas.toDataURL();
        link.click();
      });
    });
  }

  saveStats() {
    localStorage.setItem('puffs', this.puffCount);
    localStorage.setItem('longs', this.longCount);
  }

  updateUI() {
    document.getElementById('puff-count').textContent = this.puffCount;
    document.getElementById('long-drag-count').textContent = this.longCount;
  }
}

// Start App
document.addEventListener('DOMContentLoaded', () => {
  window.app = new VapeApp();
});
