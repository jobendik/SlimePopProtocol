import Phaser from "phaser";
import { COLORS, DEPTH, LOGICAL_SCALE, TEX } from "../constants";

/**
 * Level exit.  Spawns dormant; `activate()` opens it once all slimes are
 * cleared.  Calls `onEntered` when the player overlaps it.
 */
export class Portal extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.Body;

  public override active = false;
  private hint?: Phaser.GameObjects.Text;
  private orbitRing?: Phaser.GameObjects.Image;
  private timeBorn: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEX.portal);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    // Body offset is in texture coords (same Phaser quirk as Player/Boss),
    // so scale up the old 8-px offset by 1/LOGICAL_SCALE to stay centred on
    // the supersampled texture.
    this.body.setCircle(32, 8 / LOGICAL_SCALE, 8 / LOGICAL_SCALE);
    this.setDepth(DEPTH.portal);
    this.setAlpha(0.25);
    // Texture baked at TEX_SUPERSAMPLE× density.  The portal animates from
    // dim/small (0.65) to full (1.0) — all multiplied by LOGICAL_SCALE so
    // displayed size stays in world units.
    this.setScale(0.65 * LOGICAL_SCALE);
    this.timeBorn = scene.time.now;
  }

  activate(): void {
    if (this.active) return;
    this.active = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scale: LOGICAL_SCALE,
      duration: 360,
      ease: "Back.easeOut",
    });
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 4000,
      repeat: -1,
      ease: "Linear",
    });

    // Hint text
    this.hint = this.scene.add.text(this.x, this.y - 60, "ENTER", {
      fontFamily: "Segoe UI, sans-serif",
      fontStyle: "bold",
      fontSize: "14px",
      color: "#ffd166",
      stroke: "#06061a",
      strokeThickness: 3,
    });
    this.hint.setOrigin(0.5);
    this.hint.setDepth(DEPTH.portal);
    this.scene.tweens.add({
      targets: this.hint,
      y: this.y - 70,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Decorative orbit ring
    this.orbitRing = this.scene.add.image(this.x, this.y, TEX.shockwave);
    this.orbitRing.setTint(COLORS.portalSecondary);
    this.orbitRing.setAlpha(0.4);
    this.orbitRing.setScale(2.6 * LOGICAL_SCALE);
    this.orbitRing.setDepth(DEPTH.portal - 1);
    this.orbitRing.setBlendMode(Phaser.BlendModes.ADD);
    this.scene.tweens.add({
      targets: this.orbitRing,
      angle: -360,
      duration: 6000,
      repeat: -1,
      ease: "Linear",
    });
  }

  override update(time: number): void {
    if (!this.active) {
      // Idle dim flicker so the player can see where the portal *will* appear
      this.setAlpha(0.18 + Math.sin((time - this.timeBorn) * 0.005) * 0.06);
    }
  }

  destroyAll(): void {
    this.hint?.destroy();
    this.orbitRing?.destroy();
    this.destroy();
  }
}
