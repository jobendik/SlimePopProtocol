import Phaser from "phaser";
import { COLORS, DEPTH, FIELD, GAME_HEIGHT, LOGICAL_SCALE, TEX } from "../constants";
import type { SlimeEnemy } from "./SlimeEnemy";

/**
 * A flying / floating containment sphere.  Three lifecycle states:
 *   1. "flying"  — fired from the player, travels in a direction until it
 *                  expires or touches a slime.
 *   2. "trapped" — has captured a slime; both float upward, the player can
 *                  pop them on contact / shot / chain-reaction.
 *   3. "popping" — being destroyed (one frame, used to gate physics).
 */
export class ContainmentField extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.Body;

  public override state: "flying" | "trapped" | "popping" = "flying";
  public trapped: SlimeEnemy | null = null;
  public expiresAt = 0;
  public trapExpiresAt = 0;
  public spawnedAt = 0;
  public piercesLeft = 0;
  public radius: number;


  private timeBornForFlight: number;
  private pulsePhase = 0;
  private flightVelocityX = 0;
  private flightVelocityY = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number, pierce: boolean) {
    super(scene, x, y, TEX.field);
    this.radius = radius;
    this.piercesLeft = pierce ? 1 : 0;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTH.field);
    // Circle bodies use source pixels; this keeps body radius equal to the
    // requested world radius after the supersampled texture is scaled down.
    const fieldScale = (radius / 24) * LOGICAL_SCALE;
    this.setScale(fieldScale);
    this.body.setCircle(radius / fieldScale, 0, 0);
    this.body.updateFromGameObject();
    this.body.setAllowGravity(false);
    this.body.setBounce(FIELD.bounceDamping);
    this.body.moves = false;
    this.keepAboveFloor();
    this.syncBodyToVisual();
    this.timeBornForFlight = scene.time.now;
    this.spawnedAt = this.timeBornForFlight;
    this.expiresAt = this.timeBornForFlight + FIELD.emptyLifetimeMs;
  }

  launch(vx: number, vy: number): void {
    this.flightVelocityX = vx;
    this.flightVelocityY = vy;
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.body.moves = false;
  }

  /** Capture a slime — switches to "trapped" state. */
  capture(slime: SlimeEnemy, time: number, trapDurationMs: number): void {
    if (this.state !== "flying") return;
    this.state = "trapped";
    this.trapped = slime;
    this.trapExpiresAt = time + trapDurationMs;
    this.setTexture(TEX.fieldTrapped);
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    slime.onTrapped(this);
  }

  /** Returns true if the field is allowed to be popped right now. */
  isPoppable(): boolean {
    return this.state !== "popping";
  }

  override update(time: number, delta: number): void {
    if (this.state === "popping") return;

    // wobble pulse — baseScale folds in LOGICAL_SCALE so the supersample
    // texture displays at world-radius dimensions.
    this.pulsePhase += 0.12;
    const pulse = 1 + Math.sin(this.pulsePhase) * 0.06;
    const baseScale = (this.radius / 24) * LOGICAL_SCALE;
    this.setScale(baseScale * pulse, baseScale * (2 - pulse));

    if (this.state === "flying") {
      const ageRatio = Phaser.Math.Clamp(
        (time - this.timeBornForFlight) / FIELD.emptyLifetimeMs,
        0,
        1
      );
      const currentVelocityY = Phaser.Math.Linear(this.flightVelocityY, -FIELD.floatSpeed, ageRatio);
      const dt = delta / 1000;
      this.x += this.flightVelocityX * dt;
      this.y += currentVelocityY * dt;
      this.keepAboveFloor();
      this.syncBodyToVisual();

      if (time >= this.expiresAt) {
        this.fizzle();
        return;
      }
      // mild colour shift as it ages
      if (ageRatio > 0.66) {
        this.setTint(0xfff7a0);
      } else {
        this.clearTint();
      }
    }

    if (this.state === "trapped" && this.trapped) {
      this.y -= FIELD.floatSpeed * (delta / 1000);
      this.syncBodyToVisual();

      // Slime follows the field, with small wobble
      const slime = this.trapped;
      slime.x = this.x;
      slime.y = this.y;
      slime.body.setVelocity(0, 0);
      slime.body.setAllowGravity(false);
      slime.setRotation(Math.sin(this.pulsePhase) * 0.2);

      // Warning flicker before escape
      const remaining = this.trapExpiresAt - time;
      if (remaining < FIELD.trapWarningMs) {
        const flick = Math.floor(time / 80) % 2 === 0;
        this.setAlpha(flick ? 1 : 0.55);
      } else {
        this.setAlpha(1);
      }

      if (time >= this.trapExpiresAt) {
        this.releaseTrapped();
      }
    }
  }

  private keepAboveFloor(): void {
    this.y = Math.min(this.y, GAME_HEIGHT - 32 - this.radius - 1);
  }

  private syncBodyToVisual(): void {
    this.body.reset(this.x, this.y);
    this.body.setAllowGravity(false);
    this.body.setVelocity(0, 0);
    this.body.moves = false;
  }

  /** Pop logic — caller (GameScene) handles score, chain, FX. */
  markPopping(): void {
    this.state = "popping";
    if (this.body) this.body.enable = false;
  }

  /** Used when the timer expires; slime gets freed and the field disappears. */
  releaseTrapped(): SlimeEnemy | null {
    const released = this.trapped;
    if (released) {
      released.onReleased(this);
    }
    this.trapped = null;
    this.markPopping();
    // Fade out the now-empty containment sphere — defer to after the current
    // update tick so we don't mutate the iteration in GameScene.
    this.scene.time.delayedCall(0, () => {
      if (this.active) this.destroyWithFade();
    });
    return released;
  }

  private fizzle(): void {
    // Mark first — the GameScene handler may destroy this field synchronously.
    this.markPopping();
    this.scene.events.emit("field:fizzle", this);
  }

  /** Helper used by upgrades/pierce logic. */
  consumePierce(): boolean {
    if (this.piercesLeft > 0) {
      this.piercesLeft -= 1;
      return true;
    }
    return false;
  }

  /** Custom destroy — emit a tiny visual fade. */
  destroyWithFade(): void {
    if (!this.scene) {
      this.destroy();
      return;
    }
    const x = this.x;
    const y = this.y;
    const ghost = this.scene.add.image(x, y, this.texture.key);
    ghost.setDepth(DEPTH.field);
    ghost.setScale(this.scaleX, this.scaleY);
    ghost.setTint(COLORS.fieldRim);
    ghost.setAlpha(0.5);
    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scale: this.scaleX * 1.4,
      duration: 180,
      onComplete: () => ghost.destroy(),
    });
    this.destroy();
  }
}
