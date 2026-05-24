import Phaser from "phaser";
import { COLORS, DEPTH, GAME_HEIGHT, GAME_WIDTH, LOGICAL_SCALE, TEX } from "../constants";
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
        ? { far: 0x110b16, mid: 0x241545, near: 0x4a2a44, accent: COLORS.neonOrange, alt: COLORS.neonGold }
        : level.background === "lab-purple"
          ? { far: 0x0b0824, mid: 0x181443, near: 0x2c1f60, accent: COLORS.neonPink, alt: COLORS.neonCyan }
          : { far: COLORS.bgDeep, mid: COLORS.bgMid, near: COLORS.bgRim, accent: COLORS.neonCyan, alt: COLORS.neonPink };

    const bg = scene.add.graphics();
    bg.fillStyle(palette.far, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.fillStyle(palette.mid, 0.72);
    bg.fillCircle(GAME_WIDTH * 0.72, GAME_HEIGHT * 0.32, 360);
    bg.fillStyle(palette.near, 0.4);
    bg.fillCircle(GAME_WIDTH * 0.25, GAME_HEIGHT * 0.78, 280);
    bg.fillStyle(palette.accent, 0.05);
    bg.fillCircle(GAME_WIDTH * 0.82, GAME_HEIGHT * 0.78, 230);

    // perspective wall panels
    bg.lineStyle(1, 0xffffff, 0.04);
    for (let x = -80; x < GAME_WIDTH + 80; x += 64) {
      bg.lineBetween(x, 0, x - 84, GAME_HEIGHT - 86);
    }
    for (let y = 28; y < GAME_HEIGHT - 96; y += 46) {
      bg.lineBetween(0, y, GAME_WIDTH, y + 18);
    }
    bg.setDepth(DEPTH.bgFar);
    decorations.push(bg);

    // distant pipes, tanks and wall machinery
    const pipes = scene.add.graphics();
    pipes.fillStyle(0x03040d, 0.74);
    for (let i = 0; i < 7; i++) {
      const x = 42 + i * 145 + (i % 2) * 28;
      pipes.fillRoundedRect(x, 0, 24, GAME_HEIGHT - 70, 5);
      pipes.fillRoundedRect(x - 10, 78 + (i % 4) * 52, 44, 12, 3);
      pipes.fillStyle(0xffffff, 0.04);
      pipes.fillRect(x + 4, 8, 3, GAME_HEIGHT - 96);
      pipes.fillStyle(0x03040d, 0.74);
    }
    pipes.fillStyle(0x09102a, 0.82);
    for (let i = 0; i < 3; i++) {
      const x = 205 + i * 245;
      pipes.fillRoundedRect(x, 72 + i * 22, 70, 150, 12);
      pipes.fillStyle(palette.accent, 0.12);
      pipes.fillRoundedRect(x + 10, 90 + i * 22, 50, 104, 8);
      pipes.fillStyle(0xffffff, 0.06);
      pipes.fillRect(x + 16, 96 + i * 22, 6, 94);
      pipes.fillStyle(0x09102a, 0.82);
    }
    pipes.setDepth(DEPTH.bgMid);
    decorations.push(pipes);

    const catwalk = scene.add.graphics();
    catwalk.fillStyle(0x050713, 0.7);
    catwalk.fillRect(0, GAME_HEIGHT - 110, GAME_WIDTH, 28);
    catwalk.lineStyle(2, palette.accent, 0.18);
    catwalk.lineBetween(0, GAME_HEIGHT - 111, GAME_WIDTH, GAME_HEIGHT - 111);
    catwalk.lineStyle(1, 0xffffff, 0.06);
    for (let x = -20; x < GAME_WIDTH; x += 54) {
      catwalk.lineBetween(x, GAME_HEIGHT - 82, x + 38, GAME_HEIGHT - 109);
    }
    catwalk.setDepth(DEPTH.bgNear - 1);
    decorations.push(catwalk);

    for (let i = 0; i < 18; i++) {
      const beacon = scene.add.rectangle(
        40 + i * 54,
        GAME_HEIGHT - 102,
        16,
        3,
        i % 4 === 0 ? palette.alt : palette.accent,
        0.3
      );
      beacon.setDepth(DEPTH.bgNear);
      scene.tweens.add({
        targets: beacon,
        alpha: 0.75,
        duration: 500 + (i % 5) * 180,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      decorations.push(beacon);
    }

    // animated motes
    for (let i = 0; i < 24; i++) {
      const dot = scene.add.image(
        Phaser.Math.Between(20, GAME_WIDTH - 20),
        Phaser.Math.Between(20, GAME_HEIGHT - 80),
        TEX.particle
      );
      dot.setTint(i % 5 === 0 ? palette.alt : palette.accent);
      dot.setAlpha(0.16 + Math.random() * 0.28);
      // Particle texture baked at TEX_SUPERSAMPLE× density.
      dot.setScale((0.22 + Math.random() * 0.42) * LOGICAL_SCALE);
      dot.setBlendMode(Phaser.BlendModes.ADD);
      dot.setDepth(DEPTH.bgNear);
      scene.tweens.add({
        targets: dot,
        alpha: 0.55,
        y: dot.y - 8 - Math.random() * 20,
        duration: 900 + Math.random() * 1800,
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
    // Floor — fills from y=(GAME_HEIGHT-32) to the screen bottom.
    // The physics body top is at GAME_HEIGHT-32; draw the neon strip as a
    // filled rectangle starting exactly there so entities land flush with it.
    const floor = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 16, GAME_WIDTH, 32, COLORS.platformBase);
    scene.physics.add.existing(floor, true);
    floor.setDepth(DEPTH.platform);
    platforms.add(floor);

    const trim = scene.add.graphics();
    trim.fillStyle(0x050611, 0.8);
    trim.fillRect(0, GAME_HEIGHT - 34, GAME_WIDTH, 6);
    trim.fillStyle(COLORS.platformBase, 1);
    trim.fillRect(0, GAME_HEIGHT - 28, GAME_WIDTH, 28);
    trim.fillStyle(COLORS.platformEdge, 1);
    trim.fillRect(0, GAME_HEIGHT - 32, GAME_WIDTH, 2);
    trim.fillStyle(0xffffff, 0.35);
    trim.fillRect(0, GAME_HEIGHT - 31, GAME_WIDTH, 1);
    trim.lineStyle(1, 0xffffff, 0.08);
    for (let x = -20; x < GAME_WIDTH; x += 54) {
      trim.lineBetween(x, GAME_HEIGHT - 2, x + 28, GAME_HEIGHT - 28);
    }
    trim.setDepth(DEPTH.platform + 0.2);

    const leftTrim = scene.add.rectangle(4, GAME_HEIGHT / 2, 8, GAME_HEIGHT, COLORS.steelDark, 0.68);
    leftTrim.setDepth(DEPTH.platform - 0.1);
    const rightTrim = scene.add.rectangle(GAME_WIDTH - 4, GAME_HEIGHT / 2, 8, GAME_HEIGHT, COLORS.steelDark, 0.68);
    rightTrim.setDepth(DEPTH.platform - 0.1);

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
