import Phaser from "phaser";
import { DEPTH, GAME_HEIGHT, GAME_WIDTH, TEX } from "../constants";
import { LEVELS, LEVEL_COUNT, type LevelData } from "../data/levels";
import { BossSlime } from "../entities/BossSlime";
import { Portal } from "../entities/Portal";
import { createSlime, type SlimeEnemy } from "../entities/SlimeEnemy";
import { CssVisual } from "./CssVisual";

export type LevelBuild = {
  level: LevelData;
  platforms: Phaser.Physics.Arcade.StaticGroup;
  decorations: Phaser.GameObjects.GameObject[];
  slimes: SlimeEnemy[];
  boss?: BossSlime;
  portal: Portal;
  playerSpawn: { x: number; y: number };
};

/**
 * Builds a level from its declarative data, including the floor/walls.
 */
export class LevelManager {
  static get count(): number {
    return LEVEL_COUNT;
  }

  static getLevel(index: number): LevelData {
    const safe = Phaser.Math.Clamp(index, 0, LEVEL_COUNT - 1);
    return LEVELS[safe];
  }

  static build(scene: Phaser.Scene, levelIndex: number): LevelBuild {
    const level = LevelManager.getLevel(levelIndex);
    const platforms = scene.physics.add.staticGroup();
    const decorations: Phaser.GameObjects.GameObject[] = [];

    LevelManager.buildBackground(scene, level, decorations);
    LevelManager.buildWalls(scene, platforms);
    LevelManager.buildInteriorPlatforms(scene, level, platforms);

    const slimes: SlimeEnemy[] = level.slimes.map((spec) => {
      const slime = createSlime(scene, spec.kind, spec.x, spec.y);
      if (spec.facing) slime.direction = spec.facing;
      slime.setPlatformGroup(platforms);
      return slime;
    });

    let boss: BossSlime | undefined;
    if (level.boss) {
      boss = new BossSlime(scene, level.boss.x, level.boss.y, 120, GAME_WIDTH - 120);
    }

    const portal = new Portal(scene, level.exit.x, level.exit.y);

    return {
      level,
      platforms,
      decorations,
      slimes,
      boss,
      portal,
      playerSpawn: level.player,
    };
  }

  private static buildBackground(
    scene: Phaser.Scene,
    level: LevelData,
    decorations: Phaser.GameObjects.GameObject[]
  ): void {
    // The procedural Phaser background graphics are replaced by a CSS
    // overlay that lives in the DOM container.  Per-level palette is
    // picked by the [data-bg] attribute (see game-graphics.css).
    const bgVisual = new CssVisual(scene, "cv-bg", {
      depth: DEPTH.bgFar,
      pixelWidth: GAME_WIDTH,
      pixelHeight: GAME_HEIGHT,
    });
    const palette = level.background ?? "lab-cyan";
    bgVisual.node.setAttribute("data-bg", palette);

    // Build the beacons + motes markup once.  These render entirely
    // through CSS animations.
    const beacons = Array.from({ length: 18 }, () => `<span></span>`).join("");
    const motes = Array.from({ length: 22 }, (_, i) => {
      const left = 4 + Math.random() * 92;
      const top = 6 + Math.random() * 64;
      const delay = (Math.random() * 6).toFixed(2);
      const scale = (0.7 + Math.random() * 1.6).toFixed(2);
      return `<span style="left:${left}%;top:${top}%;animation-delay:${delay}s;transform:scale(${scale})"></span>`;
    }).join("");

    bgVisual.setHtml(`
      <div class="bg-glow"></div>
      <div class="bg-pipes"></div>
      <div class="bg-grid"></div>
      <div class="bg-catwalk"></div>
      <div class="bg-beacons">${beacons}</div>
      <div class="bg-motes">${motes}</div>
    `);
    // The DOMElement is positioned at world (x, y) using translate(-50%,
    // -50%), so anchor it at the centre of the play area to cover the
    // full canvas.
    bgVisual.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // Hand the underlying Phaser DOMElement back to the decorations list so
    // it gets cleaned up with the scene.
    decorations.push(bgVisual.dom);
  }

  private static buildWalls(
    scene: Phaser.Scene,
    platforms: Phaser.Physics.Arcade.StaticGroup
  ): void {
    // Floor body — invisible Phaser rectangle for arcade collision.  The
    // visible floor is drawn by a CSS overlay positioned directly above.
    const floor = scene.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT - 16, GAME_WIDTH, 32, 0x000000, 0
    );
    scene.physics.add.existing(floor, true);
    floor.setDepth(DEPTH.platform);
    platforms.add(floor);

    const floorVisual = new CssVisual(scene, "cv-floor", {
      depth: DEPTH.platform,
      pixelWidth: GAME_WIDTH,
      pixelHeight: 32,
    });
    floorVisual.setHtml(`
      <div class="floor-body"></div>
      <div class="floor-grates"></div>
      <div class="floor-rail"></div>
    `);
    floorVisual.setPosition(GAME_WIDTH / 2, GAME_HEIGHT - 16);

    // Side walls / ceiling — invisible kinematic bodies only.
    const leftWall = scene.add.rectangle(-12, GAME_HEIGHT / 2, 24, GAME_HEIGHT, 0, 0);
    const rightWall = scene.add.rectangle(GAME_WIDTH + 12, GAME_HEIGHT / 2, 24, GAME_HEIGHT, 0, 0);
    const ceiling = scene.add.rectangle(GAME_WIDTH / 2, -12, GAME_WIDTH, 24, 0, 0);
    scene.physics.add.existing(leftWall, true);
    scene.physics.add.existing(rightWall, true);
    scene.physics.add.existing(ceiling, true);
    platforms.add(leftWall);
    platforms.add(rightWall);
    platforms.add(ceiling);
  }

  private static buildInteriorPlatforms(
    scene: Phaser.Scene,
    level: LevelData,
    platforms: Phaser.Physics.Arcade.StaticGroup
  ): void {
    for (const spec of level.platforms) {
      const platformWidth = spec.width;
      const segmentWidth = spec.style === "short" ? 48 : 96;
      const segments = Math.max(1, Math.ceil(platformWidth / segmentWidth));
      for (let i = 0; i < segments; i++) {
        const segWidth = platformWidth / segments + 1;
        const px = spec.x + (i + 0.5) * (platformWidth / segments) - platformWidth / 2;

        // Invisible static physics body for collision
        const img = scene.add.image(px, spec.y, TEX.platform);
        img.setDisplaySize(segWidth, 18);
        img.setDepth(DEPTH.platform);
        img.setVisible(false);
        const body = scene.physics.add.existing(img, true) as Phaser.GameObjects.Image & {
          body: Phaser.Physics.Arcade.StaticBody;
        };
        body.body.setSize(segWidth, 18);
        body.body.updateFromGameObject();
        platforms.add(img);

        // CSS visual on top — bolts count scales with segment width.
        const visual = new CssVisual(scene, "cv-platform", {
          depth: DEPTH.platform,
          pixelWidth: segWidth,
          pixelHeight: 18,
        });
        const boltCount = Math.max(2, Math.round(segWidth / 36));
        const bolts = Array.from({ length: boltCount }, () => `<span></span>`).join("");
        visual.setHtml(`
          <div class="plat-body"></div>
          <div class="plat-bolts">${bolts}</div>
          <div class="plat-rail"></div>
        `);
        visual.setPosition(px, spec.y);
      }
    }
  }
}
