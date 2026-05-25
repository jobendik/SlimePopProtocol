import Phaser from "phaser";
import { BOSS, DEPTH, LOGICAL_SCALE, TEX } from "../constants";
import { CssVisual } from "../systems/CssVisual";

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
  private visual: CssVisual;
  private hpBarVisual: CssVisual;
  private hpFillEl!: HTMLDivElement;
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
    const bodyWidth = (BOSS.width - 16) / LOGICAL_SCALE;
    const bodyHeight = (BOSS.height - 16) / LOGICAL_SCALE;
    this.body.setSize(bodyWidth, bodyHeight);
    this.body.setOffset(
      (this.width - bodyWidth) / 2,
      (this.height - bodyHeight) / 2
    );
    this.body.updateFromGameObject();
    this.patrolMinX = patrolMinX;
    this.patrolMaxX = patrolMaxX;
    this.nextSpawnAt = scene.time.now + 1500;
    this.nextStateAt = scene.time.now + 3000;
    this.body.setVelocityX(80);

    // CSS-rendered boss body
    this.setVisible(false);
    this.visual = new CssVisual(scene, "cv-boss", { depth: DEPTH.enemy + 1 });
    this.visual.setHtml(`
      <div class="boss-shadow"></div>
      <div class="boss-vents">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <div class="boss-body"></div>
      <div class="boss-core"></div>
      <div class="boss-eyes"><span></span><span></span></div>
    `);

    // CSS-rendered HP bar pinned to top-centre (separate visual, not tied
    // to the boss position).
    this.hpBarVisual = new CssVisual(scene, "cv-bosshp", { depth: DEPTH.hud });
    this.hpBarVisual.setHtml(`<div class="hp-track"><div class="hp-fill"></div></div>`);
    this.hpFillEl = this.hpBarVisual.node.querySelector(".hp-fill") as HTMLDivElement;
    // Pin the HP bar visually to top-centre by placing it at a fixed canvas
    // position.  The Phaser DOM container scales/pans with the canvas so this
    // stays anchored regardless of fit.
    this.hpBarVisual.setPosition(scene.scale.width / 2, 56);
    this.updateHpBar();
  }

  override update(time: number, _delta: number): void {
    if (!this.alive) return;

    if (this.state === "patrol") {
      this.body.setVelocityX(60 * this.direction);
      // Tight hover — wider oscillation pushed the boss outside the
      // field-flight altitude on the upper half of each cycle, making it
      // un-hittable.  Keep some life in the motion but constrain it.
      this.body.setVelocityY(Math.sin(time * 0.002) * 10);
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
    }

    this.visual.setState("state", this.state);
    this.visual.follow(this, LOGICAL_SCALE);
    this.updateHpBar();
  }

  takeDamage(amount = 1): boolean {
    if (!this.alive || this.state === "hurt") return false;
    this.hp -= amount;
    this.state = "hurt";
    this.nextStateAt = this.scene.time.now + 500;
    this.scene.cameras.main.shake(180, 0.01);
    this.visual.setState("state", "hurt");
    if (this.hp <= 0) {
      this.alive = false;
      this.hpBarVisual.setVisible(false);
      return true;
    }
    return false;
  }

  private updateHpBar(): void {
    if (!this.hpFillEl) return;
    const ratio = Math.max(0, this.hp / BOSS.hp);
    this.hpFillEl.style.width = `${ratio * 100}%`;
    const tier = ratio > 0.5 ? "high" : ratio > 0.25 ? "mid" : "low";
    this.hpBarVisual.setState("tier", tier);
  }

  destroyAll(): void {
    this.visual.destroy();
    this.hpBarVisual.destroy();
    this.destroy();
  }
}
