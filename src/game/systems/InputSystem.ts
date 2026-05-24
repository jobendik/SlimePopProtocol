import Phaser from "phaser";

export type ActionState = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jumpPressed: boolean;
  jumpHeld: boolean;
  shootPressed: boolean;
  shootHeld: boolean;
  pausePressed: boolean;
};

/**
 * Maps keyboard, mouse, and gamepad input into a single per-frame action
 * snapshot.  All scenes that need input read from `pollFrame()`.
 */
export class InputSystem {
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private shootKeys: Phaser.Input.Keyboard.Key[];
  private pauseKeys: Phaser.Input.Keyboard.Key[];
  private jumpKeys: Phaser.Input.Keyboard.Key[];
  private pointerDown = false;
  private pointerJustDown = false;
  private gamepadPad: Phaser.Input.Gamepad.Gamepad | null = null;
  private prevJumpHeld = false;
  private prevShootHeld = false;
  private prevPauseHeld = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const kb = scene.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = {
      W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.jumpKeys = [
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.K),
    ];
    this.shootKeys = [
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.X),
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
    ];
    this.pauseKeys = [
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.P),
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    ];

    scene.input.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => {
      if (p.leftButtonDown()) {
        this.pointerDown = true;
        this.pointerJustDown = true;
      }
    });
    scene.input.on(Phaser.Input.Events.POINTER_UP, () => {
      this.pointerDown = false;
    });

    if (scene.input.gamepad) {
      scene.input.gamepad.on("connected", (pad: Phaser.Input.Gamepad.Gamepad) => {
        this.gamepadPad = pad;
      });
      scene.input.gamepad.on("disconnected", () => {
        this.gamepadPad = null;
      });
    }
  }

  pollFrame(): ActionState {
    const cur = this.cursors;
    const w = this.wasd;
    const pad = this.gamepadPad;
    const stickX = pad?.leftStick.x ?? 0;

    const left = !!(cur.left?.isDown) || w.A.isDown || !!(pad?.left) || stickX < -0.3;
    const right = !!(cur.right?.isDown) || w.D.isDown || !!(pad?.right) || stickX > 0.3;
    const up = !!(cur.up?.isDown) || w.W.isDown || !!(pad?.up);
    const down = !!(cur.down?.isDown) || w.S.isDown || !!(pad?.down);

    const jumpHeld =
      this.jumpKeys.some((k) => k.isDown) ||
      cur.up?.isDown === true ||
      w.W.isDown ||
      !!(pad?.A);
    const shootHeld =
      this.shootKeys.some((k) => k.isDown) ||
      this.pointerDown ||
      !!(pad?.X) ||
      !!(pad?.R2);
    // Phaser gamepad doesn't expose a typed "start" — fall back to button index 9.
    const padStart = pad ? !!pad.buttons[9]?.pressed : false;
    const pauseHeld = this.pauseKeys.some((k) => k.isDown) || padStart;

    const jumpPressed = jumpHeld && !this.prevJumpHeld;
    const shootPressed = (shootHeld && !this.prevShootHeld) || this.pointerJustDown;
    const pausePressed = pauseHeld && !this.prevPauseHeld;

    this.prevJumpHeld = jumpHeld;
    this.prevShootHeld = shootHeld;
    this.prevPauseHeld = pauseHeld;
    this.pointerJustDown = false;

    return {
      left: !!left,
      right: !!right,
      up: !!up,
      down: !!down,
      jumpPressed,
      jumpHeld,
      shootPressed,
      shootHeld,
      pausePressed,
    };
  }
}
