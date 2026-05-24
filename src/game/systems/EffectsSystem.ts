import Phaser from "phaser";
import { COLORS, DEPTH, LOGICAL_SCALE, TEX } from "../constants";

/**
 * Reusable visual effects — particles, ring shockwaves, screen shake, floaty
 * combo text.  Honours the particle-quality + screen-shake settings.
 */
export class EffectsSystem {
  private scene: Phaser.Scene;
  private particleQuality: "normal" | "low" = "normal";
  private screenShakeEnabled = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  setQuality(q: "normal" | "low"): void {
    this.particleQuality = q;
  }

  setShakeEnabled(enabled: boolean): void {
    this.screenShakeEnabled = enabled;
  }

  shake(intensity = 0.005, duration = 120): void {
    if (!this.screenShakeEnabled) return;
    this.scene.cameras.main.shake(duration, intensity, false);
  }

  flash(color = 0xffffff, duration = 80, alpha = 0.4): void {
    this.scene.cameras.main.flash(
      duration,
      (color >> 16) & 0xff,
      (color >> 8) & 0xff,
      color & 0xff,
      true,
      undefined,
      alpha
    );
  }

  /** Expanding ring at (x,y) — used for every pop. */
  shockwave(x: number, y: number, opts: { radius?: number; color?: number; duration?: number } = {}): void {
    const radius = opts.radius ?? 80;
    const color = opts.color ?? COLORS.neonCyan;
    const duration = opts.duration ?? 320;

    // Shockwave texture is baked at TEX_SUPERSAMPLE× density — both the start
    // scale and the radius-based target scale are multiplied by LOGICAL_SCALE
    // so the visible ring expands to the same world radius as before.
    const ring = this.scene.add.image(x, y, TEX.shockwave);
    ring.setDepth(DEPTH.effect);
    ring.setTint(color);
    ring.setAlpha(0.9);
    ring.setScale(0.2 * LOGICAL_SCALE);
    ring.setBlendMode(Phaser.BlendModes.ADD);
    const inner = this.scene.add.image(x, y, TEX.shockwave);
    inner.setDepth(DEPTH.effect - 1);
    inner.setTint(0xffffff);
    inner.setAlpha(0.35);
    inner.setScale(0.08 * LOGICAL_SCALE);
    inner.setBlendMode(Phaser.BlendModes.ADD);
    this.scene.tweens.add({
      targets: ring,
      scale: (radius / 32) * LOGICAL_SCALE,
      alpha: 0,
      duration,
      ease: "Cubic.easeOut",
      onComplete: () => ring.destroy(),
    });
    this.scene.tweens.add({
      targets: inner,
      scale: (radius / 44) * LOGICAL_SCALE,
      alpha: 0,
      duration: duration * 0.72,
      ease: "Cubic.easeOut",
      onComplete: () => inner.destroy(),
    });
  }

  burst(x: number, y: number, opts: { color?: number; count?: number; spread?: number; lifespan?: number } = {}): void {
    const base = opts.count ?? 14;
    const count = this.particleQuality === "low" ? Math.ceil(base * 0.5) : base;
    const color = opts.color ?? 0xffffff;
    const spread = opts.spread ?? 160;
    const lifespan = opts.lifespan ?? 520;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * spread;
      const tex = Math.random() < 0.4 ? TEX.star : TEX.particle;
      const p = this.scene.add.image(x, y, tex);
      p.setDepth(DEPTH.effect);
      p.setTint(color);
      // Particle textures baked at TEX_SUPERSAMPLE× — scale down to world units.
      p.setScale((0.4 + Math.random() * 0.8) * LOGICAL_SCALE);
      p.setAlpha(0.95);
      p.setBlendMode(Phaser.BlendModes.ADD);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      this.scene.tweens.add({
        targets: p,
        x: x + vx * (lifespan / 1000),
        y: y + vy * (lifespan / 1000),
        scale: 0,
        alpha: 0,
        angle: Math.random() * 240 - 120,
        duration: lifespan,
        ease: "Quad.easeOut",
        onComplete: () => p.destroy(),
      });
    }
  }

  floatingText(x: number, y: number, text: string, opts: { color?: string; size?: number; lifespan?: number } = {}): void {
    const color = opts.color ?? "#6ffcff";
    const size = opts.size ?? 18;
    const lifespan = opts.lifespan ?? 700;

    const label = this.scene.add.text(x, y, text, {
      fontFamily: "Segoe UI, sans-serif",
      fontStyle: "bold",
      fontSize: `${size}px`,
      color,
      stroke: "#06061a",
      strokeThickness: 4,
    });
    label.setOrigin(0.5);
    label.setDepth(DEPTH.effect + 1);
    label.setShadow(0, 2, "#000000", 4, false, true);
    this.scene.tweens.add({
      targets: label,
      y: y - 32,
      alpha: 0,
      scale: 1.1,
      duration: lifespan,
      ease: "Cubic.easeOut",
      onComplete: () => label.destroy(),
    });
  }
}
