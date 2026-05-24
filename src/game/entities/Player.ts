import Phaser from "phaser";
import { COLORS, DEPTH, LOGICAL_SCALE, PLAYER, TEX } from "../constants";
import type { ActionState } from "../systems/InputSystem";
import type { RunModifiers } from "../systems/UpgradeSystem";

/**
 * Repair-bot avatar.  Handles physics, coyote/jump-buffer feel, facing, and
 * the visual squash/stretch + thruster flicker.  Emits "shoot" so GameScene
 * stays in charge of containment-field creation.
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  public hearts: number = PLAYER.maxHearts;
  public facing: 1 | -1 = 1;
  public invulnerableUntil = 0;
  public shieldCharges = 0;
  public alive = true;

  private lastGroundedAt = 0;
  private jumpBufferUntil = 0;
  private cooldownUntil = 0;
  private jumpsRemaining = 1;
  private modifiers: RunModifiers;
  private thruster?: Phaser.GameObjects.Image;
  private hitFlashTimer?: Phaser.Time.TimerEvent;
  private isJumpHeld = false;

  constructor(scene: Phaser.Scene, x: number, y: number, modifiers: RunModifiers) {
    super(scene, x, y, TEX.player);
    this.modifiers = modifiers;
    this.shieldCharges = modifiers.shieldCharges;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTH.player);
    this.setOrigin(0.5, 0.5);
    // Textures are baked at TEX_SUPERSAMPLE× pixel density — scale down here
    // so world coords, body sizes and level data stay in logical pixels.
    this.setScale(LOGICAL_SCALE);
    const bodyWidth = PLAYER.width / LOGICAL_SCALE;
    const bodyHeight = PLAYER.height / LOGICAL_SCALE;
    this.setSize(bodyWidth, bodyHeight);
    // Arcade bodies are sized in source pixels and then multiplied by scale.
    // Keep the collision box 22x28 in world pixels, centered horizontally and
    // bottom-aligned so the visual feet sit on the platform top.
    this.setOffset(
      (this.width - bodyWidth) / 2,
      this.height - bodyHeight
    );
    this.setCollideWorldBounds(true);
    this.body.setMaxVelocity(380, PLAYER.maxFallSpeed);
    this.body.setDragX(PLAYER.drag);
    this.body.allowGravity = true;
    this.setGravityY(0); // arcade-physics global gravity already configured
  }

  setModifiers(modifiers: RunModifiers): void {
    this.modifiers = modifiers;
    this.shieldCharges = modifiers.shieldCharges;
  }

  override update(time: number, _delta: number, input: ActionState): { wantShoot: boolean } {
    if (!this.alive) return { wantShoot: false };

    const speed = this.modifiers.moveSpeed;
    const onGround = this.body.blocked.down || this.body.touching.down;
    if (onGround) {
      this.lastGroundedAt = time;
      this.jumpsRemaining = this.modifiers.doubleJump ? 1 : 0;
    }

    // Horizontal movement
    if (input.left && !input.right) {
      this.setAccelerationX(-PLAYER.accel);
      this.body.setMaxVelocityX(speed);
      this.facing = -1;
      this.setFlipX(true);
    } else if (input.right && !input.left) {
      this.setAccelerationX(PLAYER.accel);
      this.body.setMaxVelocityX(speed);
      this.facing = 1;
      this.setFlipX(false);
    } else {
      this.setAccelerationX(0);
    }

    // Drag scaling — feel snappier on ground than in air
    this.body.setDragX(onGround ? PLAYER.drag : PLAYER.airDrag);

    // Jump buffering
    if (input.jumpPressed) {
      this.jumpBufferUntil = time + PLAYER.jumpBufferMs;
    }

    const canCoyote = time - this.lastGroundedAt <= PLAYER.coyoteMs;
    const wantsJump = time <= this.jumpBufferUntil;
    if (wantsJump) {
      if (onGround || canCoyote) {
        this.performJump();
      } else if (this.jumpsRemaining > 0) {
        this.performJump();
        this.jumpsRemaining -= 1;
        this.scene.events.emit("player:doubleJump", this.x, this.y);
      }
    }

    // Variable jump height — if the player releases jump early, cut velocity
    if (!input.jumpHeld && this.isJumpHeld && this.body.velocity.y < 0) {
      this.setVelocityY(this.body.velocity.y * PLAYER.variableJumpCutMultiplier);
    }
    this.isJumpHeld = input.jumpHeld;

    // Squash/stretch — multiply by LOGICAL_SCALE so the supersample texture
    // doesn't snap back to 1× during the animation.
    if (!onGround) {
      const v = Phaser.Math.Clamp(this.body.velocity.y / 600, -1, 1);
      this.setScale((1 - v * 0.12) * LOGICAL_SCALE, (1 + v * 0.12) * LOGICAL_SCALE);
    } else {
      this.setScale(
        Phaser.Math.Linear(this.scaleX, LOGICAL_SCALE, 0.2),
        Phaser.Math.Linear(this.scaleY, LOGICAL_SCALE, 0.2)
      );
    }

    // Invulnerability flicker
    if (time < this.invulnerableUntil) {
      this.setAlpha(0.4 + 0.6 * Math.abs(Math.sin(time * 0.04)));
    } else {
      this.setAlpha(1);
    }

    // Shoot input
    let wantShoot = false;
    if (input.shootHeld && time >= this.cooldownUntil) {
      wantShoot = true;
      this.cooldownUntil = time + this.modifiers.fireCooldownMs;
      this.setTexture(TEX.playerShoot);
      this.hitFlashTimer?.remove();
      this.hitFlashTimer = this.scene.time.delayedCall(80, () => {
        if (this.active) this.setTexture(TEX.player);
      });
    }

    // Thruster glow while falling fast or moving fast
    this.updateThruster(onGround);

    return { wantShoot };
  }

  private performJump(): void {
    this.setVelocityY(PLAYER.jumpVelocity);
    this.jumpBufferUntil = 0;
    this.lastGroundedAt = -9999;
    this.scene.events.emit("player:jump", this.x, this.y);
  }

  private updateThruster(onGround: boolean): void {
    const shouldShow = !onGround && this.body.velocity.y < -10;
    if (shouldShow) {
      if (!this.thruster) {
        this.thruster = this.scene.add.image(this.x, this.y + 10, TEX.particle);
        this.thruster.setTint(COLORS.neonCyan);
        this.thruster.setDepth(DEPTH.player - 1);
        this.thruster.setBlendMode(Phaser.BlendModes.ADD);
      }
      this.thruster.setVisible(true);
      this.thruster.x = this.x;
      this.thruster.y = this.y + 14;
      // Particle texture baked at TEX_SUPERSAMPLE× density.
      this.thruster.setScale(
        (0.6 + Math.random() * 0.4) * LOGICAL_SCALE,
        (1.0 + Math.random() * 0.5) * LOGICAL_SCALE
      );
      this.thruster.setAlpha(0.7 + Math.random() * 0.3);
    } else if (this.thruster) {
      this.thruster.setVisible(false);
    }
  }

  takeHit(time: number): { died: boolean; absorbed: boolean } {
    if (time < this.invulnerableUntil || !this.alive) {
      return { died: false, absorbed: false };
    }
    if (this.shieldCharges > 0) {
      this.shieldCharges -= 1;
      this.invulnerableUntil = time + PLAYER.invulnerabilityMs;
      return { died: false, absorbed: true };
    }
    this.hearts -= 1;
    this.invulnerableUntil = time + PLAYER.invulnerabilityMs;
    this.setVelocityY(-260);
    this.setVelocityX(-this.facing * PLAYER.knockback);
    if (this.hearts <= 0) {
      this.alive = false;
      return { died: true, absorbed: false };
    }
    return { died: false, absorbed: false };
  }

  destroyAll(): void {
    this.thruster?.destroy();
    this.destroy();
  }
}
