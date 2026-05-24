import Phaser from "phaser";
import { COLORS, TEX, TEX_SUPERSAMPLE } from "../constants";

/**
 * Generates every in-game texture procedurally so the build stays tiny and
 * 100% original.  Run once during the Preload scene.
 *
 * Every texture is rendered at TEX_SUPERSAMPLE× its logical pixel size so that
 * sprites stay crisp when the canvas is upscaled to fit large displays.  The
 * `bake()` helper scales the Graphics object before snapshotting it to a
 * texture so individual draw methods can stay readable in their logical sizes.
 *
 * Consumers must apply `setScale(LOGICAL_SCALE)` (or multiply existing scales
 * by it) so the displayed size matches the world coordinates.
 */
export class TextureFactory {
  /**
   * Renders the graphics object to a texture at TEX_SUPERSAMPLE× pixel density.
   * The graphics object is destroyed after.
   */
  private static bake(
    g: Phaser.GameObjects.Graphics,
    key: string,
    w: number,
    h: number
  ): void {
    const s = TEX_SUPERSAMPLE;
    g.setScale(s, s);
    g.generateTexture(key, Math.ceil(w * s), Math.ceil(h * s));
    g.destroy();
  }

  private static glowCircle(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    radius: number,
    color: number,
    strength = 1
  ): void {
    for (let i = 6; i > 0; i--) {
      const t = i / 6;
      g.fillStyle(color, 0.05 * t * strength);
      g.fillCircle(x, y, radius * (0.45 + t * 0.55));
    }
  }

  private static drawSpark(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    r: number,
    color: number,
    alpha = 1
  ): void {
    g.lineStyle(1.3, color, alpha);
    g.lineBetween(x - r, y, x + r, y);
    g.lineBetween(x, y - r, x, y + r);
    g.fillStyle(0xffffff, alpha * 0.85);
    g.fillCircle(x, y, Math.max(0.8, r * 0.18));
  }

  static buildAll(scene: Phaser.Scene): void {
    TextureFactory.buildPlayer(scene);
    TextureFactory.buildPlayerShoot(scene);
    TextureFactory.buildSlimes(scene);
    TextureFactory.buildBoss(scene);
    TextureFactory.buildField(scene);
    TextureFactory.buildPlatforms(scene);
    TextureFactory.buildPortal(scene);
    TextureFactory.buildPickups(scene);
    TextureFactory.buildParticles(scene);
    TextureFactory.buildHearts(scene);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Player
  // ──────────────────────────────────────────────────────────────────────────

  private static buildPlayer(scene: Phaser.Scene): void {
    const g = scene.add.graphics({ x: 0, y: 0 });
    const W = 36;
    const H = 44;

    TextureFactory.glowCircle(g, W / 2, H / 2 - 1, 25, COLORS.neonCyan, 1.2);

    // drop shadow
    g.fillStyle(0x000000, 0.28);
    g.fillEllipse(W / 2, H - 2, 24, 5);

    // backpack and side pods
    g.fillStyle(COLORS.steelDark, 1);
    g.fillRoundedRect(5, 15, 8, 20, 4);
    g.fillRoundedRect(W - 13, 15, 8, 20, 4);
    g.fillStyle(COLORS.neonCyan, 0.65);
    g.fillRect(7, 19, 2, 10);
    g.fillRect(W - 9, 19, 2, 10);

    // legs
    g.fillStyle(0x0e1431, 1);
    g.fillRoundedRect(8, H - 12, 8, 12, 3);
    g.fillRoundedRect(W - 16, H - 12, 8, 12, 3);
    g.fillStyle(0x070918, 1);
    g.fillRoundedRect(5, H - 5, 12, 5, 2);
    g.fillRoundedRect(W - 17, H - 5, 12, 5, 2);

    // body shell
    g.fillStyle(0x101735, 1);
    g.fillRoundedRect(7, 15, W - 14, H - 20, 7);
    g.fillStyle(0xdcecff, 1);
    g.fillRoundedRect(9, 17, W - 18, H - 27, 6);
    g.fillStyle(0xffffff, 0.55);
    g.fillRoundedRect(11, 18, W - 22, 7, 4);
    g.fillStyle(0x8ca2c9, 1);
    g.fillRoundedRect(11, 28, W - 22, 4, 2);

    // chest emitter
    TextureFactory.glowCircle(g, W / 2, H / 2 + 6, 8, COLORS.neonCyan, 2);
    g.fillStyle(0x0c1434, 1);
    g.fillCircle(W / 2, H / 2 + 6, 4.6);
    g.fillStyle(COLORS.neonCyan, 1);
    g.fillCircle(W / 2, H / 2 + 6, 2.7);
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(W / 2 - 1, H / 2 + 5, 1.1);

    // helmet
    g.fillStyle(0x0e1431, 1);
    g.fillRoundedRect(6, 5, W - 12, 16, 6);
    g.fillStyle(0xdcecff, 1);
    g.fillRoundedRect(8, 3, W - 16, 15, 6);
    g.fillStyle(0x111a3c, 1);
    g.fillRoundedRect(10, 7, W - 20, 8, 3);
    g.fillStyle(COLORS.neonCyan, 1);
    g.fillRoundedRect(12, 9, W - 24, 4, 2);
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(13, 9, 3, 1.5);

    // antenna
    g.lineStyle(2, 0xdcecff, 1);
    g.lineBetween(W / 2, 4, W / 2, 0);
    TextureFactory.glowCircle(g, W / 2, 1.5, 5, COLORS.neonPink, 1.8);
    g.fillStyle(COLORS.neonPink, 1);
    g.fillCircle(W / 2, 1.5, 2.2);

    TextureFactory.bake(g, TEX.player, W, H);
  }

  private static buildPlayerShoot(scene: Phaser.Scene): void {
    const g = scene.add.graphics({ x: 0, y: 0 });
    const W = 36;
    const H = 44;

    TextureFactory.glowCircle(g, W / 2 + 8, H / 2 + 1, 31, COLORS.neonCyan, 1.8);
    g.fillStyle(0x000000, 0.28);
    g.fillEllipse(W / 2, H - 2, 24, 5);

    g.fillStyle(COLORS.steelDark, 1);
    g.fillRoundedRect(5, 15, 8, 20, 4);
    g.fillRoundedRect(W - 13, 15, 8, 20, 4);
    g.fillStyle(COLORS.neonCyan, 0.85);
    g.fillRect(7, 18, 2, 12);
    g.fillRect(W - 9, 18, 2, 12);

    g.fillStyle(0x0e1431, 1);
    g.fillRoundedRect(8, H - 12, 8, 12, 3);
    g.fillRoundedRect(W - 16, H - 12, 8, 12, 3);
    g.fillStyle(0x070918, 1);
    g.fillRoundedRect(5, H - 5, 12, 5, 2);
    g.fillRoundedRect(W - 17, H - 5, 12, 5, 2);

    g.fillStyle(0x101735, 1);
    g.fillRoundedRect(7, 15, W - 14, H - 20, 7);
    g.fillStyle(0xf1f8ff, 1);
    g.fillRoundedRect(9, 17, W - 18, H - 27, 6);
    g.fillStyle(0xffffff, 0.65);
    g.fillRoundedRect(11, 18, W - 22, 7, 4);

    // charged emitter flare
    TextureFactory.glowCircle(g, W / 2, H / 2 + 6, 11, COLORS.neonCyan, 2.3);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(W / 2, H / 2 + 6, 5.2);
    g.fillStyle(COLORS.neonCyan, 1);
    g.fillCircle(W / 2, H / 2 + 6, 3);

    // small side muzzle flash
    TextureFactory.glowCircle(g, W - 3, H / 2 + 2, 9, COLORS.neonGold, 2);
    g.fillStyle(COLORS.neonGold, 0.95);
    g.fillTriangle(W - 9, H / 2 - 2, W - 1, H / 2 + 2, W - 9, H / 2 + 6);

    g.fillStyle(0x0e1431, 1);
    g.fillRoundedRect(6, 5, W - 12, 16, 6);
    g.fillStyle(0xf1f8ff, 1);
    g.fillRoundedRect(8, 3, W - 16, 15, 6);
    g.fillStyle(0x101735, 1);
    g.fillRoundedRect(10, 7, W - 20, 8, 3);
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(12, 9, W - 24, 4, 2);
    g.fillStyle(COLORS.neonCyan, 1);
    g.fillRect(13, 10, W - 26, 1.5);

    g.lineStyle(2, 0xf1f8ff, 1);
    g.lineBetween(W / 2, 4, W / 2, 0);
    g.fillStyle(COLORS.neonPink, 1);
    g.fillCircle(W / 2, 1.5, 2.2);

    TextureFactory.bake(g, TEX.playerShoot, W, H);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Slimes
  // ──────────────────────────────────────────────────────────────────────────

  private static buildSlime(
    scene: Phaser.Scene,
    key: string,
    color: number,
    accent: number,
    options: {
      width?: number;
      height?: number;
      crown?: "none" | "spike" | "bolt" | "shield";
      mouth?: boolean;
    } = {}
  ): void {
    const W = options.width ?? 30;
    const H = options.height ?? 26;
    const g = scene.add.graphics({ x: 0, y: 0 });

    TextureFactory.glowCircle(g, W / 2, H / 2 + 2, W * 0.62, color, 0.9);

    // soft contact shadow
    g.fillStyle(0x000000, 0.32);
    g.fillEllipse(W / 2, H - 1.5, W - 5, 5);

    // rim and gelatin body
    g.fillStyle(0x07101d, 0.65);
    g.fillEllipse(W / 2, H / 2 + 3, W - 1, H - 3);
    g.fillStyle(color, 0.92);
    g.fillEllipse(W / 2, H / 2 + 1.5, W - 5, H - 5);
    g.fillStyle(0xffffff, 0.15);
    g.fillEllipse(W / 2 + 3, H / 2 + 4, W - 12, H - 12);
    g.fillStyle(0xffffff, 0.45);
    g.fillEllipse(W / 2 - 5, H / 2 - 5, 10, 5);
    g.fillStyle(0xffffff, 0.2);
    g.fillEllipse(W / 2 - 8, H / 2 + 2, 5, 8);

    // tiny feet / drips
    g.fillStyle(color, 0.96);
    g.fillCircle(7, H - 5, 3);
    g.fillCircle(W - 7, H - 5, 3);

    // eyes with glossy pupils
    g.fillStyle(0xffffff, 1);
    g.fillCircle(W / 2 - 5, H / 2 - 1, 3.6);
    g.fillCircle(W / 2 + 5, H / 2 - 1, 3.6);
    g.fillStyle(0x07101d, 1);
    g.fillCircle(W / 2 - 4.5, H / 2, 1.8);
    g.fillCircle(W / 2 + 5.5, H / 2, 1.8);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(W / 2 - 5.2, H / 2 - 0.9, 0.7);
    g.fillCircle(W / 2 + 4.8, H / 2 - 0.9, 0.7);

    // mouth
    if (options.mouth ?? true) {
      g.lineStyle(1.4, 0x07101d, 0.72);
      g.beginPath();
      g.arc(W / 2, H / 2 + 4.8, 3.2, 0, Math.PI, false);
      g.strokePath();
    }

    // accent crown
    switch (options.crown ?? "none") {
      case "spike":
        TextureFactory.glowCircle(g, W / 2, 4, 8, accent, 0.7);
        g.fillStyle(accent, 1);
        g.fillTriangle(W / 2 - 5, 6, W / 2, 1, W / 2 + 5, 6);
        g.fillStyle(0xffffff, 0.35);
        g.fillTriangle(W / 2 - 2, 5, W / 2, 2, W / 2 + 2, 5);
        break;
      case "bolt":
        TextureFactory.glowCircle(g, W / 2 + 1, 5, 9, accent, 0.7);
        g.fillStyle(accent, 1);
        g.fillTriangle(W / 2 - 4, 8, W / 2 + 1, 2, W / 2 - 1, 6);
        g.fillTriangle(W / 2 - 1, 6, W / 2 + 4, 0, W / 2 + 1, 5);
        break;
      case "shield":
        TextureFactory.glowCircle(g, W / 2, H / 2, W * 0.56, 0xcfe9ff, 0.8);
        g.fillStyle(accent, 1);
        g.fillRoundedRect(3, 5, W - 6, 5, 2);
        g.fillStyle(0xffffff, 0.5);
        g.fillRect(6, 6, W - 12, 1.5);
        g.lineStyle(1.4, 0xffffff, 0.8);
        g.strokeEllipse(W / 2, H / 2 + 2, W - 5, H - 5);
        break;
      case "none":
      default:
        break;
    }

    TextureFactory.bake(g, key, W, H);
  }

  private static buildSlimes(scene: Phaser.Scene): void {
    TextureFactory.buildSlime(scene, TEX.slimeBasic, COLORS.neonGreen, COLORS.neonGreen);
    TextureFactory.buildSlime(scene, TEX.slimeBouncer, COLORS.neonPink, COLORS.neonPink, {
      crown: "spike",
    });
    TextureFactory.buildSlime(scene, TEX.slimeCharger, COLORS.neonOrange, COLORS.neonGold, {
      crown: "bolt",
      width: 34,
      height: 28,
    });
    TextureFactory.buildSlime(scene, TEX.slimeShield, 0x7af0d1, 0xcfe9ff, {
      crown: "shield",
      width: 32,
      height: 28,
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Boss
  // ──────────────────────────────────────────────────────────────────────────

  private static buildBoss(scene: Phaser.Scene): void {
    const W = 120;
    const H = 100;
    const g = scene.add.graphics({ x: 0, y: 0 });

    TextureFactory.glowCircle(g, W / 2, H / 2 + 2, 78, 0xc168ff, 1);
    TextureFactory.glowCircle(g, W / 2, H / 2 + 8, 50, COLORS.neonCyan, 0.45);

    g.fillStyle(0x000000, 0.36);
    g.fillEllipse(W / 2, H - 5, W - 12, 10);

    // crown vents
    g.fillStyle(0x7f35cc, 1);
    for (let i = 0; i < 5; i++) {
      const x = 20 + i * ((W - 40) / 4);
      g.fillTriangle(x - 8, 20, x, 1, x + 8, 20);
      g.fillStyle(0xf0d1ff, 0.35);
      g.fillTriangle(x - 3, 15, x, 5, x + 3, 15);
      g.fillStyle(0x7f35cc, 1);
    }

    // big slime body with darker rim
    g.fillStyle(0x3a1457, 0.85);
    g.fillEllipse(W / 2, H / 2 + 8, W - 6, H - 13);
    g.fillStyle(0xc168ff, 0.95);
    g.fillEllipse(W / 2, H / 2 + 5, W - 16, H - 19);
    g.fillStyle(0xffffff, 0.32);
    g.fillEllipse(W / 2 - 22, H / 2 - 10, 30, 13);
    g.fillStyle(0xffffff, 0.12);
    g.fillEllipse(W / 2 + 24, H / 2 + 15, 42, 18);

    // reactor core casing
    TextureFactory.glowCircle(g, W / 2, H / 2 + 10, 27, COLORS.neonCyan, 2.2);
    g.fillStyle(0x06061a, 1);
    g.fillCircle(W / 2, H / 2 + 10, 20);
    g.lineStyle(3, 0xf0d1ff, 0.65);
    g.strokeCircle(W / 2, H / 2 + 10, 20);
    g.lineStyle(2, COLORS.neonCyan, 0.95);
    g.strokeCircle(W / 2, H / 2 + 10, 14);
    g.fillStyle(COLORS.neonCyan, 1);
    g.fillCircle(W / 2, H / 2 + 10, 10);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(W / 2 - 3, H / 2 + 7, 3.5);

    // eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(W / 2 - 27, H / 2 - 6, 8);
    g.fillCircle(W / 2 + 27, H / 2 - 6, 8);
    g.fillStyle(0x06061a, 1);
    g.fillCircle(W / 2 - 25, H / 2 - 4, 4);
    g.fillCircle(W / 2 + 29, H / 2 - 4, 4);
    g.lineStyle(3, 0x4c1c70, 0.9);
    g.lineBetween(W / 2 - 40, H / 2 - 18, W / 2 - 17, H / 2 - 12);
    g.lineBetween(W / 2 + 17, H / 2 - 12, W / 2 + 40, H / 2 - 18);

    // side bubbles
    g.fillStyle(0xe7a6ff, 0.5);
    g.fillCircle(18, H / 2 + 18, 7);
    g.fillCircle(W - 17, H / 2 + 14, 6);

    TextureFactory.bake(g, TEX.boss, W, H);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Containment field
  // ──────────────────────────────────────────────────────────────────────────

  private static buildField(scene: Phaser.Scene): void {
    const size = 48;
    const r = size / 2;
    const g = scene.add.graphics({ x: 0, y: 0 });

    TextureFactory.glowCircle(g, r, r, r, COLORS.neonCyan, 2);
    g.fillStyle(0xffffff, 0.2);
    g.fillCircle(r, r, r - 9);
    g.fillStyle(COLORS.neonCyan, 0.48);
    g.fillCircle(r, r, r - 11);
    g.lineStyle(3, COLORS.neonCyan, 1);
    g.strokeCircle(r, r, r - 4);
    g.lineStyle(1.5, 0xffffff, 0.9);
    g.strokeCircle(r, r, r - 8);
    g.lineStyle(1.2, COLORS.neonCyanDim, 0.8);
    g.strokeCircle(r, r, r - 14);
    g.lineStyle(1.4, 0xffffff, 0.5);
    g.lineBetween(r - 15, r, r + 15, r);
    g.lineBetween(r, r - 15, r, r + 15);
    TextureFactory.drawSpark(g, r - 8, r - 7, 4, 0xffffff, 0.9);
    TextureFactory.drawSpark(g, r + 9, r + 8, 3, 0xffffff, 0.7);

    TextureFactory.bake(g, TEX.field, size, size);

    // larger, warmer texture for trapped state
    const g2 = scene.add.graphics({ x: 0, y: 0 });
    TextureFactory.glowCircle(g2, r, r, r + 2, COLORS.neonPink, 2);
    g2.fillStyle(0xffffff, 0.18);
    g2.fillCircle(r, r, r - 9);
    g2.fillStyle(COLORS.neonPink, 0.44);
    g2.fillCircle(r, r, r - 11);
    g2.lineStyle(3, COLORS.neonPink, 1);
    g2.strokeCircle(r, r, r - 4);
    g2.lineStyle(1.5, 0xffffff, 0.9);
    g2.strokeCircle(r, r, r - 6);
    g2.lineStyle(1.2, COLORS.neonGold, 0.8);
    g2.strokeCircle(r, r, r - 15);
    g2.lineStyle(1.4, 0xffffff, 0.45);
    g2.lineBetween(r - 15, r, r + 15, r);
    g2.lineBetween(r, r - 15, r, r + 15);
    TextureFactory.drawSpark(g2, r + 8, r - 8, 4, 0xffffff, 0.9);
    TextureFactory.bake(g2, TEX.fieldTrapped, size, size);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Platforms
  // ──────────────────────────────────────────────────────────────────────────

  private static buildPlatforms(scene: Phaser.Scene): void {
    TextureFactory.buildPlatformTexture(scene, TEX.platform, 96, 18);
    TextureFactory.buildPlatformTexture(scene, TEX.platformShort, 48, 18);
  }

  private static buildPlatformTexture(
    scene: Phaser.Scene,
    key: string,
    w: number,
    h: number
  ): void {
    const g = scene.add.graphics({ x: 0, y: 0 });

    g.fillStyle(0x000000, 0.28);
    g.fillRoundedRect(1, 3, w - 2, h - 1, 4);
    g.fillStyle(COLORS.platformShadow, 1);
    g.fillRoundedRect(0, 0, w, h, 5);
    g.fillStyle(COLORS.platformBase, 1);
    g.fillRoundedRect(1, 1, w - 2, h - 4, 4);
    g.fillStyle(COLORS.steelMid, 0.72);
    g.fillRect(4, 4, w - 8, 5);
    g.fillStyle(0xffffff, 0.08);
    g.fillRect(4, 4, w - 8, 2);

    // segmented plating
    g.lineStyle(1, 0xffffff, 0.12);
    for (let x = 18; x < w - 8; x += 18) {
      g.lineBetween(x, 4, x - 4, h - 6);
    }

    // neon top rail
    TextureFactory.glowCircle(g, w / 2, 2, Math.max(18, w / 2), COLORS.platformEdge, 0.25);
    g.fillStyle(COLORS.platformEdge, 1);
    g.fillRect(3, 0, w - 6, 2);
    g.fillStyle(0xffffff, 0.65);
    g.fillRect(7, 0, w - 14, 1);

    // underside and bolts
    g.fillStyle(0x050611, 0.85);
    g.fillRect(2, h - 5, w - 4, 4);
    g.fillStyle(COLORS.neonGold, 0.75);
    g.fillCircle(8, h - 6, 1.5);
    g.fillCircle(w - 8, h - 6, 1.5);

    TextureFactory.bake(g, key, w, h);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Portal
  // ──────────────────────────────────────────────────────────────────────────

  private static buildPortal(scene: Phaser.Scene): void {
    const size = 80;
    const r = size / 2;
    const g = scene.add.graphics({ x: 0, y: 0 });

    TextureFactory.glowCircle(g, r, r, r, COLORS.portal, 2);
    TextureFactory.glowCircle(g, r, r, r - 8, COLORS.portalSecondary, 0.8);
    g.fillStyle(0x06061a, 0.68);
    g.fillCircle(r, r, r - 14);
    g.lineStyle(4, COLORS.portal, 1);
    g.strokeCircle(r, r, r - 6);
    g.lineStyle(2, COLORS.portalSecondary, 0.95);
    g.strokeCircle(r, r, r - 14);
    g.lineStyle(1.5, 0xffffff, 0.65);
    g.strokeCircle(r, r, r - 23);
    g.fillStyle(COLORS.portalSecondary, 0.32);
    g.fillCircle(r, r, r - 26);
    g.fillStyle(0xffffff, 0.86);
    g.fillCircle(r, r, r - 31);

    // vortex spokes
    g.lineStyle(2.2, COLORS.portal, 0.85);
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6 + 0.4;
      const x1 = r + Math.cos(a) * 8;
      const y1 = r + Math.sin(a) * 8;
      const x2 = r + Math.cos(a + 0.45) * 28;
      const y2 = r + Math.sin(a + 0.45) * 28;
      g.lineBetween(x1, y1, x2, y2);
    }
    TextureFactory.drawSpark(g, r - 22, r - 18, 4, 0xffffff, 0.8);
    TextureFactory.drawSpark(g, r + 24, r + 14, 3, COLORS.portal, 0.9);

    TextureFactory.bake(g, TEX.portal, size, size);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Pickups
  // ──────────────────────────────────────────────────────────────────────────

  private static buildPickups(scene: Phaser.Scene): void {
    const size = 14;
    const g = scene.add.graphics({ x: 0, y: 0 });

    TextureFactory.glowCircle(g, size / 2, size / 2, 9, COLORS.scrap, 0.9);
    g.fillStyle(0x9a5c16, 1);
    g.fillTriangle(size / 2, 0, size, size - 2, size / 2, size);
    g.fillTriangle(size / 2, 0, size / 2, size, 0, size - 2);
    g.fillStyle(COLORS.scrap, 1);
    g.fillTriangle(size / 2, 2, size - 2, size - 3, size / 2, size - 1);
    g.fillStyle(0xfff2b2, 0.85);
    g.fillTriangle(size / 2, 2, size / 2 + 3, size - 5, size / 2 - 2, size - 3);
    TextureFactory.bake(g, TEX.scrap, size, size);

    const g2 = scene.add.graphics({ x: 0, y: 0 });
    TextureFactory.glowCircle(g2, size / 2, size / 2, 9, COLORS.battery, 0.9);
    g2.fillStyle(0x07101d, 1);
    g2.fillRoundedRect(1, 2, size - 2, size - 4, 2);
    g2.fillStyle(COLORS.battery, 1);
    g2.fillRoundedRect(3, 4, size - 6, size - 8, 1.5);
    g2.fillStyle(0xffffff, 0.72);
    g2.fillRect(4, 5, size - 8, 2);
    g2.fillStyle(COLORS.neonGold, 1);
    g2.fillRect(size / 2 - 1, 0, 2, 3);
    TextureFactory.bake(g2, TEX.battery, size, size);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Particles / FX
  // ──────────────────────────────────────────────────────────────────────────

  private static buildParticles(scene: Phaser.Scene): void {
    // soft circle particle
    const size = 12;
    const g = scene.add.graphics({ x: 0, y: 0 });
    TextureFactory.glowCircle(g, size / 2, size / 2, size / 2, 0xffffff, 1.7);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(size / 2, size / 2, 2.5);
    TextureFactory.bake(g, TEX.particle, size, size);

    // 4-point star particle
    const s = 14;
    const g2 = scene.add.graphics({ x: 0, y: 0 });
    TextureFactory.glowCircle(g2, s / 2, s / 2, s / 2, 0xffffff, 1.1);
    g2.fillStyle(0xffffff, 1);
    g2.fillTriangle(s / 2, 0, s / 2 + 2.3, s / 2, s / 2 - 2.3, s / 2);
    g2.fillTriangle(s / 2, s, s / 2 + 2.3, s / 2, s / 2 - 2.3, s / 2);
    g2.fillTriangle(0, s / 2, s / 2, s / 2 - 2.3, s / 2, s / 2 + 2.3);
    g2.fillTriangle(s, s / 2, s / 2, s / 2 - 2.3, s / 2, s / 2 + 2.3);
    g2.fillCircle(s / 2, s / 2, 1.6);
    TextureFactory.bake(g2, TEX.star, s, s);

    // shockwave ring (gets scaled at run-time)
    const sw = 64;
    const r = sw / 2;
    const g3 = scene.add.graphics({ x: 0, y: 0 });
    TextureFactory.glowCircle(g3, r, r, r, 0xffffff, 0.45);
    g3.lineStyle(4, 0xffffff, 1);
    g3.strokeCircle(r, r, r - 5);
    g3.lineStyle(2, COLORS.neonCyan, 1);
    g3.strokeCircle(r, r, r - 10);
    g3.lineStyle(1, COLORS.neonPink, 0.55);
    g3.strokeCircle(r, r, r - 16);
    TextureFactory.bake(g3, TEX.shockwave, sw, sw);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Hearts
  // ──────────────────────────────────────────────────────────────────────────

  private static buildHearts(scene: Phaser.Scene): void {
    const W = 22;
    const H = 20;

    const drawHeart = (color: number, alpha: number, key: string) => {
      const g = scene.add.graphics({ x: 0, y: 0 });
      TextureFactory.glowCircle(g, W / 2, H / 2, 13, color, key === TEX.heart ? 1 : 0.25);
      g.fillStyle(0x050611, alpha * 0.55);
      g.fillCircle(W / 2 - 5, 8, 6.5);
      g.fillCircle(W / 2 + 5, 8, 6.5);
      g.fillTriangle(W / 2 - 10, 9, W / 2 + 10, 9, W / 2, H);
      g.fillStyle(color, alpha);
      g.fillCircle(W / 2 - 5, 7, 6);
      g.fillCircle(W / 2 + 5, 7, 6);
      g.fillTriangle(W / 2 - 10, 8, W / 2 + 10, 8, W / 2, H - 1);
      g.fillStyle(0xffffff, 0.45 * alpha);
      g.fillCircle(W / 2 - 5, 5, 2.2);
      g.lineStyle(1, 0xffffff, 0.25 * alpha);
      g.strokeCircle(W / 2 - 5, 7, 6);
      g.strokeCircle(W / 2 + 5, 7, 6);
      TextureFactory.bake(g, key, W, H);
    };

    drawHeart(COLORS.neonPink, 1, TEX.heart);
    drawHeart(0x444466, 0.7, TEX.heartEmpty);
  }
}
