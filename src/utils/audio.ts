// Procedural Web Audio API sound effects for PET SLAM
// Runs completely client-side with zero external audio assets

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('petslam_sound_enabled');
        if (stored !== null) {
          this.enabled = stored === 'true';
        }
      } catch {}
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    try {
      localStorage.setItem('petslam_sound_enabled', String(val));
    } catch {}

    if (this.ctx) {
      if (!val) {
        if (this.masterGain) {
          try {
            this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
          } catch {}
        }
        if (this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        }
      } else {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        if (this.masterGain) {
          try {
            this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
          } catch {}
        }
      }
    }

    // Immediately silence any ongoing native speech synthesis when muted
    if (!val && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  private initCtx() {
    if (!this.enabled) return;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.enabled ? 1 : 0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended' && this.enabled) {
      this.ctx.resume().catch(() => {});
    }
  }

  private getDestination(): AudioNode | null {
    if (!this.enabled) return null;
    this.initCtx();
    if (!this.ctx) return null;
    return this.masterGain || this.ctx.destination;
  }

  public playClick() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio fallback silent
    }
  }

  public playAttack() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  public playLightHit() {
    this.playAttack();
  }

  public playImpact() {
    this.playHeavyHit();
  }

  public playBattleStart() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch {}
  }

  public playHeavyHit() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  public playBlock() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  // Visceral Perfect Parry: High-voltage metallic clash + deep sub-bass ring
  public playParry() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const now = this.ctx.currentTime;

      // 1. High metallic blade clink
      const oscClash = this.ctx.createOscillator();
      const gainClash = this.ctx.createGain();
      oscClash.type = 'triangle';
      oscClash.frequency.setValueAtTime(1600, now);
      oscClash.frequency.exponentialRampToValueAtTime(3200, now + 0.06);
      gainClash.gain.setValueAtTime(0.35, now);
      gainClash.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      oscClash.connect(gainClash);
      gainClash.connect(dest);
      oscClash.start(now);
      oscClash.stop(now + 0.3);

      // 2. Harmonic bell chime (880Hz / 1760Hz)
      const oscBell = this.ctx.createOscillator();
      const gainBell = this.ctx.createGain();
      oscBell.type = 'sine';
      oscBell.frequency.setValueAtTime(880, now);
      oscBell.frequency.setValueAtTime(1760, now + 0.04);
      gainBell.gain.setValueAtTime(0.25, now);
      gainBell.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      oscBell.connect(gainBell);
      gainBell.connect(dest);
      oscBell.start(now);
      oscBell.stop(now + 0.46);

      // 3. Sub-bass ground shockwave
      const oscSub = this.ctx.createOscillator();
      const gainSub = this.ctx.createGain();
      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(120, now);
      oscSub.frequency.exponentialRampToValueAtTime(40, now + 0.25);
      gainSub.gain.setValueAtTime(0.4, now);
      gainSub.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      oscSub.connect(gainSub);
      gainSub.connect(dest);
      oscSub.start(now);
      oscSub.stop(now + 0.32);
    } catch {}
  }

  // Dramatic K.O. Finisher Boom
  public playKO() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const now = this.ctx.currentTime;

      // Heavy earthquake sub thud
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.85);

      // Dramatic brass chord
      [220, 277.18, 329.63, 440].forEach((freq) => {
        if (!this.ctx) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + 0.05);
        g.gain.setValueAtTime(0.18, now + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        o.connect(g);
        g.connect(dest);
        o.start(now + 0.05);
        o.stop(now + 0.72);
      });
    } catch {}
  }

  // Low HP Tension Heartbeat Thump
  public playHeartbeat() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const now = this.ctx.currentTime;

      [0, 0.14].forEach((delay, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const startFreq = idx === 0 ? 65 : 55;
        osc.frequency.setValueAtTime(startFreq, now + delay);
        osc.frequency.exponentialRampToValueAtTime(30, now + delay + 0.1);
        gain.gain.setValueAtTime(0.3, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now + delay);
        osc.stop(now + delay + 0.14);
      });
    } catch {}
  }

  public playDodge() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  public playVictory() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + idx * 0.12;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch {}
  }

  public playLevelUp() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + idx * 0.09;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch {}
  }

  public playUltimate() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      // Deep sub-bass sweep + metallic harmonic flare
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(60, this.ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.35);
      gain1.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.45);
      osc1.connect(gain1);
      gain1.connect(dest);
      osc1.start();
      osc1.stop(this.ctx.currentTime + 0.45);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(550, this.ctx.currentTime + 0.1);
      osc2.frequency.exponentialRampToValueAtTime(1100, this.ctx.currentTime + 0.35);
      gain2.gain.setValueAtTime(0.2, this.ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.45);
      osc2.connect(gain2);
      gain2.connect(dest);
      osc2.start(this.ctx.currentTime + 0.1);
      osc2.stop(this.ctx.currentTime + 0.45);
    } catch {}
  }

  public playMatchSearch() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  public playMatchFound() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      // Dramatic brass gong + ascending fanfare chord
      const chords = [220, 330, 440, 660];
      chords.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.6);
      });
    } catch {}
  }

  public playCardSelect() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1040, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {}
  }

  public playCardPlay() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      // Card slam impact: punchy thud + swoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {}
  }

  public playCrit() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      // High frequency spark + heavy sub punch
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    } catch {}
  }

  public playDefeat() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const notes = [330, 311, 293, 220];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + idx * 0.18;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    } catch {}
  }

  public playEat() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      // Gentle cute crunch / munch pop
      [0, 0.08, 0.16].forEach((offset, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const freq = idx % 2 === 0 ? 520 : 640;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + offset);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + offset + 0.05);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + offset + 0.05);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(this.ctx.currentTime + offset);
        osc.stop(this.ctx.currentTime + offset + 0.06);
      });
    } catch {}
  }

  public playChew() {
    this.playEat();
  }

  public playBell() {
    this.playLevelUp();
  }

  public playPurr() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      // Warm bubbling purr oscillation
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch {}
  }

  public playBark() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      // Cheerful puppy bark: "Arf!"
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(720, this.ctx.currentTime + 0.04);
      osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {}
  }

  public playMeow() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      // Sweet kitten meow: "Mee-ooww~"
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(820, this.ctx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(540, this.ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.16, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }

  public playGiggle() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      [0, 0.08, 0.16, 0.24].forEach((offset, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const base = 600 + (idx % 2) * 120;
        osc.frequency.setValueAtTime(base, this.ctx.currentTime + offset);
        osc.frequency.exponentialRampToValueAtTime(base + 180, this.ctx.currentTime + offset + 0.05);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + offset + 0.06);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(this.ctx.currentTime + offset);
        osc.stop(this.ctx.currentTime + offset + 0.07);
      });
    } catch {}
  }

  public playPoke() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  public playMilkSlurp() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      [0, 0.09, 0.18, 0.27].forEach((t) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320 + Math.random() * 100, this.ctx.currentTime + t);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + t + 0.06);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + t + 0.07);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(this.ctx.currentTime + t);
        osc.stop(this.ctx.currentTime + t + 0.08);
      });
    } catch {}
  }

  public playBubblePop() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100 + Math.random() * 400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2400, this.ctx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch {}
  }

  public playToot() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(65, this.ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  public playPokeBallThrow() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {}
  }

  public playPokeBallShake() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(280, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {}
  }

  public playPokeBallCatch() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      // Pokemon Gotcha fanfare
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.09 + 0.2);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(this.ctx.currentTime + idx * 0.09);
        osc.stop(this.ctx.currentTime + idx * 0.09 + 0.22);
      });
    } catch {}
  }

  public playCoin() {
    if (!this.enabled) return;
    try {
      const dest = this.getDestination();
      if (!this.ctx || !dest) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
      osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.06); // E6
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }
}

export const sound = new SoundEngine();
