// Real Browser Voice Chat Engine for 2v2 Teammate Audio
// Supports real microphone capture via Web Audio AnalyserNode and
// audible teammate tactical voice communication via SpeechSynthesis + Radio FX.

export interface VoiceChatState {
  isMicActive: boolean;
  isMuted: boolean;
  volumeLevel: number; // 0 to 100 real-time decibel/frequency meter
  isSpeaking: boolean;
  isTeammateSpeaking: boolean;
  lastTeammateMessage: string;
  teammateVolume: number; // 0 to 1
  error: string | null;
}

class VoiceChatEngine {
  private audioCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private listeners: Set<(state: VoiceChatState) => void> = new Set();

  private state: VoiceChatState = {
    isMicActive: false,
    isMuted: false,
    volumeLevel: 0,
    isSpeaking: false,
    isTeammateSpeaking: false,
    lastTeammateMessage: 'Radio connected. Awaiting tactical orders.',
    teammateVolume: 0.85,
    error: null,
  };

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  public subscribe(listener: (state: VoiceChatState) => void) {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Play subtle military radio squelch / walkie-talkie chirp
  private playRadioChirp(type: 'open' | 'close') {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      osc.type = 'sine';
      if (type === 'open') {
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.05);
      } else {
        osc.frequency.setValueAtTime(1800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.06);
      }

      gain.gain.setValueAtTime(0.06 * this.state.teammateVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  // Request actual microphone stream and start real audio analyser
  public async enableMicrophone(): Promise<boolean> {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        this.micStream = stream;
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioCtx();
        const source = this.audioCtx.createMediaStreamSource(stream);

        const analyser = this.audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.5;
        source.connect(analyser);
        this.analyser = analyser;

        this.state.isMicActive = true;
        this.state.isMuted = false;
        this.state.error = null;
        this.notify();

        this.startMeterLoop();
        this.speakTeammate('Mic check 1-2! Devon here, I can hear you loud and clear. Let\'s crush this 2v2!');
        return true;
      } else {
        // Fallback simulation mode
        this.state.isMicActive = true;
        this.state.isMuted = false;
        this.state.error = 'Live mic stream simulated (browser permission restricted).';
        this.notify();
        this.speakTeammate('Devon online! Tactical radio channel ready.');
        return true;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Microphone access denied';
      // Graceful fallback: Still allow simulated voice interaction
      this.state.isMicActive = true;
      this.state.isMuted = false;
      this.state.error = `Mic permission note: ${message}. Tactical comms active.`;
      this.notify();
      this.speakTeammate('Radio connected! You can hear my combat callouts.');
      return false;
    }
  }

  private startMeterLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const dataArray = new Uint8Array(32);

    const loop = () => {
      if (this.analyser && this.state.isMicActive && !this.state.isMuted) {
        this.analyser.getByteFrequencyData(dataArray);

        // Average frequency volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));

        this.state.volumeLevel = normalized;
        this.state.isSpeaking = normalized > 12;
      } else {
        this.state.volumeLevel = 0;
        this.state.isSpeaking = false;
      }

      this.notify();
      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  }

  public toggleMute() {
    this.state.isMuted = !this.state.isMuted;
    if (this.micStream) {
      this.micStream.getAudioTracks().forEach((track) => {
        track.enabled = !this.state.isMuted;
      });
    }
    this.notify();
    if (this.state.isMuted) {
      this.playRadioChirp('close');
    } else {
      this.playRadioChirp('open');
    }
  }

  public setTeammateVolume(vol: number) {
    this.state.teammateVolume = Math.max(0, Math.min(1, vol));
    this.notify();
  }

  // Real Audible Teammate Speech via Web Speech API
  public speakTeammate(text: string) {
    this.state.lastTeammateMessage = text;
    this.state.isTeammateSpeaking = true;
    this.notify();

    this.playRadioChirp('open');

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.state.teammateVolume > 0.05) {
      // Cancel pending
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.12; // Fast tactical delivery
      utterance.pitch = 1.05;
      utterance.volume = this.state.teammateVolume;

      // Pick an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Google')));
      if (engVoice) utterance.voice = engVoice;

      utterance.onend = () => {
        this.state.isTeammateSpeaking = false;
        this.playRadioChirp('close');
        this.notify();
      };

      utterance.onerror = () => {
        this.state.isTeammateSpeaking = false;
        this.notify();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback timer if speech synthesis is muted
      setTimeout(() => {
        this.state.isTeammateSpeaking = false;
        this.notify();
      }, 2500);
    }
  }

  public cleanup() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.state.isMicActive = false;
  }
}

export const voiceChat = new VoiceChatEngine();
