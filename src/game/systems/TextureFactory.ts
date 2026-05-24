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

    // backpack glow halo
    g.fillStyle(COLORS.neonCyan, 0.12);
    g.fillCircle(W / 2, H / 2 - 2, 22);

    // body shell
    g.fillStyle(0x1c2a4a, 1);
    g.fillRoundedRect(6, 14, W - 12, H - 18, 6);
    g.fillStyle(0xe7f6ff, 1);
    g.fillRoundedRect(8, 16, W - 16, H - 26, 5);

    // head
    g.fillStyle(0xe7f6ff, 1);
    g.fillRoundedRect(7, 4, W - 14, 14, 5);
    g.fillStyle(0x1c2a4a, 1);
    g.fillRoundedRect(9, 6, W - 18, 10, 4);

    // visor / eye
    g.fillStyle(COLORS.neonCyan, 1);
    g.fillRoundedRect(11, 8, W - 22, 6, 2);
    g.fillStyle(0xffffff, 1);
    g.fillRect(13, 9, 3, 2);

    // antenna
    g.fillStyle(0xe7f6ff, 1);
    g.fillRect(W / 2 - 1, 0, 2, 4);
    g.fillStyle(COLORS.neonPink, 1);
    g.fillCircle(W / 2, 1, 2);

    // feet
    g.fillStyle(0x111634, 1);
    g.fillRoundedRect(7, H - 6, 8, 6, 2);
    g.fillRoundedRect(W - 15, H - 6, 8, 6, 2);

    // chest emitter dot
    g.fillStyle(COLORS.neonCyan, 1);
    g.fillCircle(W / 2, H / 2 + 4, 2.4);

    TextureFactory.bake(g, TEX.player, W, H);
  }

  private static buildPlayerShoot(scene: Phaser.Scene): void {
    // Same body as TEX.player but with a brighter visor + flash on the arm.
    const g = scene.add.graphics({ x: 0, y: 0 });
    const W = 36;
    const H = 44;

    g.fillStyle(COLORS.neonCyan, 0.22);
    g.fillCircle(W / 2, H / 2 - 2, 24);

    g.fillStyle(0x1c2a4a, 1);
    g.fillRoundedRect(6, 14, W - 12, H - 18, 6);
    g.fillStyle(0xe7f6ff, 1);
    g.fillRoundedRect(8, 16, W - 16, H - 26, 5);

    g.fillStyle(0xe7f6ff, 1);
    g.fillRoundedRect(7, 4, W - 14, 14, 5);
    g.fillStyle(0x1c2a4a, 1);
    g.fillRoundedRect(9, 6, W - 18, 10, 4);
    g.fillStyle(COLORS.neonCyan, 1);
    g.fillRoundedRect(11, 8, W - 22, 6, 2);
    g.fillStyle(0xffffff, 1);
    g.fillRect(13, 9, 3, 2);

    g.fillStyle(0xe7f6ff, 1);
    g.fillRect(W / 2 - 1, 0, 2, 4);
    g.fillStyle(COLORS.neonPink, 1);
    g.fillCircle(W / 2, 1, 2);

    g.fillStyle(0x111634, 1);
    g.fillRoundedRect(7, H - 6, 8, 6, 2);
    g.fillRoundedRect(W - 15, H - 6, 8, 6, 2);

    // Charged chest emitter
    g.fillStyle(0xffffff, 1);
    g.fillCircle(W / 2, H / 2 + 4, 4);
    g.fillStyle(COLORS.neonCyan, 1);
    g.fillCircle(W / 2, H / 2 + 4, 2.6);

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

    // shadow
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(W / 2, H - 2, W - 6, 4);

    // body
    g.fillStyle(color, 1);
    g.fillEllipse(W / 2, H / 2 + 2, W - 4, H - 4);

    // highlight
    g.fillStyle(0xffffff, 0.35);
    g.fillEllipse(W / 2 - 4, H / 2 - 2, 9, 5);

    // eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(W / 2 - 5, H / 2, 3.4);
    g.fillCircle(W / 2 + 5, H / 2, 3.4);
    g.fillStyle(0x000000, 1);
    g.fillCircle(W / 2 - 5, H / 2 + 1, 1.6);
    g.fillCircle(W / 2 + 5, H / 2 + 1, 1.6);

    // mouth
    if (options.mouth ?? true) {
      g.lineStyle(1.2, 0x000000, 0.7);
      g.beginPath();
      g.arc(W / 2, H / 2 + 5, 3, 0, Math.PI, false);
      g.strokePath();
    }

    // accent crown
    switch (options.crown ?? "none") {
      case "spike":
        g.fillStyle(accent, 1);
        g.fillTriangle(W / 2 - 5, 6, W / 2, 1, W / 2 + 5, 6);
        break;
      case "bolt":
        g.fillStyle(accent, 1);
        g.fillTriangle(W / 2 - 4, 8, W / 2 + 1, 2, W / 2 - 1, 6);
        g.fillTriangle(W / 2 - 1, 6, W / 2 + 4, 0, W / 2 + 1, 5);
        break;
      case "shield":
        g.fillStyle(accent, 1);
        g.fillRoundedRect(4, 5, W - 8, 4, 2);
        g.fillStyle(0xffffff, 0.5);
        g.fillRect(6, 6, W - 12, 1);
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

    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(W / 2, H - 6, W - 16, 8);

    // big slime body
    g.fillStyle(0xc168ff, 1);
    g.fillEllipse(W / 2, H / 2 + 4, W - 12, H - 16);

    g.fillStyle(0xffffff, 0.3);
    g.fillEllipse(W / 2 - 18, H / 2 - 8, 28, 12);

    // reactor core
    g.fillStyle(0x06061a, 1);
    g.fillCircle(W / 2, H / 2 + 6, 16);
    g.fillStyle(COLORS.neonCyan, 1);
    g.fillCircle(W / 2, H / 2 + 6, 12);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(W / 2 - 3, H / 2 + 3, 4);

    // eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(W / 2 - 24, H / 2 - 4, 8);
    g.fillCircle(W / 2 + 24, H / 2 - 4, 8);
    g.fillStyle(0x06061a, 1);
    g.fillCircle(W / 2 - 22, H / 2 - 2, 4);
    g.fillCircle(W / 2 + 26, H / 2 - 2, 4);

    // crown spikes
    g.fillStyle(0xc168ff, 1);
    for (let i = 0; i < 5; i++) {
      const x = 20 + i * ((W - 40) / 4);
      g.fillTriangle(x - 6, 16, x, 2, x + 6, 16);
    }

    TextureFactory.bake(g, TEX.boss, W, H);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Containment field
  // ──────────────────────────────────────────────────────────────────────────

  private static buildField(scene: Phaser.Scene): void {
    const size = 48;
    const r = size / 2;
    const g = scene.add.graphics({ x: 0, y: 0 });

    // soft outer halo
    for (let i = 6; i > 0; i--) {
      g.fillStyle(COLORS.neonCyan, 0.06 * i);
      g.fillCircle(r, r, r - (6 - i) * 0.8);
    }
    // inner glow
    g.fillStyle(0xffffff, 0.65);
    g.fillCircle(r, r, r - 10);
    g.fillStyle(COLORS.neonCyan, 0.55);
    g.fillCircle(r, r, r - 8);

    // crisp rim
    g.lineStyle(2, COLORS.neonCyan, 1);
    g.strokeCircle(r, r, r - 4);
    g.lineStyle(1, 0xffffff, 0.85);
    g.strokeCircle(r, r, r - 6);

    // sparkle dots
    g.fillStyle(0xffffff, 1);
    g.fillCircle(r - 6, r - 6, 1.4);
    g.fillCircle(r + 4, r + 5, 1);

    TextureFactory.bake(g, TEX.field, size, size);

    // larger, warmer texture for trapped state
    const g2 = scene.add.graphics({ x: 0, y: 0 });
    for (let i = 6; i > 0; i--) {
      g2.fillStyle(COLORS.neonPink, 0.06 * i);
      g2.fillCircle(r, r, r - (6 - i) * 0.8);
    }
    g2.fillStyle(0xffffff, 0.55);
    g2.fillCircle(r, r, r - 10);
    g2.fillStyle(COLORS.neonPink, 0.5);
    g2.fillCircle(r, r, r - 8);
    g2.lineStyle(2, COLORS.neonPink, 1);
    g2.strokeCircle(r, r, r - 4);
    g2.lineStyle(1, 0xffffff, 0.85);
    g2.strokeCircle(r, r, r - 6);
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

    // base
    g.fillStyle(COLORS.platformBase, 1);
    g.fillRoundedRect(0, 0, w, h, 4);

    // subtle inner gradient strip
    g.fillStyle(0x2e3973, 1);
    g.fillRect(2, 3, w - 4, h - 8);

    // neon top edge
    g.fillStyle(COLORS.platformEdge, 1);
    g.fillRect(2, 0, w - 4, 2);
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(4, 0, w - 8, 1);

    // bolts
    g.fillStyle(COLORS.platformShadow, 1);
    g.fillCircle(5, h - 4, 1.4);
    g.fillCircle(w - 5, h - 4, 1.4);

    // underside shadow
    g.fillStyle(COLORS.platformShadow, 0.6);
    g.fillRect(2, h - 3, w - 4, 3);

    TextureFactory.bake(g, key, w, h);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Portal
  // ──────────────────────────────────────────────────────────────────────────

  private static buildPortal(scene: Phaser.Scene): void {
    const size = 80;
    const r = size / 2;
    const g = scene.add.graphics({ x: 0, y: 0 });

    for (let i = 8; i > 0; i--) {
      g.fillStyle(COLORS.portal, 0.05 * i);
      g.fillCircle(r, r, r - (8 - i) * 1.4);
    }
    g.lineStyle(3, COLORS.portal, 1);
    g.strokeCircle(r, r, r - 6);
    g.lineStyle(1.5, COLORS.portalSecondary, 0.9);
    g.strokeCircle(r, r, r - 12);
    g.lineStyle(1, 0xffffff, 0.6);
    g.strokeCircle(r, r, r - 18);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(r, r, r - 24);

    TextureFactory.bake(g, TEX.portal, size, size);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Pickups
  // ──────────────────────────────────────────────────────────────────────────

  private static buildPickups(scene: Phaser.Scene): void {
    const size = 14;
    const g = scene.add.graphics({ x: 0, y: 0 });

    g.fillStyle(COLORS.scrap, 1);
    g.fillTriangle(size / 2, 0, size, size, 0, size);
    g.fillStyle(0xffffff, 0.6);
    g.fillTriangle(size / 2, 2, size / 2 + 3, size - 4, size / 2 - 3, size - 4);
    TextureFactory.bake(g, TEX.scrap, size, size);

    const g2 = scene.add.graphics({ x: 0, y: 0 });
    g2.fillStyle(COLORS.battery, 1);
    g2.fillRoundedRect(0, 2, size, size - 4, 2);
    g2.fillStyle(0xffffff, 0.6);
    g2.fillRect(2, 3, size - 4, 2);
    TextureFactory.bake(g2, TEX.battery, size, size);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Particles / FX
  // ──────────────────────────────────────────────────────────────────────────

  private static buildParticles(scene: Phaser.Scene): void {
    // soft circle particle
    const size = 12;
    const g = scene.add.graphics({ x: 0, y: 0 });
    for (let i = 6; i > 0; i--) {
      g.fillStyle(0xffffff, 0.16 * i);
      g.fillCircle(size / 2, size / 2, (size / 2) * (i / 6));
    }
    TextureFactory.bake(g, TEX.particle, size, size);

    // 4-point star particle
    const s = 14;
    const g2 = scene.add.graphics({ x: 0, y: 0 });
    g2.fillStyle(0xffffff, 1);
    g2.fillTriangle(s / 2, 0, s / 2 + 2, s / 2, s / 2 - 2, s / 2);
    g2.fillTriangle(s / 2, s, s / 2 + 2, s / 2, s / 2 - 2, s / 2);
    g2.fillTriangle(0, s / 2, s / 2, s / 2 - 2, s / 2, s / 2 + 2);
    g2.fillTriangle(s, s / 2, s / 2, s / 2 - 2, s / 2, s / 2 + 2);
    TextureFactory.bake(g2, TEX.star, s, s);

    // shockwave ring (gets scaled at run-time)
    const sw = 64;
    const r = sw / 2;
    const g3 = scene.add.graphics({ x: 0, y: 0 });
    g3.lineStyle(4, 0xffffff, 1);
    g3.strokeCircle(r, r, r - 4);
    g3.lineStyle(2, COLORS.neonCyan, 1);
    g3.strokeCircle(r, r, r - 8);
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
      g.fillStyle(color, alpha);
      g.fillCircle(W / 2 - 5, 7, 6);
      g.fillCircle(W / 2 + 5, 7, 6);
      g.fillTriangle(W / 2 - 10, 8, W / 2 + 10, 8, W / 2, H - 1);
      g.fillStyle(0xffffff, 0.4 * alpha);
      g.fillCircle(W / 2 - 5, 5, 2);
      TextureFactory.bake(g, key, W, H);
    };

    drawHeart(COLORS.neonPink, 1, TEX.heart);
    drawHeart(0x444466, 0.7, TEX.heartEmpty);
  }
}
