import Phaser from "phaser";
import { COLORS, FONT_FAMILY, GAME_HEIGHT, GAME_WIDTH, SCENES } from "../constants";
import { audio } from "../systems/AudioSystem";
import type { SaveSystem } from "../systems/SaveSystem";
import { addGlassPanel, addSceneBackdrop } from "../ui/SceneChrome";

type SliderRow = {
  label: Phaser.GameObjects.Text;
  bar: Phaser.GameObjects.Rectangle;
  fill: Phaser.GameObjects.Rectangle;
  valueLabel: Phaser.GameObjects.Text;
  get: () => number;
  set: (v: number) => void;
};

type ToggleRow = {
  label: Phaser.GameObjects.Text;
  swatch: Phaser.GameObjects.Rectangle;
  valueLabel: Phaser.GameObjects.Text;
  get: () => boolean;
  set: (v: boolean) => void;
};

export class OptionsScene extends Phaser.Scene {
  private save!: SaveSystem;
  private sliders: SliderRow[] = [];
  private toggles: ToggleRow[] = [];

  constructor() {
    super(SCENES.Options);
  }

  create(): void {
    this.save = this.registry.get("save") as SaveSystem;

    addSceneBackdrop(this, "blue");
    addGlassPanel(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 4, 620, 430, COLORS.neonCyan, 0.8);

    const title = this.add.text(GAME_WIDTH / 2, 50, "OPTIONS", {
      fontFamily: FONT_FAMILY,
      fontStyle: "900",
      fontSize: "32px",
      color: "#6ffcff",
      stroke: "#06061a",
      strokeThickness: 4,
    });
    title.setOrigin(0.5);

    const startY = 130;
    let y = startY;

    this.buildSlider(y, "MASTER VOLUME",
      () => this.save.settings.masterVolume,
      (v) => {
        this.save.updateSettings({ masterVolume: v });
        audio.setSettings(this.save.settings);
      });
    y += 60;

    this.buildSlider(y, "SFX VOLUME",
      () => this.save.settings.sfxVolume,
      (v) => {
        this.save.updateSettings({ sfxVolume: v });
        audio.setSettings(this.save.settings);
        audio.uiClick();
      });
    y += 60;

    this.buildSlider(y, "MUSIC VOLUME",
      () => this.save.settings.musicVolume,
      (v) => {
        this.save.updateSettings({ musicVolume: v });
        audio.setSettings(this.save.settings);
      });
    y += 60;

    this.buildToggle(y, "SCREEN SHAKE",
      () => this.save.settings.screenShake,
      (v) => {
        this.save.updateSettings({ screenShake: v });
      });
    y += 50;

    this.buildToggle(y, "PARTICLES",
      () => this.save.settings.particleQuality === "normal",
      (v) => {
        this.save.updateSettings({ particleQuality: v ? "normal" : "low" });
      },
      { onLabel: "NORMAL", offLabel: "LOW" });
    y += 60;

    // Reset save — two-tap confirmation to avoid accidental wipes.
    const RESET_IDLE_LABEL = "RESET SAVE DATA";
    const RESET_CONFIRM_LABEL = "TAP AGAIN TO CONFIRM";
    const CONFIRM_WINDOW_MS = 4000;

    const resetBtn = this.add.rectangle(GAME_WIDTH / 2, y + 10, 260, 36, 0x4a1c2a, 0.85);
    resetBtn.setStrokeStyle(2, COLORS.warning, 1);
    resetBtn.setInteractive({ useHandCursor: true });
    const resetLbl = this.add.text(GAME_WIDTH / 2, y + 10, RESET_IDLE_LABEL, {
      fontFamily: FONT_FAMILY,
      fontStyle: "bold",
      fontSize: "14px",
      color: "#ff5577",
    });
    resetLbl.setOrigin(0.5);

    let confirmArmedUntil = 0;
    let armTimer: Phaser.Time.TimerEvent | undefined;
    const disarm = (): void => {
      confirmArmedUntil = 0;
      resetLbl.setText(RESET_IDLE_LABEL);
      resetBtn.setFillStyle(0x4a1c2a, 0.85);
      armTimer?.remove();
      armTimer = undefined;
    };

    resetBtn.on("pointerdown", () => {
      audio.uiClick();
      const now = this.time.now;
      if (now < confirmArmedUntil) {
        disarm();
        this.save.reset();
        audio.setSettings(this.save.settings);
        this.sliders.forEach((s) => this.drawSlider(s, s.get()));
        this.toggles.forEach((t) => this.drawToggle(t));
        return;
      }
      confirmArmedUntil = now + CONFIRM_WINDOW_MS;
      resetLbl.setText(RESET_CONFIRM_LABEL);
      resetBtn.setFillStyle(0x7a2244, 0.95);
      armTimer?.remove();
      armTimer = this.time.delayedCall(CONFIRM_WINDOW_MS, disarm);
    });

    const hint = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 40,
      "ESC or click outside to return",
      {
        fontFamily: FONT_FAMILY,
        fontSize: "12px",
        color: "#6ffcff",
      }
    );
    hint.setOrigin(0.5);

    this.input.keyboard?.once("keydown-ESC", () => this.scene.start(SCENES.MainMenu));
  }

  private buildSlider(
    y: number,
    label: string,
    get: () => number,
    set: (v: number) => void
  ): void {
    const lbl = this.add.text(GAME_WIDTH / 2 - 220, y, label, {
      fontFamily: FONT_FAMILY,
      fontStyle: "bold",
      fontSize: "14px",
      color: "#e7f6ff",
    });
    lbl.setOrigin(0, 0.5);

    const bar = this.add.rectangle(GAME_WIDTH / 2 + 40, y, 244, 14, 0x10173a, 0.95);
    bar.setStrokeStyle(1, COLORS.neonCyan, 0.6);
    bar.setInteractive({ useHandCursor: true });

    const fill = this.add.rectangle(
      bar.x - 120,
      y,
      240 * get(),
      8,
      COLORS.neonCyan,
      0.92
    );
    fill.setOrigin(0, 0.5);

    const value = this.add.text(GAME_WIDTH / 2 + 188, y, `${Math.round(get() * 100)}`, {
      fontFamily: FONT_FAMILY,
      fontSize: "12px",
      color: "#6ffcff",
    });
    value.setOrigin(0, 0.5);

    const slider: SliderRow = { label: lbl, bar, fill, valueLabel: value, get, set };
    this.sliders.push(slider);

    const handleDrag = (pointer: Phaser.Input.Pointer) => {
      const localX = pointer.x - (bar.x - 120);
      const v = Phaser.Math.Clamp(localX / 240, 0, 1);
      set(v);
      this.drawSlider(slider, v);
    };

    bar.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      handleDrag(pointer);
      bar.on("pointermove", handleDrag);
    });
    this.input.on("pointerup", () => bar.off("pointermove", handleDrag));
  }

  private drawSlider(s: SliderRow, v: number): void {
    s.fill.width = 240 * v;
    s.valueLabel.setText(`${Math.round(v * 100)}`);
  }

  private buildToggle(
    y: number,
    label: string,
    get: () => boolean,
    set: (v: boolean) => void,
    labels: { onLabel?: string; offLabel?: string } = {}
  ): void {
    const lbl = this.add.text(GAME_WIDTH / 2 - 220, y, label, {
      fontFamily: FONT_FAMILY,
      fontStyle: "bold",
      fontSize: "14px",
      color: "#e7f6ff",
    });
    lbl.setOrigin(0, 0.5);

    const swatch = this.add.rectangle(GAME_WIDTH / 2 + 60, y, 132, 30, 0x10173a, 1);
    swatch.setStrokeStyle(2, COLORS.neonCyan, 0.8);
    swatch.setInteractive({ useHandCursor: true });

    const value = this.add.text(GAME_WIDTH / 2 + 60, y, "", {
      fontFamily: FONT_FAMILY,
      fontStyle: "bold",
      fontSize: "14px",
      color: "#6ffcff",
    });
    value.setOrigin(0.5);

    const onLabel = labels.onLabel ?? "ON";
    const offLabel = labels.offLabel ?? "OFF";

    const toggle: ToggleRow = {
      label: lbl,
      swatch,
      valueLabel: value,
      get,
      set: (v: boolean) => {
        set(v);
        value.setText(v ? onLabel : offLabel);
        swatch.setFillStyle(v ? 0x1c4a2a : 0x4a1c2a, 0.85);
        swatch.setStrokeStyle(2, v ? COLORS.neonGreen : COLORS.warning, 0.8);
      },
    };
    this.toggles.push(toggle);
    toggle.set(get());

    swatch.on("pointerdown", () => {
      audio.uiClick();
      toggle.set(!toggle.get());
    });
  }

  private drawToggle(t: ToggleRow): void {
    const v = t.get();
    t.set(v);
  }
}
