class VapeAudio {
  constructor() {
    this.ctx = null;
    this.inhaleNode = null;
    this.inhaleGain = null;
    this.filter = null;
    this.isInit = false;
  }

  init() {
    if (this.isInit) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.isInit = true;
  }

  createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  startInhale() {
    if (!this.isInit) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Stop existing if any
    if (this.inhaleNode) this.stopInhale();

    const t = this.ctx.currentTime;
    
    // Noise Source
    this.inhaleNode = this.ctx.createBufferSource();
    this.inhaleNode.buffer = this.createNoiseBuffer();
    this.inhaleNode.loop = true;

    // Filter (Lowpass to simulate air flow)
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(200, t);
    this.filter.frequency.linearRampToValueAtTime(800, t + 2); // Air flow increasing

    // Gain (Volume)
    this.inhaleGain = this.ctx.createGain();
    this.inhaleGain.gain.setValueAtTime(0, t);
    this.inhaleGain.gain.linearRampToValueAtTime(0.3, t + 0.5); // Fade in

    // Connect graph
    this.inhaleNode.connect(this.filter);
    this.filter.connect(this.inhaleGain);
    this.inhaleGain.connect(this.ctx.destination);

    this.inhaleNode.start(t);
  }

  stopInhale() {
    if (!this.inhaleNode || !this.ctx) return;
    const t = this.ctx.currentTime;
    
    // Fade out
    this.inhaleGain.gain.cancelScheduledValues(t);
    this.inhaleGain.gain.setValueAtTime(this.inhaleGain.gain.value, t);
    this.inhaleGain.gain.linearRampToValueAtTime(0, t + 0.2);

    this.inhaleNode.stop(t + 0.2);
    this.inhaleNode = null;
  }

  playExhale() {
    if (!this.isInit) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 1.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 1.5);
  }
}

window.vapeAudio = new VapeAudio();
