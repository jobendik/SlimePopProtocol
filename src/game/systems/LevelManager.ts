import Phaser from "phaser";
import { COLORS, DEPTH, GAME_HEIGHT, GAME_WIDTH, TEX } from "../constants";
import { LEVELS, LEVEL_COUNT, type LevelData } from "../data/levels";
import { BossSlime } from "../entities/BossSlime";
import { Portal } from "../entities/Portal";
import { createSlime, type SlimeEnemy } from "../entities/SlimeEnemy";

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
    const palette =
      level.background === "lab-amber"
        ? { far: 0x2a1a48, near: 0x4a2a44, accent: COLORS.neonOrange }
        : level.background === "lab-purple"
          ? { far: 0x1e1a48, near: 0x2c1f60, accent: COLORS.neonPink }
          : { far: 0x0a0c2a, near: 0x1d2470, accent: COLORS.neonCyan };

    const bg = scene.add.graphics();
    bg.fillStyle(palette.far, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.fillStyle(palette.near, 0.55);
    for (let i = 0; i < 18; i++) {
      const x = (i / 18) * GAME_WIDTH;
      bg.fillRect(x, 0, 2, GAME_HEIGHT);
    }
    bg.setDepth(DEPTH.bgFar);
    decorations.push(bg);

    // distant pipes silhouette
    const pipes = scene.add.graphics();
    pipes.fillStyle(0x070718, 1);
    for (let i = 0; i < 6; i++) {
      const x = 60 + i * 160 + (i % 2) * 30;
      pipes.fillRect(x, 0, 26, GAME_HEIGHT);
      pipes.fillRect(x - 4, 90 + (i % 3) * 60, 34, 14);
    }
    pipes.setAlpha(0.45);
    pipes.setDepth(DEPTH.bgMid);
    decorations.push(pipes);

    // animated dots
    for (let i = 0; i < 14; i++) {
      const dot = scene.add.image(
        Phaser.Math.Between(20, GAME_WIDTH - 20),
        Phaser.Math.Between(20, GAME_HEIGHT - 80),
        TEX.particle
      );
      dot.setTint(palette.accent);
      dot.setAlpha(0.3);
      dot.setScale(0.4);
      dot.setDepth(DEPTH.bgNear);
      scene.tweens.add({
        targets: dot,
        alpha: 0.8,
        duration: 600 + Math.random() * 1400,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      decorations.push(dot);
    }
  }

  private static buildWalls(
    scene: Phaser.Scene,
    platforms: Phaser.Physics.Arcade.StaticGroup
  ): void {
    // Floor — invisible, but with a visible neon strip on top
    const floor = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 16, GAME_WIDTH, 32, COLORS.platformBase);
    scene.physics.add.existing(floor, true);
    floor.setStrokeStyle(2, COLORS.platformEdge, 1);
    floor.setDepth(DEPTH.platform);
    platforms.add(floor);

    // Side walls — keep player + slimes on screen
    const leftWall = scene.add.rectangle(-12, GAME_HEIGHT / 2, 24, GAME_HEIGHT, COLORS.bgDeep, 0);
    const rightWall = scene.add.rectangle(GAME_WIDTH + 12, GAME_HEIGHT / 2, 24, GAME_HEIGHT, COLORS.bgDeep, 0);
    const ceiling = scene.add.rectangle(GAME_WIDTH / 2, -12, GAME_WIDTH, 24, COLORS.bgDeep, 0);
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
      const tex = spec.style === "short" ? TEX.platformShort : TEX.platform;
      const platformWidth = spec.width;
      const segmentWidth = spec.style === "short" ? 48 : 96;
      const segments = Math.max(1, Math.ceil(platformWidth / segmentWidth));
      for (let i = 0; i < segments; i++) {
        const px = spec.x + (i + 0.5) * (platformWidth / segments) - platformWidth / 2 + 0;
        const img = scene.add.image(px, spec.y, tex);
        img.setDisplaySize(platformWidth / segments + 1, 18);
        img.setDepth(DEPTH.platform);
        const body = scene.physics.add.existing(img, true) as Phaser.GameObjects.Image & {
          body: Phaser.Physics.Arcade.StaticBody;
        };
        body.body.setSize(platformWidth / segments + 1, 18);
        body.body.updateFromGameObject();
        platforms.add(img);
      }
    }
  }
}
