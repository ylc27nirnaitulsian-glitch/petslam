/**
 * Kokoro Local TTS Service (kokoro-js)
 * 82 Million Parameter Open-Weight Local Text-To-Speech for PET SLAM
 * 100% on-device neural voice generation via ONNX WebAssembly / WebGPU.
 */

export type KokoroVoice =
  | 'af_heart'   // Default: Warm, affectionate companion pet voice
  | 'af_bella'   // Energetic, playful pet champion
  | 'af_nicole'  // Clear, crisp tactical guide
  | 'am_fenrir'  // Deep, heroic arena announcer
  | 'am_michael' // Confident champion brawler
  | 'bf_alice'   // Gentle sanctuary caretaker;

export interface KokoroOptions {
  voice?: KokoroVoice;
  speed?: number;
  pitch?: number;
}

class KokoroLocalTTSManager {
  private ttsInstance: any = null;
  private isInitializing: boolean = false;
  private isReady: boolean = false;
  private isEnabled: boolean = true;
  private currentVoice: KokoroVoice = 'af_heart';
  private audioCache = new Map<string, string>(); // text:voice -> blobUrl
  private currentAudioElement: HTMLAudioElement | null = null;

  constructor() {
    // Check localStorage preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('petslam_kokoro_tts_enabled');
      if (stored !== null) {
        this.isEnabled = stored === 'true';
      }
    }
  }

  /**
   * Lazily initializes the Kokoro 82M ONNX model locally in the browser.
   */
  public async init(): Promise<boolean> {
    if (this.isReady && this.ttsInstance) return true;
    if (this.isInitializing) return false;

    if (typeof window === 'undefined') return false;

    this.isInitializing = true;
    try {
      console.log('[KokoroTTS] Initializing local 82M ONNX neural TTS engine...');
      const { KokoroTTS } = await import('kokoro-js');

      // Check for WebGPU acceleration, fallback to WASM
      const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;
      const device = hasWebGPU ? 'webgpu' : 'wasm';
      const dtype = hasWebGPU ? 'fp32' : 'q8'; // q8 is 8-bit quantized, ultra-fast

      this.ttsInstance = await KokoroTTS.from_pretrained(
        'onnx-community/Kokoro-82M-v1.0-ONNX',
        {
          dtype,
          device,
        }
      );

      this.isReady = true;
      this.isInitializing = false;
      console.log(`[KokoroTTS] Local model loaded successfully (${device.toUpperCase()})`);
      return true;
    } catch (err: any) {
      console.warn('[KokoroTTS] WebAssembly/WebGPU initialization notice:', err?.message || err);
      this.isInitializing = false;
      return false;
    }
  }

  /**
   * Speaks the provided text using Kokoro local TTS, falling back gracefully
   * to browser SpeechSynthesis while the model downloads/warms up.
   */
  public async speak(text: string, options?: KokoroOptions): Promise<void> {
    if (!this.isEnabled || !text.trim()) return;

    const voice = options?.voice || this.currentVoice;
    const cacheKey = `${voice}_${text.trim().toLowerCase()}`;

    // 1. Instant Cache Hit
    if (this.audioCache.has(cacheKey)) {
      const cachedUrl = this.audioCache.get(cacheKey)!;
      this.playBlobUrl(cachedUrl);
      return;
    }

    // 2. Try Kokoro Local Neural TTS
    if (this.isReady && this.ttsInstance) {
      try {
        const audio = await this.ttsInstance.generate(text, {
          voice,
        });

        if (audio && typeof audio.toBlob === 'function') {
          const blob = audio.toBlob();
          const blobUrl = URL.createObjectURL(blob);
          this.audioCache.set(cacheKey, blobUrl);
          this.playBlobUrl(blobUrl);
          return;
        }
      } catch (err) {
        console.warn('[KokoroTTS] Generation warning, falling back to browser speech:', err);
      }
    }

    // 3. Background lazy load if not already started
    if (!this.isReady && !this.isInitializing) {
      this.init().catch(() => {});
    }

    // 4. Fallback: Browser Web Speech API (instant, no delay)
    this.speakNativeBrowser(text, options);
  }

  /**
   * Plays a synthesized audio blob URL.
   */
  private playBlobUrl(url: string) {
    try {
      if (this.currentAudioElement) {
        this.currentAudioElement.pause();
        this.currentAudioElement = null;
      }
      const audio = new Audio(url);
      this.currentAudioElement = audio;
      audio.play().catch(() => {});
    } catch (e) {
      console.warn('[KokoroTTS] Audio playback error:', e);
    }
  }

  /**
   * Browser SpeechSynthesis fallback with cute pitch modulation for pets.
   */
  private speakNativeBrowser(text: string, options?: KokoroOptions) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#⚡💧🧘🏃🍓🔋❤️🐶🐱]/g, '').trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.pitch = options?.pitch ?? 1.35; // Cute higher pitch for pets
      utterance.rate = options?.speed ?? 1.1;

      // Select female/sweet voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) =>
        v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google')
      );
      if (preferred) utterance.voice = preferred;

      window.speechSynthesis.speak(utterance);
    } catch {}
  }

  public setVoice(voice: KokoroVoice) {
    this.currentVoice = voice;
  }

  public getVoice(): KokoroVoice {
    return this.currentVoice;
  }

  public toggle(): boolean {
    this.isEnabled = !this.isEnabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('petslam_kokoro_tts_enabled', String(this.isEnabled));
    }
    return this.isEnabled;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('petslam_kokoro_tts_enabled', String(enabled));
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public getIsReady(): boolean {
    return this.isReady;
  }

  public getIsInitializing(): boolean {
    return this.isInitializing;
  }
}

export const kokoroTTS = new KokoroLocalTTSManager();
