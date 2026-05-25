import Phaser from "phaser";
import { DEFAULT_SETTINGS, type GameSettings } from "../constants";

/**
 * Tiny WebAudio synth.  All sounds are generated on the fly so the bundle
 * stays asset-free.  AudioContext is created lazily on the first user input
 * to comply with browser autoplay policies.
 */
export class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private settings: GameSettings = { ...DEFAULT_SETTINGS };

  /** Hook into a scene's input so we can resume() on the first interaction. */
  attach(scene: Phaser.Scene): void {
    const ensure = () => this.ensureContext();
    scene.input.once(Phaser.Input.Events.POINTER_DOWN, ensure);
    scene.input.keyboard?.once(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, ensure);
  }

  setSettings(settings: GameSettings): void {
    this.settings = settings;
    if (this.master) this.master.gain.value = settings.masterVolume;
    if (this.sfxBus) this.sfxBus.gain.value = settings.sfxVolume;
    if (this.musicBus) this.musicBus.gain.value = settings.musicVolume;
  }

  /** Suspend the audio context — called when the page goes background. */
  suspend(): void {
    if (this.ctx && this.ctx.state === "running") void this.ctx.suspend();
  }

  /** Resume the audio context — called when the page returns to foreground. */
  resume(): void {
    if (this.ctx && this.ctx.state === "suspended") void this.ctx.resume();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Music layer — Bubble Hop Loop.mp3 played through a looping
  // AudioBufferSourceNode.  Buffer is fetched + decoded lazily on first
  // play and reused for the rest of the session.  setMusicIntensity stays
  // as a smooth gain ramp so calm/intense gameplay still feel distinct.
  // ──────────────────────────────────────────────────────────────────────────

  /** Public-relative URL the Bubble Hop Loop is served from (see public/audio/). */
  private static readonly MUSIC_URL = "audio/bubble-hop-loop.mp3";
  /** Calm-state music gain.  At full intensity we ramp to 1.0× this. */
  private static readonly MUSIC_BASE_GAIN = 0.7;

  private musicBuffer: AudioBuffer | null = null;
  private musicLoading: Promise<AudioBuffer | null> | null = null;
  private music: {
    source: AudioBufferSourceNode;
    gain: GainNode;
  } | null = null;
  private musicShouldPlay = false;
  private musicIntensity = 0;

  /**
   * Lazily fetch + decode the music file.  Errors (404, decode failure)
   * resolve to null and silently disable music rather than crashing the
   * audio system.
   */
  private async loadMusicBuffer(): Promise<AudioBuffer | null> {
    if (this.musicBuffer) return this.musicBuffer;
    if (this.musicLoading) return this.musicLoading;
    if (!this.ctx) return null;
    const ctx = this.ctx;
    this.musicLoading = (async () => {
      try {
        const res = await fetch(AudioSystem.MUSIC_URL);
        if (!res.ok) {
          console.warn(`[audio] music fetch ${res.status}`);
          return null;
        }
        const arr = await res.arrayBuffer();
        const buffer = await ctx.decodeAudioData(arr);
        this.musicBuffer = buffer;
        return buffer;
      } catch (err) {
        console.warn("[audio] music load failed", err);
        return null;
      } finally {
        this.musicLoading = null;
      }
    })();
    return this.musicLoading;
  }

  /**
   * Start (or restart) the music bed.  Idempotent.  If the buffer hasn't
   * loaded yet, schedules playback for once it does.
   */
  startMusic(): void {
    this.ensureContext();
    if (!this.ctx || !this.musicBus) return;
    this.musicShouldPlay = true;
    if (this.music) return; // already playing

    const startWithBuffer = (buffer: AudioBuffer): void => {
      if (!this.ctx || !this.musicBus || !this.musicShouldPlay) return;
      // If something started while we were waiting, leave it.
      if (this.music) return;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      const target = this.intensityToGain(this.musicIntensity);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(target, now + 1.4);
      source.connect(gain);
      gain.connect(this.musicBus);
      source.start();
      this.music = { source, gain };
    };

    if (this.musicBuffer) {
      startWithBuffer(this.musicBuffer);
      return;
    }
    void this.loadMusicBuffer().then((buffer) => {
      if (!buffer) return;
      startWithBuffer(buffer);
    });
  }

  /** Fade the music out and tear down the source. */
  stopMusic(fadeMs = 450): void {
    this.musicShouldPlay = false;
    if (!this.music || !this.ctx) return;
    const m = this.music;
    this.music = null;
    const t = this.ctx.currentTime;
    const tail = fadeMs / 1000;
    m.gain.gain.cancelScheduledValues(t);
    m.gain.gain.linearRampToValueAtTime(0, t + tail);
    window.setTimeout(() => {
      try {
        m.source.stop();
      } catch {
        /* already stopped */
      }
      m.source.disconnect();
      m.gain.disconnect();
    }, fadeMs + 60);
  }

  /**
   * Map 0..1 intensity to a multiplier on MUSIC_BASE_GAIN.  Calm gameplay
   * sits at 0.6×, intense pushes to 1.1× so the mix feels more present
   * during boss waves.
   */
  private intensityToGain(t: number): number {
    const clamped = Math.max(0, Math.min(1, t));
    return AudioSystem.MUSIC_BASE_GAIN * (0.6 + clamped * 0.5);
  }

  /** 0..1 — smoothly ramps the music gain. */
  setMusicIntensity(t: number): void {
    this.musicIntensity = Math.max(0, Math.min(1, t));
    if (!this.music || !this.ctx) return;
    const now = this.ctx.currentTime;
    const target = this.intensityToGain(this.musicIntensity);
    this.music.gain.gain.cancelScheduledValues(now);
    this.music.gain.gain.linearRampToValueAtTime(target, now + 0.7);
  }

  private ensureContext(): void {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const Ctor =
      (window.AudioContext as typeof AudioContext | undefined) ??
      ((window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext);
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.settings.masterVolume;
    this.master.connect(this.ctx.destination);
    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = this.settings.sfxVolume;
    this.sfxBus.connect(this.master);
    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = this.settings.musicVolume;
    this.musicBus.connect(this.master);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Synth primitives
  // ──────────────────────────────────────────────────────────────────────────

  private blip(opts: {
    freq: number;
    freqEnd?: number;
    duration: number;
    type?: OscillatorType;
    volume?: number;
    attack?: number;
    bus?: "sfx" | "music";
  }): void {
    this.ensureContext();
    if (!this.ctx || !this.sfxBus || !this.musicBus) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = opts.type ?? "sine";
    osc.frequency.setValueAtTime(opts.freq, now);
    if (opts.freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(40, opts.freqEnd),
        now + opts.duration
      );
    }
    const vol = opts.volume ?? 0.25;
    const attack = opts.attack ?? 0.005;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + opts.duration);
    osc.connect(gain);
    gain.connect(opts.bus === "music" ? this.musicBus : this.sfxBus);
    osc.start(now);
    osc.stop(now + opts.duration + 0.02);
  }

  private noise(opts: {
    duration: number;
    volume?: number;
    filterFreq?: number;
    bus?: "sfx" | "music";
  }): void {
    this.ensureContext();
    if (!this.ctx || !this.sfxBus) return;
    const sampleRate = this.ctx.sampleRate;
    const len = Math.floor(sampleRate * opts.duration);
    const buffer = this.ctx.createBuffer(1, len, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = opts.volume ?? 0.2;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = opts.filterFreq ?? 1200;
    filter.Q.value = 1;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(opts.bus === "music" ? this.musicBus! : this.sfxBus);
    src.start();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Game-facing SFX
  // ──────────────────────────────────────────────────────────────────────────

  shoot(): void {
    this.blip({
      freq: 720,
      freqEnd: 1100,
      duration: 0.09,
      type: "square",
      volume: 0.12,
    });
  }

  trap(): void {
    this.blip({
      freq: 540,
      freqEnd: 800,
      duration: 0.18,
      type: "sine",
      volume: 0.18,
    });
  }

  pop(chain = 0): void {
    const base = 320 + Math.min(chain, 8) * 80;
    this.blip({
      freq: base,
      freqEnd: 80,
      duration: 0.22,
      type: "triangle",
      volume: 0.28,
    });
    this.noise({ duration: 0.18, volume: 0.16, filterFreq: 2400 });
  }

  chainPop(chain: number): void {
    this.blip({
      freq: 600 + chain * 90,
      freqEnd: 1200 + chain * 80,
      duration: 0.16,
      type: "sawtooth",
      volume: 0.16,
    });
  }

  escape(): void {
    this.blip({
      freq: 200,
      freqEnd: 90,
      duration: 0.32,
      type: "sawtooth",
      volume: 0.22,
    });
  }

  jump(): void {
    this.blip({
      freq: 420,
      freqEnd: 600,
      duration: 0.08,
      type: "square",
      volume: 0.1,
    });
  }

  land(): void {
    this.blip({ freq: 160, duration: 0.05, type: "sine", volume: 0.12 });
  }

  hurt(): void {
    this.noise({ duration: 0.18, volume: 0.3, filterFreq: 480 });
    this.blip({
      freq: 220,
      freqEnd: 90,
      duration: 0.28,
      type: "square",
      volume: 0.18,
    });
  }

  pickup(): void {
    this.blip({
      freq: 880,
      freqEnd: 1320,
      duration: 0.09,
      type: "triangle",
      volume: 0.16,
    });
  }

  levelClear(): void {
    const seq = [523, 659, 784, 1046];
    seq.forEach((f, i) => {
      window.setTimeout(() => {
        this.blip({
          freq: f,
          duration: 0.18,
          type: "triangle",
          volume: 0.2,
        });
      }, i * 90);
    });
  }

  upgradeSelected(): void {
    this.blip({ freq: 660, duration: 0.1, type: "sine", volume: 0.18 });
    window.setTimeout(
      () => this.blip({ freq: 990, duration: 0.16, type: "sine", volume: 0.18 }),
      80
    );
  }

  gameOver(): void {
    this.blip({
      freq: 360,
      freqEnd: 120,
      duration: 0.6,
      type: "sawtooth",
      volume: 0.22,
    });
  }

  victory(): void {
    const seq = [523, 659, 784, 1046, 1318];
    seq.forEach((f, i) => {
      window.setTimeout(() => {
        this.blip({
          freq: f,
          duration: 0.25,
          type: "triangle",
          volume: 0.22,
        });
      }, i * 130);
    });
  }

  uiClick(): void {
    this.blip({
      freq: 980,
      freqEnd: 720,
      duration: 0.05,
      type: "square",
      volume: 0.08,
    });
  }
}

/** Singleton — used everywhere through Phaser's registry would be heavier. */
export const audio = new AudioSystem();
