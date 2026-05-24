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
  // Music layer — single procedural pad with an intensity-driven arp on top.
  // Both layers share the existing musicBus so the user's volume slider works.
  // ──────────────────────────────────────────────────────────────────────────

  private music: {
    padOscs: OscillatorNode[];
    padGain: GainNode;
    filter: BiquadFilterNode;
    lfo: OscillatorNode;
    lfoGain: GainNode;
    arpGain: GainNode;
    arpTimer: number;
    arpStep: number;
    arpFreqs: number[];
    targetIntensity: number;
  } | null = null;

  /**
   * Start the music bed.  Idempotent — calling twice is safe.  Designed to be
   * invoked from a scene's `create()` even before the user has interacted; if
   * the audio context is still suspended, the scheduled oscillators stay quiet
   * until `resume()` runs from the first input gesture.
   */
  startMusic(): void {
    this.ensureContext();
    if (!this.ctx || !this.musicBus) return;
    if (this.music) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 620;
    filter.Q.value = 0.9;
    filter.connect(this.musicBus);

    // Slow filter sweep keeps the pad from feeling static.
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 280;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    // Pad: A-minor 7 voicing across three detuned oscillators.
    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0, now);
    padGain.gain.linearRampToValueAtTime(0.55, now + 1.6);
    padGain.connect(filter);

    const padFreqs = [110, 164.81, 196.0]; // A2, E3, G3
    const padOscs: OscillatorNode[] = padFreqs.map((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sawtooth" : "triangle";
      osc.frequency.value = f;
      osc.detune.value = (i - 1) * 6;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.18 / padFreqs.length;
      osc.connect(oscGain);
      oscGain.connect(padGain);
      osc.start();
      return osc;
    });

    // Intensity layer — a separate gain.  Note blips are spawned on a fixed
    // interval but only when intensity is above the noise floor, so the
    // scheduler stays cheap during calm play.
    const arpGain = ctx.createGain();
    arpGain.gain.value = 0;
    arpGain.connect(this.musicBus);

    const arpFreqs = [
      220, 329.63, 261.63, 392.0, 329.63, 523.25, 392.0, 329.63,
    ]; // A minor arp riff
    let arpStep = 0;
    const arpTimer = window.setInterval(() => {
      if (!this.music || !this.ctx) return;
      if (this.music.targetIntensity < 0.05) return;
      const c = this.ctx;
      const t = c.currentTime;
      const f = arpFreqs[arpStep % arpFreqs.length];
      arpStep++;
      const osc = c.createOscillator();
      osc.type = "square";
      osc.frequency.value = f;
      const g = c.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.11, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(g);
      g.connect(arpGain);
      osc.start(t);
      osc.stop(t + 0.22);
    }, 180);

    this.music = {
      padOscs,
      padGain,
      filter,
      lfo,
      lfoGain,
      arpGain,
      arpTimer,
      arpStep,
      arpFreqs,
      targetIntensity: 0,
    };
  }

  /** Fade out and tear down the music bed. */
  stopMusic(fadeMs = 450): void {
    if (!this.music || !this.ctx) return;
    const m = this.music;
    this.music = null; // prevents the interval callback from firing more notes
    const t = this.ctx.currentTime;
    const tail = fadeMs / 1000;
    m.padGain.gain.cancelScheduledValues(t);
    m.padGain.gain.linearRampToValueAtTime(0, t + tail);
    m.arpGain.gain.cancelScheduledValues(t);
    m.arpGain.gain.linearRampToValueAtTime(0, t + tail);
    window.setTimeout(() => {
      window.clearInterval(m.arpTimer);
      m.padOscs.forEach((o) => {
        try {
          o.stop();
        } catch {
          /* already stopped */
        }
        o.disconnect();
      });
      try {
        m.lfo.stop();
      } catch {
        /* */
      }
      m.lfo.disconnect();
      m.lfoGain.disconnect();
      m.padGain.disconnect();
      m.filter.disconnect();
      m.arpGain.disconnect();
    }, fadeMs + 60);
  }

  /** 0..1 — 0 = pad only (calm), 1 = full arp layer (intense). Ramped smoothly. */
  setMusicIntensity(t: number): void {
    if (!this.music || !this.ctx) return;
    const clamped = Math.max(0, Math.min(1, t));
    this.music.targetIntensity = clamped;
    const now = this.ctx.currentTime;
    this.music.arpGain.gain.cancelScheduledValues(now);
    this.music.arpGain.gain.linearRampToValueAtTime(clamped * 0.55, now + 0.7);
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
