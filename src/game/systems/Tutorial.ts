import Phaser from "phaser";
import { DEPTH, FONT_FAMILY } from "../constants";
import type { ContainmentField } from "../entities/ContainmentField";
import type { Player } from "../entities/Player";
import { isTouchDevice } from "../ui/TouchControls";

type Step = "move" | "jump" | "shoot" | "pop" | "done";

const LABELS_KEYBOARD: Record<Exclude<Step, "done">, string> = {
  move: "← → MOVE",
  jump: "SPACE TO JUMP",
  shoot: "CLICK / J TO SHOOT",
  pop: "TOUCH OR SHOOT TO POP",
};

const LABELS_TOUCH: Record<Exclude<Step, "done">, string> = {
  move: "DRAG ← LEFT SIDE",
  jump: "TAP JUMP",
  shoot: "TAP POP",
  pop: "TAP THE FIELD",
};

/**
 * Action-anchored Level 1 tutorial.  Watches the player's input, advances
 * through a four-step sequence (move → jump → shoot → pop), and renders one
 * floating prompt that follows the relevant entity.  Each step disappears
 * the instant the player performs the action.
 *
 * Only created for Level 1.  Mobile vs desktop labels are picked once at
 * construction time so prompts feel native to the input the player is using.
 */
export class Tutorial {
  private scene: Phaser.Scene;
  private player: Player;
  private label: Phaser.GameObjects.Text;
  private tween?: Phaser.Tweens.Tween;
  private step: Step = "move";
  private touch: boolean;
  private anchor: { x: number; y: number; offsetY: number } = { x: 0, y: 0, offsetY: -36 };
  private fieldAnchor: ContainmentField | null = null;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.touch = isTouchDevice();

    this.label = scene.add
      .text(player.x, player.y - 36, "", {
        fontFamily: FONT_FAMILY,
        fontStyle: "900",
        fontSize: "14px",
        color: "#ffd166",
        stroke: "#06061a",
        strokeThickness: 4,
      })
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.hud - 1);

    this.showStep("move");
  }

  /** Call from GameScene.update *after* polling input. */
  update(time: number, input: {
    left: boolean;
    right: boolean;
    jumpPressed: boolean;
    shootPressed: boolean;
  }): void {
    if (this.step === "done") return;

    if (this.step === "move" && (input.left || input.right)) {
      this.showStep("jump");
    } else if (this.step === "jump" && input.jumpPressed) {
      this.showStep("shoot");
    } else if (this.step === "shoot" && input.shootPressed) {
      // Don't immediately advance to "done" — wait for the trap so the player
      // sees their first containment, then we promote to "pop".
      this.label.setText("").setVisible(false);
    } else if (this.step === "pop" && this.fieldAnchor && !this.fieldAnchor.active) {
      // The trapped field went away (popped or escaped) — tutorial is over.
      this.finish();
      return;
    }

    // Keep the floating label glued to whatever it's tracking.
    const target = this.fieldAnchor ?? this.player;
    if (target.active) {
      this.label.x = target.x;
      this.label.y = target.y + this.anchor.offsetY;
    }

    // Gentle bob for visibility (uses time so it stays smooth).
    this.label.setScale(1 + Math.sin(time * 0.006) * 0.06);
  }

  /** GameScene calls this on the first successful trap. */
  onFirstTrap(field: ContainmentField): void {
    if (this.step === "done") return;
    this.fieldAnchor = field;
    this.anchor.offsetY = -40;
    this.showStep("pop");
  }

  private showStep(step: Step): void {
    this.step = step;
    if (step === "done") {
      this.finish();
      return;
    }
    const labels = this.touch ? LABELS_TOUCH : LABELS_KEYBOARD;
    this.label.setText(labels[step]);
    this.label.setVisible(true);
    this.label.setAlpha(1);
    this.tween?.stop();
    this.tween = this.scene.tweens.add({
      targets: this.label,
      y: this.label.y - 4,
      yoyo: true,
      repeat: -1,
      duration: 520,
      ease: "Sine.easeInOut",
    });
  }

  private finish(): void {
    this.step = "done";
    this.tween?.stop();
    this.scene.tweens.add({
      targets: this.label,
      alpha: 0,
      duration: 280,
      onComplete: () => this.label.destroy(),
    });
  }

  destroy(): void {
    this.tween?.stop();
    this.label.destroy();
    this.step = "done";
  }
}
