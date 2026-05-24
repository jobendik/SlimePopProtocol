import Phaser from "phaser";
import { DEPTH, ENEMY, LOGICAL_SCALE, TEX } from "../constants";
import type { ContainmentField } from "./ContainmentField";

export type SlimeKind = "basic" | "bouncer" | "charger" | "shield";

/**
 * Base class for every slime mutant.  Each subclass overrides `aiTick()` to
 * provide its own behaviour.  Trapping logic is centralised here.
 */
export abstract class SlimeEnemy extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  public hp = 1;
  public kind: SlimeKind;
  public override state: "alive" | "trapped" | "dead" = "alive";
  public bornAt: number;
  public hostingField: ContainmentField | null = null;
  public direction: 1 | -1 = 1;

  protected savedGravity = true;
  private platformGroup: Phaser.Physics.Arcade.StaticGroup | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: SlimeKind, textureKey: string) {
    super(scene, x, y, textureKey);
    this.kind = kind;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTH.enemy);
    // Textures are baked at TEX_SUPERSAMPLE× pixel density.
    this.setScale(LOGICAL_SCALE);
    this.setCollideWorldBounds(true);
    this.body.setBounce(0, 0);
    // Arcade bodies are sized in source pixels and then multiplied by scale.
    // The intended body is the displayed slime minus a small forgiving inset.
    const bodyWidth = (this.displayWidth - 4) / LOGICAL_SCALE;
    const bodyHeight = (this.displayHeight - 4) / LOGICAL_SCALE;
    this.body.setSize(bodyWidth, bodyHeight);
    // Center horizontally and bottom-align vertically so visual slime bottoms
    // rest on platforms instead of sinking into them.
    this.body.setOffset(
      (this.width - bodyWidth) / 2,
      this.height - bodyHeight
    );
    this.bornAt = scene.time.now;
    this.direction = Math.random() < 0.5 ? -1 : 1;
  }

  /** Called from GameScene each frame; sub-classes implement AI. */
  abstract aiTick(time: number, delta: number): void;

  override update(time: number, delta: number): void {
    // All setScale calls multiply by LOGICAL_SCALE so the texture supersample
    // doesn't get clobbered back to 1× by the squash/stretch animation.
    if (this.state !== "alive") {
      // While trapped, ContainmentField positions us; just wobble visually
      this.setScale(
        (1 + Math.sin(time * 0.018) * 0.06) * LOGICAL_SCALE,
        (1 - Math.sin(time * 0.018) * 0.06) * LOGICAL_SCALE
      );
      return;
    }

    // Squash/stretch
    const onGround = this.body.blocked.down || this.body.touching.down;
    const vy = this.body.velocity.y;
    if (onGround) {
      this.setScale(
        (1 + Math.sin(time * 0.012) * 0.04) * LOGICAL_SCALE,
        (1 - Math.sin(time * 0.012) * 0.04) * LOGICAL_SCALE
      );
    } else {
      const stretch = Phaser.Math.Clamp(vy / 600, -1, 1);
      this.setScale(
        (1 - stretch * 0.12) * LOGICAL_SCALE,
        (1 + stretch * 0.12) * LOGICAL_SCALE
      );
    }

    // Turn-at-ledge / wall logic — overridable
    if (this.shouldTurnAtEdge() && onGround) {
      this.checkLedgeOrWall();
    }

    this.aiTick(time, delta);

    // Face direction
    this.setFlipX(this.direction === -1);
  }

  protected shouldTurnAtEdge(): boolean {
    return true;
  }

  /** Called by GameScene right after construction so we can probe for ledges. */
  setPlatformGroup(group: Phaser.Physics.Arcade.StaticGroup): void {
    this.platformGroup = group;
  }

  /**
   * Flip direction when we hit a wall.  If we have a reference to the static
   * platform group, also flip when there's no ground a body-width ahead so
   * basic slimes don't walk off ledges.
   */
  protected checkLedgeOrWall(): void {
    if (this.body.blocked.left) {
      this.direction = 1;
      return;
    }
    if (this.body.blocked.right) {
      this.direction = -1;
      return;
    }
    if (!this.platformGroup) return;
    const probeX = this.x + this.direction * (this.body.width / 2 + 4);
    const probeY = this.y + this.body.height / 2 + 6;
    let hasGround = false;
    this.platformGroup.getChildren().forEach((p) => {
      if (hasGround) return;
      const body = (p as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.StaticBody | null;
      if (!body) return;
      if (
        probeX >= body.x &&
        probeX <= body.x + body.width &&
        probeY >= body.y &&
        probeY <= body.y + body.height + 4
      ) {
        hasGround = true;
      }
    });
    if (!hasGround) {
      this.direction = this.direction === 1 ? -1 : 1;
    }
  }

  onTrapped(field: ContainmentField): void {
    this.state = "trapped";
    this.hostingField = field;
    this.body.setAllowGravity(false);
    this.body.setVelocity(0, 0);
  }

  onReleased(_field: ContainmentField): void {
    this.state = "alive";
    this.hostingField = null;
    this.body.setAllowGravity(true);
    this.body.setVelocity(0, 0);
    this.setRotation(0);
    this.scene.events.emit("slime:escaped", this);
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.state = "dead";
      return true;
    }
    return false;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Basic — hops left/right at constant speed.
// ────────────────────────────────────────────────────────────────────────────
export class BasicSlime extends SlimeEnemy {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "basic", TEX.slimeBasic);
    this.hp = 1;
  }

  aiTick(_time: number, _delta: number): void {
    this.body.setVelocityX(ENEMY.basicSpeed * this.direction);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Bouncer — hops periodically, slightly faster ground movement.
// ────────────────────────────────────────────────────────────────────────────
export class BouncerSlime extends SlimeEnemy {
  private nextHopAt: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "bouncer", TEX.slimeBouncer);
    this.hp = 1;
    this.nextHopAt = scene.time.now + 600 + Math.random() * 800;
  }

  aiTick(time: number, _delta: number): void {
    this.body.setVelocityX(ENEMY.bouncerSpeed * this.direction);
    const onGround = this.body.blocked.down || this.body.touching.down;
    if (onGround && time >= this.nextHopAt) {
      this.body.setVelocityY(ENEMY.bouncerJumpVelocity);
      this.nextHopAt = time + ENEMY.bouncerJumpIntervalMs + Math.random() * 400;
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Charger — paces slowly, then telegraphs and dashes.
// ────────────────────────────────────────────────────────────────────────────
export class ChargerSlime extends SlimeEnemy {
  private aiState: "walk" | "windup" | "charge" | "recover" = "walk";
  private nextStateAt: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "charger", TEX.slimeCharger);
    this.hp = 1;
    this.nextStateAt = scene.time.now + 1400 + Math.random() * 600;
  }

  aiTick(time: number, _delta: number): void {
    switch (this.aiState) {
      case "walk":
        this.body.setVelocityX(ENEMY.chargerWalkSpeed * this.direction);
        this.clearTint();
        if (time >= this.nextStateAt) {
          this.aiState = "windup";
          this.nextStateAt = time + ENEMY.chargerWindupMs;
        }
        break;
      case "windup":
        this.body.setVelocityX(0);
        // Telegraph: yellow flicker
        this.setTint(Math.floor(time / 80) % 2 === 0 ? 0xffd166 : 0xffffff);
        if (time >= this.nextStateAt) {
          this.aiState = "charge";
          this.nextStateAt = time + 600;
        }
        break;
      case "charge":
        this.body.setVelocityX(ENEMY.chargerSpeed * this.direction);
        this.setTint(0xff8866);
        if (
          time >= this.nextStateAt ||
          this.body.blocked.left ||
          this.body.blocked.right
        ) {
          this.aiState = "recover";
          this.nextStateAt = time + ENEMY.chargerRecoveryMs;
          this.clearTint();
          if (this.body.blocked.left) this.direction = 1;
          else if (this.body.blocked.right) this.direction = -1;
        }
        break;
      case "recover":
        this.body.setVelocityX(0);
        if (time >= this.nextStateAt) {
          this.aiState = "walk";
          this.nextStateAt = time + 1200 + Math.random() * 800;
          // randomly turn around half the time
          if (Math.random() < 0.5) this.direction *= -1 as -1 | 1;
        }
        break;
    }
  }

  protected override shouldTurnAtEdge(): boolean {
    return this.aiState !== "charge";
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Shield — slower, two hits to defeat.  Becomes regular slime once shield is
// broken.  For simplicity, "two hits" means two separate trap+pop cycles.
// ────────────────────────────────────────────────────────────────────────────
export class ShieldSlime extends SlimeEnemy {
  private shielded = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "shield", TEX.slimeShield);
    this.hp = ENEMY.shieldHits;
  }

  aiTick(_time: number, _delta: number): void {
    this.body.setVelocityX(ENEMY.shieldSpeed * this.direction);
  }

  override onReleased(field: ContainmentField): void {
    // When the trap times out, drop the shield by 1 hp — communicates wear.
    if (this.shielded && this.hp > 1) {
      this.hp -= 1;
      this.shielded = this.hp > 1;
      if (!this.shielded) {
        this.setTexture(TEX.slimeBasic);
        this.setTint(0x9efc7a);
      }
    }
    super.onReleased(field);
  }
}

/** Factory used by LevelManager. */
export function createSlime(
  scene: Phaser.Scene,
  kind: SlimeKind,
  x: number,
  y: number
): SlimeEnemy {
  switch (kind) {
    case "basic":
      return new BasicSlime(scene, x, y);
    case "bouncer":
      return new BouncerSlime(scene, x, y);
    case "charger":
      return new ChargerSlime(scene, x, y);
    case "shield":
      return new ShieldSlime(scene, x, y);
  }
}
