import Phaser from 'phaser';

export class AudioManager {
  private static instance: AudioManager;
  private scene: Phaser.Scene | null = null;
  private soundCache = new Map<string, string>();
  private audioCtx: AudioContext | null = null;

  private constructor() {
    this.soundCache.set('hit', 'audio/sfx/hit.mp3');
    this.soundCache.set('miss', 'audio/sfx/miss.mp3');
    this.soundCache.set('shoot', 'audio/sfx/shoot.mp3');
    this.soundCache.set('gold', 'audio/sfx/gold.mp3');
    this.soundCache.set('result', 'audio/sfx/result.mp3');
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private getAudioContext(): AudioContext | null {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public preloadSounds(scene: Phaser.Scene) {
    this.scene = scene;

    scene.load.on('loaderror', (fileObj: any) => {
      if (import.meta.env.DEV) {
        console.warn(`[AudioManager] 사운드 파일 로딩 실패(Synthesizer Fallback 적용): ${fileObj.key}`);
      }
    });

    for (const [key, path] of this.soundCache.entries()) {
      scene.load.audio(`sfx_${key}`, path);
    }
  }

  public playSfx(key: string) {
    if (!this.scene) return;

    try {
      const soundKey = `sfx_${key}`;
      if (this.scene.sound && this.scene.cache.audio.exists(soundKey)) {
        this.scene.sound.play(soundKey);
        return;
      }
    } catch (_) {}

    // Web Audio Synthesizer Fallback
    this.playSynthSfx(key);
  }

  private playSynthSfx(key: string) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (key === 'shoot') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (key === 'hit') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.15);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (key === 'gold') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(784, now); // G5
        osc.frequency.setValueAtTime(1046.5, now + 0.08); // C6
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (key === 'miss') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(70, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (key === 'result') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.5, now + 0.3); // C6
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch (_) {}
  }
}

