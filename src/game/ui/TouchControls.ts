import Phaser from "phaser";
import { COLORS, DEPTH, GAME_HEIGHT, GAME_WIDTH } from "../constants";

/**
 * Shared mutable input state written by TouchControls and read by InputSystem.
 * Plain object rather than Phaser events so InputSystem can poll it once per
 * frame without subscribing.
 *
 * `enabled` is set to true while a TouchControls instance is alive and false
 * when it tears down — InputSystem uses this to decide whether to also suppress
 * desktop-only mouse-click-as-shoot.
 */
export type TouchInputState = {
  enabled: boolean;
  axisX: number;
  axisY: number;
  jumpHeld: boolean;
  shootHeld: boolean;
};

export const touchInputState: TouchInputState = {
  enabled: false,
  axisX: 0,
  axisY: 0,
  jumpHeld: false,
  shootHeld: false,
};

export function isTouchDevice(): boolean {
  return "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0;
}

const JOYSTICK_RADIUS = 56;
const KNOB_RADIUS = 24;
const DEADZONE = 0.18;
const BUTTON_RADIUS = 46;

/**
 * Floating-joystick + two action buttons. Joystick base appears at the touch
 * point the first time the player taps the left half of the screen — more
 * forgiving than a fixed-position stick across phone form factors. Buttons are
 * pinned to the right side.
 *
 * Pointer ids are tracked separately so the player can move the stick with one
 * thumb while holding jump/shoot with the other.
 */
export class TouchControls {
  private scene: Phaser.Scene;
  private joystickBase: Phaser.GameObjects.Arc;
  private joystickKnob: Phaser.GameObjects.Arc;
  private jumpBtn: Phaser.GameObjects.Arc;
  private jumpLabel: Phaser.GameObjects.Text;
  private shootBtn: Phaser.GameObjects.Arc;
  private shootLabel: Phaser.GameObjects.Text;

  private joystickPointerId = -1;
  private joystickOriginX = 0;
  private joystickOriginY = 0;
  private jumpPointerId = -1;
  private shootPointerId = -1;

  private onPointerDown: (p: Phaser.Input.Pointer) => void;
  private onPointerMove: (p: Phaser.Input.Pointer) => void;
  private onPointerUp: (p: Phaser.Input.Pointer) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    touchInputState.enabled = true;
    touchInputState.axisX = 0;
    touchInputState.axisY = 0;
    touchInputState.jumpHeld = false;
    touchInputState.shootHeld = false;

    this.joystickBase = scene.add.circle(-200, -200, JOYSTICK_RADIUS, 0x06061a, 0.35);
    this.joystickBase.setStrokeStyle(2, COLORS.neonCyan, 0.55);
    this.joystickBase.setDepth(DEPTH.hud);
    this.joystickBase.setScrollFactor(0);
    this.joystickBase.setVisible(false);

    this.joystickKnob = scene.add.circle(-200, -200, KNOB_RADIUS, COLORS.neonCyan, 0.55);
    this.joystickKnob.setStrokeStyle(2, 0xffffff, 0.7);
    this.joystickKnob.setDepth(DEPTH.hud + 1);
    this.joystickKnob.setScrollFactor(0);
    this.joystickKnob.setVisible(false);

    const shootX = GAME_WIDTH - 78;
    const shootY = GAME_HEIGHT - 178;
    this.shootBtn = scene.add.circle(shootX, shootY, BUTTON_RADIUS, COLORS.neonPink, 0.28);
    this.shootBtn.setStrokeStyle(3, COLORS.neonPink, 0.7);
    this.shootBtn.setDepth(DEPTH.hud);
    this.shootBtn.setScrollFactor(0);
    this.shootBtn.setInteractive(
      new Phaser.Geom.Circle(0, 0, BUTTON_RADIUS),
      Phaser.Geom.Circle.Contains
    );
    this.shootLabel = scene.add
      .text(shootX, shootY, "POP", {
        fontFamily: "system-ui, sans-serif",
        fontStyle: "900",
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.hud + 1)
      .setScrollFactor(0);

    const jumpX = GAME_WIDTH - 78;
    const jumpY = GAME_HEIGHT - 68;
    this.jumpBtn = scene.add.circle(jumpX, jumpY, BUTTON_RADIUS, COLORS.neonGreen, 0.28);
    this.jumpBtn.setStrokeStyle(3, COLORS.neonGreen, 0.7);
    this.jumpBtn.setDepth(DEPTH.hud);
    this.jumpBtn.setScrollFactor(0);
    this.jumpBtn.setInteractive(
      new Phaser.Geom.Circle(0, 0, BUTTON_RADIUS),
      Phaser.Geom.Circle.Contains
    );
    this.jumpLabel = scene.add
      .text(jumpX, jumpY, "JUMP", {
        fontFamily: "system-ui, sans-serif",
        fontStyle: "900",
        fontSize: "14px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.hud + 1)
      .setScrollFactor(0);

    this.shootBtn.on("pointerdown", (p: Phaser.Input.Pointer) => {
      this.shootPointerId = p.id;
      touchInputState.shootHeld = true;
      this.shootBtn.setFillStyle(COLORS.neonPink, 0.55);
    });
    this.jumpBtn.on("pointerdown", (p: Phaser.Input.Pointer) => {
      this.jumpPointerId = p.id;
      touchInputState.jumpHeld = true;
      this.jumpBtn.setFillStyle(COLORS.neonGreen, 0.55);
    });

    this.onPointerDown = (p) => this.handlePointerDown(p);
    this.onPointerMove = (p) => this.handlePointerMove(p);
    this.onPointerUp = (p) => this.handlePointerUp(p);

    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown);
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove);
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp);
    scene.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.onPointerUp);
  }

  private handlePointerDown(p: Phaser.Input.Pointer): void {
    if (this.joystickPointerId !== -1) return;
    // Joystick area = left half, with a small gap at the very edge so HUD taps
    // (e.g. eventual pause button) stay accessible.
    if (p.x > GAME_WIDTH / 2) return;
    // The button interactive handlers fire first for pointer-down events that
    // land on them, but if the user grazes the joystick area near a button we
    // still want this to win — buttons are right-half only, so checking the
    // left half is enough.
    this.joystickPointerId = p.id;
    this.joystickOriginX = p.x;
    this.joystickOriginY = p.y;
    this.joystickBase.x = p.x;
    this.joystickBase.y = p.y;
    this.joystickKnob.x = p.x;
    this.joystickKnob.y = p.y;
    this.joystickBase.setVisible(true);
    this.joystickKnob.setVisible(true);
  }

  private handlePointerMove(p: Phaser.Input.Pointer): void {
    if (p.id !== this.joystickPointerId) return;
    const dx = p.x - this.joystickOriginX;
    const dy = p.y - this.joystickOriginY;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(dist, JOYSTICK_RADIUS);
    const angle = Math.atan2(dy, dx);
    this.joystickKnob.x = this.joystickOriginX + Math.cos(angle) * clamped;
    this.joystickKnob.y = this.joystickOriginY + Math.sin(angle) * clamped;
    const magnitude = clamped / JOYSTICK_RADIUS;
    const effective = magnitude < DEADZONE ? 0 : magnitude;
    touchInputState.axisX = effective * Math.cos(angle);
    touchInputState.axisY = effective * Math.sin(angle);
  }

  private handlePointerUp(p: Phaser.Input.Pointer): void {
    if (p.id === this.joystickPointerId) {
      this.joystickPointerId = -1;
      this.joystickBase.setVisible(false);
      this.joystickKnob.setVisible(false);
      touchInputState.axisX = 0;
      touchInputState.axisY = 0;
    }
    if (p.id === this.shootPointerId) {
      this.shootPointerId = -1;
      touchInputState.shootHeld = false;
      this.shootBtn.setFillStyle(COLORS.neonPink, 0.28);
    }
    if (p.id === this.jumpPointerId) {
      this.jumpPointerId = -1;
      touchInputState.jumpHeld = false;
      this.jumpBtn.setFillStyle(COLORS.neonGreen, 0.28);
    }
  }

  destroy(): void {
    touchInputState.enabled = false;
    touchInputState.axisX = 0;
    touchInputState.axisY = 0;
    touchInputState.jumpHeld = false;
    touchInputState.shootHeld = false;

    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown);
    this.scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.onPointerUp);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.onPointerUp);

    this.joystickBase.destroy();
    this.joystickKnob.destroy();
    this.jumpBtn.destroy();
    this.jumpLabel.destroy();
    this.shootBtn.destroy();
    this.shootLabel.destroy();
  }
}
