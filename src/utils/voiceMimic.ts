// Real-time Voice Mimic & Pitch Shifter for Pet Companion
// Records microphone input and plays back in a pitched companion voice with mouth lip-sync!

export class VoiceMimicEngine {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;
  private isPlaying: boolean = false;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;

  private initCtx() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public get recordingStatus(): boolean {
    return this.isRecording;
  }

  public get playingStatus(): boolean {
    return this.isPlaying;
  }

  // 1. Start listening to mic
  public async startListening(
    onMicVolume?: (volume: number) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      this.initCtx();
      if (!this.audioCtx) return { success: false, error: 'Web Audio API unavailable' };

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return { success: false, error: 'Microphone not supported on this browser' };
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(this.mediaStream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      // Set up real-time volume analyzer
      const source = this.audioCtx.createMediaStreamSource(this.mediaStream);
      const analyser = this.audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        if (!this.isRecording) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 128);
        onMicVolume?.(normalized);
        requestAnimationFrame(checkVolume);
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      requestAnimationFrame(checkVolume);

      return { success: true };
    } catch (err: unknown) {
      console.warn('Microphone permission denied or failed:', err);
      return { success: false, error: (err as Error).message || 'Microphone access denied' };
    }
  }

  // 2. Stop listening and pitch-shift repeat in companion voice!
  public async stopAndRepeat(
    onMouthSync: (amplitude: number) => void,
    onFinish: () => void
  ): Promise<void> {
    if (!this.isRecording || !this.mediaRecorder) {
      onFinish();
      return;
    }

    this.isRecording = false;

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        // Stop all mic tracks
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach((track) => track.stop());
          this.mediaStream = null;
        }

        if (this.recordedChunks.length === 0) {
          onFinish();
          resolve();
          return;
        }

        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();

        try {
          this.initCtx();
          if (!this.audioCtx) {
            onFinish();
            resolve();
            return;
          }

          const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);

          // Play pitch shifted: 1.48x playback speed creates the iconic high-pitched cartoon voice!
          const source = this.audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.playbackRate.value = 1.48; // Cartoon pitch multiplier!

          const analyser = this.audioCtx.createAnalyser();
          analyser.fftSize = 128;
          source.connect(analyser);
          analyser.connect(this.audioCtx.destination);

          this.isPlaying = true;
          source.start();

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateMouth = () => {
            if (!this.isPlaying) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const amp = Math.min(1, (avg / 100) * 1.5);
            onMouthSync(amp);
            this.animFrameId = requestAnimationFrame(updateMouth);
          };
          updateMouth();

          source.onended = () => {
            this.isPlaying = false;
            if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
            onMouthSync(0);
            onFinish();
            resolve();
          };
        } catch (e) {
          console.warn('Audio decoding failed, using fallback speech synthesis:', e);
          this.speakPresetPhrase(
            'Hahaha! I heard you loud and clear!',
            onMouthSync,
            onFinish
          );
          resolve();
        }
      };

      this.mediaRecorder!.stop();
    });
  }

  // Fallback high-pitch speech synthesis if no mic or for instant phrases
  public speakPresetPhrase(
    text: string,
    onMouthSync: (amplitude: number) => void,
    onFinish: () => void
  ) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      // Simulate mouth animation
      this.simulateSpeechAnimation(text.length * 80, onMouthSync, onFinish);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.95; // High chipmunk / cartoon pitch
    utterance.rate = 1.35; // Fast bubbly rate

    this.isPlaying = true;

    // Simulate animated speech mouth flapping
    const startTime = performance.now();
    const expectedDuration = Math.max(1200, text.length * 75);

    const flapLoop = () => {
      if (!this.isPlaying) return;
      const elapsed = performance.now() - startTime;
      if (elapsed > expectedDuration + 500) {
        this.isPlaying = false;
        onMouthSync(0);
        onFinish();
        return;
      }
      const amp = Math.abs(Math.sin(elapsed * 0.025)) * 0.9;
      onMouthSync(amp);
      requestAnimationFrame(flapLoop);
    };
    requestAnimationFrame(flapLoop);

    utterance.onend = () => {
      this.isPlaying = false;
      onMouthSync(0);
      onFinish();
    };

    utterance.onerror = () => {
      this.isPlaying = false;
      onMouthSync(0);
      onFinish();
    };

    window.speechSynthesis.speak(utterance);
  }

  private simulateSpeechAnimation(
    durationMs: number,
    onMouthSync: (amp: number) => void,
    onFinish: () => void
  ) {
    this.isPlaying = true;
    const start = performance.now();
    const loop = () => {
      const elapsed = performance.now() - start;
      if (elapsed >= durationMs) {
        this.isPlaying = false;
        onMouthSync(0);
        onFinish();
        return;
      }
      const amp = Math.abs(Math.sin(elapsed * 0.022)) * 0.85;
      onMouthSync(amp);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

export const voiceMimic = new VoiceMimicEngine();
