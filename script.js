/**
 * TAKE A PUFF - ULTIMATE EDITION
 */

/* ================= AUDIO SYSTEM ================= */
class VapeAudio {
  constructor() {
    this.ctx = null;
    this.isInit = false;
    
    // Nodes
    this.inhaleNode = null;
    this.inhaleGain = null;
    this.lofiNodes = [];
    
    // State
    this.lofiLayerCount = 0;
  }

  init() {
    if (this.isInit) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.isInit = true;
      console.log("Audio Initialized");
      this.startLofiLoop();
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

  // --- SFX GENERATORS ---

  playSound(type) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    if (type === 'click') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);
    } else if (type === 'camera') {
      // Shutter sound
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoise();
      const nGain = this.ctx.createGain();
      noise.connect(nGain);
      nGain.connect(this.ctx.destination);
      nGain.gain.setValueAtTime(0.5, t);
      nGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      noise.start(t);
      noise.stop(t + 0.2);
    } else if (type === 'cough') {
      // Rough noise bursts
      for(let i=0; i<3; i++) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoise();
        const nGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.ctx.destination);

        const start = t + (i * 0.15);
        nGain.gain.setValueAtTime(0.4, start);
        nGain.gain.exponentialRampToValueAtTime(0.01, start + 0.1);
        noise.start(start);
        noise.stop(start + 0.1);
      }
    } else if (type === 'burn') {
      // Sizzle
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoise();
      const nGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;

      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.ctx.destination);

      nGain.gain.setValueAtTime(0.3, t);
      nGain.gain.linearRampToValueAtTime(0, t + 0.5);
      noise.start(t);
      noise.stop(t + 0.5);
    } else if (type === 'golden') {
      // Ding!
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(2000, t + 0.5);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0, t + 1);
      osc.start(t);
      osc.stop(t + 1);
    } else if (type === 'unlock') {
      const freqs = [600, 900, 1200];
      freqs.forEach((f, i) => {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, t + i * 0.05);
        g.gain.setValueAtTime(0.15, t + i * 0.05);
        g.gain.linearRampToValueAtTime(0, t + i * 0.2);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(t + i * 0.05);
        o.stop(t + i * 0.2);
      });
    } else if (type === 'legendary') {
      const chord = [783.99, 987.77, 1318.51]; // G5, B5, E6
      chord.forEach((f, i) => {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.12, t);
        g.gain.linearRampToValueAtTime(0, t + 1.2 + i * 0.1);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(t);
        o.stop(t + 1.3 + i * 0.1);
      });
    }
  }

  // --- VAPE SOUNDS ---

  startInhale() {
    if (!this.isInit) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.inhaleNode) return;

    const t = this.ctx.currentTime;
    
    this.inhaleNode = this.ctx.createBufferSource();
    this.inhaleNode.buffer = this.createNoise();
    this.inhaleNode.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.linearRampToValueAtTime(1200, t + 3);

    this.inhaleGain = this.ctx.createGain();
    this.inhaleGain.gain.setValueAtTime(0, t);
    this.inhaleGain.gain.linearRampToValueAtTime(0.2, t + 0.5);

    this.inhaleNode.connect(filter);
    filter.connect(this.inhaleGain);
    this.inhaleGain.connect(this.ctx.destination);

    this.inhaleNode.start(t);
  }

  stopInhale() {
    if (!this.inhaleNode || !this.ctx) return;
    const t = this.ctx.currentTime;
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

  // --- DYNAMIC LO-FI LAYERS ---
  
  startLofiLoop() {
    // Simple sequenced beat that adds layers based on intensity
    if (!this.ctx) return;
    
    const beatTime = 0.5; // 120 BPM ish
    
    const playKick = (time) => {
      if (this.lofiLayerCount < 1) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
      gain.gain.setValueAtTime(0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
      osc.start(time);
      osc.stop(time + 0.5);
    };

    const playSnare = (time) => {
      if (this.lofiLayerCount < 2) return;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoise();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;
      const gain = this.ctx.createGain();
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
      noise.start(time);
      noise.stop(time + 0.2);
    };

    const playChord = (time) => {
      if (this.lofiLayerCount < 3) return;
      // Simple chord
      [261.63, 329.63, 392.00].forEach(freq => { // C Major
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.05, time);
        gain.gain.linearRampToValueAtTime(0, time + 2);
        osc.start(time);
        osc.stop(time + 2);
      });
    };

    // Sequencer Loop
    let nextNoteTime = this.ctx.currentTime;
    const schedule = () => {
      if (this.ctx.currentTime > nextNoteTime - 0.1) {
        // Simple 4/4 beat
        playKick(nextNoteTime);
        playChord(nextNoteTime); // Every beat for drone effect
        playSnare(nextNoteTime + beatTime);
        playKick(nextNoteTime + beatTime * 2);
        playSnare(nextNoteTime + beatTime * 3);
        
        nextNoteTime += beatTime * 4;
      }
      requestAnimationFrame(schedule);
    };
    schedule();
  }

  setIntensity(level) {
    // 0 = silent, 1 = kick, 2 = snare, 3 = full
    this.lofiLayerCount = level;
  }
}

/* ================= CURSOR SYSTEM ================= */
class PixelCursor {
  constructor() {
    this.el = document.querySelector('.pixel-cursor');
    this.trailContainer = document.querySelector('.cursor-trail');
    this.isVisible = false;
    this.isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    this.init();
  }

  init() {
    if (!this.el) return;
    // Hide cursor element on touch devices, but keep trail via touch events
    if (this.isTouch) {
      this.hide();
      document.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        this.spawnTrail(t.clientX, t.clientY, true);
      }, { passive: true });
      return;
    }
    document.addEventListener('mousemove', (e) => this.move(e));
    document.addEventListener('mouseleave', () => this.hide());
    document.addEventListener('mouseenter', () => this.show());
    document.body.style.cursor = 'none';
  }

  move(e) {
    if (!this.isVisible) this.show();
    this.el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    
    // Trail logic
    for (let i = 0; i < 2; i++) {
      if (Math.random() > 0.6) {
        this.spawnTrail(e.clientX + (Math.random()*6-3), e.clientY + (Math.random()*6-3));
      }
    }
  }

  spawnTrail(x, y, heavy = false) {
    const p = document.createElement('div');
    p.className = 'trail-particle';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    if (heavy) {
      p.style.width = '22px';
      p.style.height = '22px';
      p.style.background = 'rgba(255,255,255,0.85)';
    }
    document.body.appendChild(p);
    
    p.animate([
      { transform: 'scale(1)', opacity: 0.7 },
      { transform: 'scale(0) translate(0, -40px)', opacity: 0 }
    ], { duration: heavy ? 1200 : 900 }).onfinish = () => p.remove();
  }

  show() {
    this.isVisible = true;
    this.el.style.display = 'block';
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
    
    // Elements
    this.vapeBtn = document.getElementById('vape');
    this.origin = document.getElementById('smoke-origin');
    this.nicBar = document.getElementById('nicotine-level');
    this.ring = document.getElementById('perfect-ring');
    this.flood = document.getElementById('smoke-flood');
    this.floodText = document.querySelector('.flood-warning');
    this.tickerEl = document.querySelector('.ticker');
    this.vaporToggle = document.getElementById('vapor-toggle');
    
    // Game State
    this.smokeColor = '#FF4FD8';
    this.isDragging = false;
    this.dragStart = 0;
    this.smokeInterval = null;
    this.nicotine = 0; // 0 to 100
    this.lastPuffTime = 0;
    this.spamCount = 0;
    this.isBurnt = false;
    this.floodLevel = 0;
    this.vaporTrailsEnabled = localStorage.getItem('vaporTrails') === 'on';

    // Stats
    this.puffCount = parseInt(localStorage.getItem('puffs') || '0');
    this.longCount = parseInt(localStorage.getItem('longs') || '0');

    // Secret Flavors
    this.unlockedFlavors = new Set(JSON.parse(localStorage.getItem('unlocked') || '[]'));
    
    // CA Reveal
    this.caAnimInterval = null;
    this.caSettleInterval = null;

    this.init();
  }

  init() {
    this.updateUI();
    this.bindEvents();
    this.bindFlavors();
    this.checkUnlocks();
    this.gameLoop();
    console.log("VapeApp Ultimate Ready");
  }

  bindEvents() {
    // Interaction
    const start = (e) => {
      if (e.type === 'touchstart') e.preventDefault(); // Stop mobile menu
      this.startDrag(e);
    };
    const end = () => this.endDrag();

    this.vapeBtn.addEventListener('mousedown', start);
    this.vapeBtn.addEventListener('touchstart', start, { passive: false });
    
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);

    // Context Menu disable
    this.vapeBtn.addEventListener('contextmenu', e => e.preventDefault());

    // Audio Unlock
    const unlock = () => {
      this.audio.init();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);

    // CA Modal
    const caBtn = document.getElementById('ca-btn');
    const caModal = document.getElementById('ca-modal');
    const closeCaBtn = document.getElementById('close-ca-modal');
    const copyCaBtn = document.getElementById('copy-ca-btn');
    const caTextEl = document.getElementById('contract-address');
    const contractText = caTextEl?.textContent || 'COMING_SOON_ON_SOLANA_CHAIN_XYZ';
    if (caBtn && caModal) {
      caBtn.addEventListener('click', () => {
        caModal.setAttribute('aria-hidden', 'false');
        this.audio.playSound('click');
        this.startCAReveal();
      });
      closeCaBtn.addEventListener('click', () => {
        caModal.setAttribute('aria-hidden', 'true');
        this.audio.playSound('click');
        this.stopCAReveal();
        if (caTextEl && caTextEl.dataset.value) caTextEl.textContent = caTextEl.dataset.value;
      });
      caModal.addEventListener('click', (e) => {
        if (e.target === caModal) {
          caModal.setAttribute('aria-hidden', 'true');
          this.stopCAReveal();
          if (caTextEl && caTextEl.dataset.value) caTextEl.textContent = caTextEl.dataset.value;
        }
      });
      copyCaBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(contractText);
          this.audio.playSound('click');
          copyCaBtn.textContent = 'COPIED!';
          setTimeout(() => copyCaBtn.textContent = 'COPY', 1000);
        } catch {
          alert('Copy failed. Contract: ' + contractText);
        }
      });
    }

    // Vapor Trails Toggle
    if (this.vaporToggle) {
      this.vaporToggle.addEventListener('click', () => {
        this.vaporTrailsEnabled = !this.vaporTrailsEnabled;
        this.vaporToggle.textContent = this.vaporTrailsEnabled ? 'VAPOR TRAILS: ON' : 'VAPOR TRAILS: OFF';
        localStorage.setItem('vaporTrails', this.vaporTrailsEnabled ? 'on' : 'off');
        this.audio.playSound('click');
      });
      // Parallax scroll
      window.addEventListener('scroll', () => {
        if (!this.vaporTrailsEnabled) return;
        const y = window.scrollY;
        const crt = document.getElementById('crt');
        const noise = document.getElementById('noise');
        if (crt) crt.style.transform = `translateY(${y * -0.02}px)`;
        if (noise) noise.style.transform = `translateY(${y * -0.04}px)`;
      }, { passive: true });
      this.vaporToggle.textContent = this.vaporTrailsEnabled ? 'VAPOR TRAILS: ON' : 'VAPOR TRAILS: OFF';
    }
    
    // Show native cursor over interactive elements
    const interactiveSelector = 'button, .social-btn, a, .pump-link';
    document.querySelectorAll(interactiveSelector).forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.style.cursor = 'auto';
        if (this.cursor) this.cursor.hide();
      });
      el.addEventListener('mouseleave', () => {
        document.body.style.cursor = 'none';
        if (this.cursor) this.cursor.show();
      });
    });

    // Swipe to clear flood
    let touchStartX = 0;
    window.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
    window.addEventListener('touchmove', e => {
      if (this.floodLevel > 50) {
        const diff = Math.abs(e.touches[0].clientX - touchStartX);
        if (diff > 50) this.clearFlood();
      }
    });
    // Desktop swipe (mouse drag) to clear flood
    let mouseStartX = 0;
    window.addEventListener('mousedown', e => mouseStartX = e.clientX);
    window.addEventListener('mousemove', e => {
      if (this.floodLevel > 50 && e.buttons === 1) {
        const diff = Math.abs(e.clientX - mouseStartX);
        if (diff > 50) this.clearFlood();
      }
    });
    
    // Button Sounds
    document.querySelectorAll('button, .social-btn, .nav-link, #pump-btn, .nav-icon').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
      });
      btn.addEventListener('click', () => {
        const sound = btn.getAttribute('data-sound') || 'click';
        this.audio.playSound(sound);
      });
    });

    // CA
    document.getElementById('ca-btn').addEventListener('click', () => {
      alert("CA: COMING_SOON_ON_SOLANA_CHAIN_XYZ");
    });
  }
  
  startCAReveal() {
    const el = document.getElementById('contract-address');
    if (!el) return;
    const target = el.textContent.trim();
    el.dataset.value = target;
    const hex = '0123456789ABCDEF';
    let progress = 0;
    clearInterval(this.caAnimInterval);
    clearInterval(this.caSettleInterval);
    this.caAnimInterval = setInterval(() => {
      let out = '';
      for (let i = 0; i < target.length; i++) {
        const ch = target[i];
        if (i < progress || ch === ' ') {
          out += ch;
        } else {
          out += hex[Math.floor(Math.random() * hex.length)];
        }
      }
      el.textContent = out;
    }, 35);
    setTimeout(() => {
      this.caSettleInterval = setInterval(() => {
        progress++;
        if (progress >= target.length) {
          el.textContent = target;
          this.stopCAReveal();
        }
      }, 45);
    }, 500);
  }
  
  stopCAReveal() {
    clearInterval(this.caAnimInterval);
    clearInterval(this.caSettleInterval);
    this.caAnimInterval = null;
    this.caSettleInterval = null;
  }

  startDrag(e) {
    if (this.isDragging || this.isBurnt) return;
    
    // Spam Check
    const now = Date.now();
    if (now - this.lastPuffTime < 500) {
      this.spamCount++;
      if (this.spamCount > 4) {
        this.triggerBurntCoil();
        return;
      }
    } else {
      this.spamCount = 0;
    }

    this.isDragging = true;
    this.dragStart = now;

    // Visuals
    this.vapeBtn.style.transform = 'scale(0.95)';
    this.audio.startInhale();

    // Perfect Puff Ring
    this.ring.style.transition = 'none';
    this.ring.style.transform = 'translate(-50%, -50%) scale(0)';
    this.ring.style.opacity = '1';
    requestAnimationFrame(() => {
      this.ring.style.transition = 'transform 2s linear'; // 2s target
      this.ring.style.transform = 'translate(-50%, -50%) scale(1.5)';
    });

    // Loop
    this.smokeInterval = setInterval(() => {
      this.spawnSmoke(false);
      
      // Overpuff check
      if (Date.now() - this.dragStart > 5000) {
        this.triggerOverpuff();
      }
    }, 100);
    this.spawnSmoke(false);
  }

  endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    clearInterval(this.smokeInterval);
    this.lastPuffTime = Date.now();

    const duration = Date.now() - this.dragStart;
    
    // Reset Ring
    this.ring.style.opacity = '0';
    
    // Perfect Puff? (1.8s - 2.2s)
    const isPerfect = duration > 1800 && duration < 2200;
    
    // Visuals
    this.vapeBtn.style.transform = 'scale(1)';
    this.audio.stopInhale();

    if (isPerfect) {
      this.audio.playSound('golden');
      this.spawnCloud(true, '#FFD700'); // Gold
    } else {
      if (Math.random() < 0.01) {
        this.audio.playSound('legendary');
        this.spawnCloud(true, '#FFD700');
      } else {
        this.audio.playExhale();
        this.spawnCloud(duration > 2000, this.smokeColor);
      }
    }

    // Stats
    this.puffCount++;
    if (duration > 2000) {
      this.longCount++;
      // Cough Chance (20%)
      if (Math.random() < 0.2) this.triggerCough();
    }
    
    // Nicotine Rush
    this.nicotine = Math.min(100, this.nicotine + 10);
    this.floodLevel = Math.min(100, this.floodLevel + 5);
    
    // Smoke Message Chance
    if (Math.random() < 0.1) this.spawnSmokeText();

    this.checkUnlocks();
    this.saveStats();
    this.updateUI();
  }

  spawnSmoke(isBig, overrideColor) {
    if (!this.origin) return;
    const rect = this.origin.getBoundingClientRect();
    const smoke = document.createElement('div');
    smoke.className = 'smoke';
    
    const size = isBig ? 80 + Math.random() * 50 : 30 + Math.random() * 30;
    const x = rect.left + (Math.random() * 20 - 10);
    const y = rect.top + (Math.random() * 20 - 10);
    const color = overrideColor || (this.isBurnt ? '#555' : this.smokeColor);

    smoke.style.width = `${size}px`;
    smoke.style.height = `${size}px`;
    smoke.style.left = `${x}px`;
    smoke.style.top = `${y}px`;
    smoke.style.background = color;

    document.body.appendChild(smoke);

    const angle = (Math.random() - 0.5) * 90; 
    const dist = isBig ? 400 : 150;
    const destX = x + Math.sin(angle * Math.PI / 180) * dist;
    const destY = y - dist - Math.random() * 100;

    smoke.animate([
      { transform: 'scale(0.5)', opacity: 0.8 },
      { transform: `translate(${destX - x}px, ${destY - y}px) scale(3)`, opacity: 0 }
    ], {
      duration: isBig ? 4000 : 2000,
      easing: 'ease-out'
    }).onfinish = () => smoke.remove();
  }

  spawnCloud(isBig, color) {
    const count = isBig ? 20 : 8;
    for (let i = 0; i < count; i++) {
      setTimeout(() => this.spawnSmoke(isBig, color), i * 40);
    }
  }

  spawnSmokeText() {
    const texts = ["$PUFF", "HODL", "ONE MORE", "MOON"];
    const text = texts[Math.floor(Math.random() * texts.length)];
    
    const el = document.createElement('div');
    el.className = 'smoke-text';
    el.textContent = text;
    el.style.left = (window.innerWidth / 2 - 50) + 'px';
    el.style.top = (window.innerHeight / 2) + 'px';
    document.body.appendChild(el);

    el.animate([
      { transform: 'translateY(0) scale(0.5)', opacity: 0 },
      { transform: 'translateY(-100px) scale(1.5)', opacity: 1, offset: 0.5 },
      { transform: 'translateY(-200px) scale(2)', opacity: 0 }
    ], { duration: 3000 }).onfinish = () => el.remove();
  }

  triggerCough() {
    this.audio.playSound('cough');
    document.body.classList.add('shake-screen');
    setTimeout(() => document.body.classList.remove('shake-screen'), 500);
    
    // Intense CRT
    const crt = document.getElementById('crt');
    crt.style.opacity = '1';
    setTimeout(() => crt.style.opacity = '0.6', 300);
    crt.classList.add('crt-warp');
    setTimeout(() => crt.classList.remove('crt-warp'), 600);
  }

  triggerOverpuff() {
    const warn = document.getElementById('overpuff-warning');
    warn.style.display = 'block';
    this.audio.playSound('burn'); // Warning sound
    document.body.classList.add('shake-screen');
    setTimeout(() => {
      warn.style.display = 'none';
      document.body.classList.remove('shake-screen');
    }, 1000);
    const crt = document.getElementById('crt');
    crt.classList.add('crt-warp');
    setTimeout(() => crt.classList.remove('crt-warp'), 600);
  }

  triggerBurntCoil() {
    this.isBurnt = true;
    const warn = document.getElementById('burnt-coil');
    warn.style.display = 'block';
    this.audio.playSound('burn');
    
    // Cooldown
    setTimeout(() => {
      this.isBurnt = false;
      warn.style.display = 'none';
      this.spamCount = 0;
    }, 3000);
  }

  checkUnlocks() {
    const milestones = {
      100: { name: '⭐ GOLDEN HAZE', color: '#FFD700' },
      200: { name: '🕳️ VOID MIST', color: '#000000' },
      300: { name: '⚡ PLASMA CLOUD', color: '#FF0000' },
      400: { name: '👽 ALIEN BREATH', color: '#39FF14' },
      500: { name: '🌌 COSMIC FOG', color: '#9945FF' },
      1000: { name: '🧪 GOD MODE', color: '#FFFFFF' }
    };

    Object.keys(milestones).forEach(count => {
      if (this.puffCount >= count && !this.unlockedFlavors.has(count)) {
        this.unlockedFlavors.add(count);
        this.audio.playSound('unlock');
        this.spawnFireworks(milestones[count].color);
        this.addFlavorBtn(milestones[count].name, milestones[count].color);
      }
    });

    // Re-render unlocked if reloading
    if (document.querySelectorAll('#flavors button').length === 5) {
      this.unlockedFlavors.forEach(count => {
        if (milestones[count]) {
          this.addFlavorBtn(milestones[count].name, milestones[count].color);
        }
      });
    }

    localStorage.setItem('unlocked', JSON.stringify([...this.unlockedFlavors]));
  }

  spawnFireworks(color) {
    const bursts = 24;
    for (let i = 0; i < bursts; i++) {
      setTimeout(() => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const smoke = document.createElement('div');
        smoke.className = 'smoke';
        const size = 40 + Math.random() * 60;
        const angle = Math.random() * Math.PI * 2;
        const dist = 220 + Math.random() * 180;
        const x = centerX + Math.cos(angle) * 10;
        const y = centerY + Math.sin(angle) * 10;
        const destX = centerX + Math.cos(angle) * dist;
        const destY = centerY + Math.sin(angle) * dist;
        smoke.style.width = `${size}px`;
        smoke.style.height = `${size}px`;
        smoke.style.left = `${x}px`;
        smoke.style.top = `${y}px`;
        smoke.style.background = color;
        document.body.appendChild(smoke);
        smoke.animate([
          { transform: 'scale(0.7)', opacity: 0.9 },
          { transform: `translate(${destX - x}px, ${destY - y}px) scale(2.6)`, opacity: 0 }
        ], { duration: 3000, easing: 'ease-out' }).onfinish = () => smoke.remove();
      }, i * 30);
    }
  }
  
  addFlavorBtn(name, color) {
    const container = document.getElementById('flavors');
    // Check exist
    if ([...container.children].some(b => b.textContent === name)) return;
    
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.setAttribute('data-color', color);
    btn.setAttribute('data-sound', 'click');
    btn.addEventListener('click', () => {
      document.querySelectorAll('#flavors button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.smokeColor = color;
      this.audio.playSound('click');
    });
    container.appendChild(btn);
  }

  clearFlood() {
    this.floodLevel = 0;
  }

  gameLoop() {
    // Nicotine Decay
    if (this.nicotine > 0) this.nicotine -= 0.1;
    this.nicBar.style.width = `${this.nicotine}%`;

    // Nicotine Effects
    if (this.nicotine > 80) {
      document.body.classList.add('zoom-pulse');
      this.audio.setIntensity(3); // Full Lo-fi
    } else if (this.nicotine > 50) {
      document.body.classList.remove('zoom-pulse');
      this.audio.setIntensity(2); // Snare
    } else if (this.nicotine > 20) {
      this.audio.setIntensity(1); // Kick
    } else {
      document.body.classList.remove('zoom-pulse');
      this.audio.setIntensity(0); // Silent
    }
    
    // Reactive Ticker: glow and speed
    if (this.tickerEl) {
      const level = this.nicotine; // 0-100
      const glowStrength = Math.min(12, 2 + level / 8); // 2→12
      this.tickerEl.style.filter = `drop-shadow(0 0 ${glowStrength}px var(--blue))`;
      const glowDur = Math.max(1, 2.5 - level / 80); // faster with higher level
      const wobbleDur = Math.max(1.2, 3.5 - level / 60);
      this.tickerEl.style.animationDuration = `${glowDur}s, ${wobbleDur}s`;
    }

    // Flood Logic
    this.flood.style.opacity = this.floodLevel / 100;
    if (this.floodLevel > 50) {
      this.flood.style.pointerEvents = 'auto'; // Block clicks
      this.floodText.style.display = 'block';
    } else {
      this.flood.style.pointerEvents = 'none';
      this.floodText.style.display = 'none';
    }

    // Ambient background smoke more prominent
    const ambientProb = this.vaporTrailsEnabled ? 0.12 : 0.06;
    if (!this.isDragging && Math.random() < ambientProb) {
      const count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const x = Math.random() * window.innerWidth;
        const y = window.innerHeight - 30 - Math.random() * 140;
        this.spawnAmbientSmoke(x, y, this.vaporTrailsEnabled);
      }
    }

    requestAnimationFrame(() => this.gameLoop());
  }

  spawnAmbientSmoke(x, y, heavy = false) {
    const smoke = document.createElement('div');
    smoke.className = 'smoke';
    const size = (heavy ? 40 : 30) + Math.random() * (heavy ? 60 : 40);
    const color = heavy ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.6)';
    smoke.style.width = `${size}px`;
    smoke.style.height = `${size}px`;
    smoke.style.left = `${x}px`;
    smoke.style.top = `${y}px`;
    smoke.style.background = color;
    document.body.appendChild(smoke);
    const destY = y - (heavy ? 220 + Math.random() * 260 : 160 + Math.random() * 220);
    smoke.animate([
      { transform: 'scale(0.8)', opacity: 0.7 },
      { transform: `translate(0, ${destY - y}px) scale(2.8)`, opacity: 0 }
    ], { duration: heavy ? 4200 : 3500, easing: 'ease-out' }).onfinish = () => smoke.remove();
  }
  bindFlavors() {
    const buttons = document.querySelectorAll('#flavors button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.smokeColor = btn.getAttribute('data-color');
        const list = document.getElementById('flavors');
        const toggle = document.getElementById('flavor-toggle');
        if (list && toggle && !list.hasAttribute('hidden')) {
          list.setAttribute('hidden', '');
          toggle.textContent = 'SELECT FLAVOR ▾';
        }
      });
    });
    const toggle = document.getElementById('flavor-toggle');
    const list = document.getElementById('flavors');
    if (toggle && list) {
      toggle.addEventListener('click', () => {
        const isHidden = list.hasAttribute('hidden');
        if (isHidden) {
          list.removeAttribute('hidden');
          toggle.textContent = 'SELECT FLAVOR ▴';
        } else {
          list.setAttribute('hidden', '');
          toggle.textContent = 'SELECT FLAVOR ▾';
        }
      });
      document.addEventListener('click', (e) => {
        const dd = document.querySelector('.flavor-dropdown');
        if (!dd) return;
        if (!dd.contains(e.target) && !list.hasAttribute('hidden')) {
          list.setAttribute('hidden', '');
          toggle.textContent = 'SELECT FLAVOR ▾';
        }
      });
    }
  }

  // share removed

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
  // Smooth scroll for top nav with section highlight
  document.querySelectorAll('.top-nav .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.getAttribute('href');
      const target = document.querySelector(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.classList.add('section-highlight');
        setTimeout(() => target.classList.remove('section-highlight'), 1000);
      }
    });
  });
});
