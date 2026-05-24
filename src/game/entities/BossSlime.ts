import Phaser from "phaser";
import { BOSS, COLORS, DEPTH, LOGICAL_SCALE, TEX } from "../constants";

/**
 * Mini-boss: the Slime Reactor Blob.  Floats over the arena, periodically
 * spawning minions.  Takes damage when popped fields detonate within range,
 * or when trapped minions are popped near it.
 */
export class BossSlime extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  public hp: number = BOSS.hp;
  public alive = true;
  public override state: "patrol" | "telegraph" | "stomp" | "hurt" = "patrol";
  private nextSpawnAt: number;
  private nextStateAt: number;
  private hpBar?: Phaser.GameObjects.Graphics;
  private direction: 1 | -1 = 1;
  private patrolMinX: number;
  private patrolMaxX: number;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolMinX: number, patrolMaxX: number) {
    super(scene, x, y, TEX.boss);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTH.enemy + 1);
    // Texture is baked at TEX_SUPERSAMPLE× pixel density — scale down for
    // display while keeping the body in logical world units.
    this.setScale(LOGICAL_SCALE);
    this.body.setAllowGravity(false);
    this.body.setImmovable(false);
    this.body.setSize(BOSS.width - 16, BOSS.height - 16);
    // Same Phaser quirk as Player: offset is in texture coords and gets
    // multiplied by scaleX, so to keep the body centred on the displayed
    // sprite we use `(textureSize - bodySize/scale) / 2`.
    this.body.setOffset(
      (this.width - (BOSS.width - 16) / LOGICAL_SCALE) / 2,
      (this.height - (BOSS.height - 16) / LOGICAL_SCALE) / 2
    );
    this.patrolMinX = patrolMinX;
    this.patrolMaxX = patrolMaxX;
    this.nextSpawnAt = scene.time.now + 1500;
    this.nextStateAt = scene.time.now + 3000;
    this.body.setVelocityX(80);

    this.hpBar = scene.add.graphics();
    this.hpBar.setDepth(DEPTH.hud - 1);
    this.drawHpBar();
  }

  override update(time: number, _delta: number): void {
    if (!this.alive) return;

    if (this.state === "patrol") {
      this.body.setVelocityX(60 * this.direction);
      this.body.setVelocityY(Math.sin(time * 0.002) * 30);
      if (this.x < this.patrolMinX) this.direction = 1;
      if (this.x > this.patrolMaxX) this.direction = -1;
    }

    // Periodically spawn a minion request — handled by GameScene
    if (time >= this.nextSpawnAt) {
      this.scene.events.emit("boss:spawnMinion", this.x, this.y + 40);
      this.nextSpawnAt = time + BOSS.spawnIntervalMs;
    }

    if (this.state === "hurt" && time >= this.nextStateAt) {
      this.state = "patrol";
      this.clearTint();
    }

    this.drawHpBar();
  }

  takeDamage(amount = 1): boolean {
    if (!this.alive || this.state === "hurt") return false;
    this.hp -= amount;
    this.state = "hurt";
    this.nextStateAt = this.scene.time.now + 500;
    this.setTint(0xff5577);
    this.scene.cameras.main.shake(180, 0.01);
    if (this.hp <= 0) {
      this.alive = false;
      this.hpBar?.clear();
      return true;
    }
    return false;
  }

  private drawHpBar(): void {
    if (!this.hpBar) return;
    const g = this.hpBar;
    g.clear();
    const width = 240;
    const x = (this.scene.cameras.main.width - width) / 2;
    const y = 40;
    g.fillStyle(0x06061a, 0.75);
    g.fillRoundedRect(x - 4, y - 6, width + 8, 18, 4);
    g.fillStyle(0x222b55, 1);
    g.fillRoundedRect(x, y, width, 8, 3);
    const ratio = Math.max(0, this.hp / BOSS.hp);
    const col =
      ratio > 0.5 ? COLORS.neonGreen : ratio > 0.25 ? COLORS.neonGold : COLORS.warning;
    g.fillStyle(col, 1);
    g.fillRoundedRect(x, y, width * ratio, 8, 3);
  }

  destroyAll(): void {
    this.hpBar?.destroy();
    this.destroy();
  }
}
