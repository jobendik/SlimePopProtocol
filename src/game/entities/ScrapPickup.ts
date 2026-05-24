import Phaser from "phaser";
import { DEPTH, LOGICAL_SCALE, TEX } from "../constants";

/**
 * Tiny scrap (yellow) or battery (cyan) collectible.  Hops once on spawn,
 * then drifts/attracts to the player if the Magnet upgrade is active.
 */
export class ScrapPickup extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.Body;

  public scrapValue: number;
  public magnetic = false;
  private bornAt: number;
  private targetX = 0;
  private targetY = 0;
  private targetSet = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    kind: "scrap" | "battery",
    value = 1
  ) {
    super(scene, x, y, kind === "battery" ? TEX.battery : TEX.scrap);
    this.scrapValue = value;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    // Texture baked at TEX_SUPERSAMPLE× density.
    this.setScale(LOGICAL_SCALE);
    this.body.setCircle(7, 0, 0);
    this.body.setBounce(0.5);
    this.body.setDragX(120);
    this.body.setVelocity(
      Phaser.Math.Between(-90, 90),
      Phaser.Math.Between(-220, -140)
    );
    this.setDepth(DEPTH.pickup);
    this.bornAt = scene.time.now;
  }

  setMagnetTarget(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
    this.targetSet = true;
    this.magnetic = true;
  }

  override update(time: number, _delta: number, playerX?: number, playerY?: number): void {
    // Bobbing visual
    this.setRotation(Math.sin((time + this.bornAt) * 0.006) * 0.4);

    if (this.magnetic && playerX !== undefined && playerY !== undefined) {
      const dx = playerX - this.x;
      const dy = playerY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        const pull = 380;
        this.body.setVelocity((dx / dist) * pull, (dy / dist) * pull);
        this.body.setAllowGravity(false);
      }
    } else if (this.targetSet) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        const pull = 220;
        this.body.setVelocity((dx / dist) * pull, (dy / dist) * pull);
        this.body.setAllowGravity(false);
      }
    }
  }
}
