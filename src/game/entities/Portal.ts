import Phaser from "phaser";
import { DEPTH, LOGICAL_SCALE, TEX } from "../constants";
import { CssVisual } from "../systems/CssVisual";

/**
 * Level exit.  Spawns dormant; `activate()` opens it once all slimes are
 * cleared.  Calls `onEntered` when the player overlaps it.
 */
export class Portal extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.Body;

  public override active = false;
  private timeBorn: number;
  private visual: CssVisual;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEX.portal);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTH.portal);
    this.setAlpha(0.25);
    // Texture baked at TEX_SUPERSAMPLE× density.  The portal animates from
    // dim/small (0.65) to full (1.0) — all multiplied by LOGICAL_SCALE so
    // displayed size stays in world units.
    this.setScale(0.65 * LOGICAL_SCALE);
    const bodyRadius = 32 / LOGICAL_SCALE;
    const bodyOffset = (this.width - bodyRadius * 2) / 2;
    this.body.setCircle(bodyRadius, bodyOffset, bodyOffset);
    this.body.updateFromGameObject();
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.timeBorn = scene.time.now;

    // CSS-rendered portal — the sprite stays in place for physics overlap.
    this.setVisible(false);
    this.visual = new CssVisual(scene, "cv-portal", { depth: DEPTH.portal });
    this.visual.setHtml(`
      <div class="portal-ring"></div>
      <div class="portal-vortex"></div>
      <div class="portal-core"></div>
      <div class="portal-hint">ENTER</div>
    `);
    this.visual.setPosition(x, y);
  }

  activate(): void {
    if (this.active) return;
    this.active = true;
    this.visual.setState("active", 1);
    this.setScale(LOGICAL_SCALE);
    this.body.updateFromGameObject();
  }

  override update(time: number): void {
    // Keep the CSS visual pinned to our world position.
    this.visual.setPosition(this.x, this.y);
    if (!this.active) {
      // Idle dim flicker so the player can see where the portal *will* appear
      const a = 0.18 + Math.sin((time - this.timeBorn) * 0.005) * 0.06;
      this.visual.dom.setAlpha(a);
    }
  }

  destroyAll(): void {
    this.visual.destroy();
    this.destroy();
  }
}
