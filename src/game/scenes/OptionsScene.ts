import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, SCENES } from "../constants";
import { audio } from "../systems/AudioSystem";
import type { SaveSystem } from "../systems/SaveSystem";
import {
  addChromeButton,
  addCssHint,
  addCssSlider,
  addCssToggle,
  addGlassPanel,
  addSceneBackdrop,
  addSceneTitle,
  type ChromeSlider,
  type ChromeToggle,
} from "../ui/SceneChrome";

export class OptionsScene extends Phaser.Scene {
  private save!: SaveSystem;
  private sliders: ChromeSlider[] = [];
  private toggles: ChromeToggle[] = [];

  constructor() {
    super(SCENES.Options);
  }

  create(): void {
    this.save = this.registry.get("save") as SaveSystem;

    addSceneBackdrop(this, "blue");
    addGlassPanel(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 4, 620, 440, "#6ffcff");
    addSceneTitle(this, GAME_WIDTH / 2, 60, "OPTIONS");

    const startY = 150;
    let y = startY;

    this.sliders.push(addCssSlider(this, GAME_WIDTH / 2, y, 440, "MASTER VOLUME",
      () => this.save.settings.masterVolume,
      (v) => {
        this.save.updateSettings({ masterVolume: v });
        audio.setSettings(this.save.settings);
      }));
    y += 50;

    this.sliders.push(addCssSlider(this, GAME_WIDTH / 2, y, 440, "SFX VOLUME",
      () => this.save.settings.sfxVolume,
      (v) => {
        this.save.updateSettings({ sfxVolume: v });
        audio.setSettings(this.save.settings);
        audio.uiClick();
      }));
    y += 50;

    this.sliders.push(addCssSlider(this, GAME_WIDTH / 2, y, 440, "MUSIC VOLUME",
      () => this.save.settings.musicVolume,
      (v) => {
        this.save.updateSettings({ musicVolume: v });
        audio.setSettings(this.save.settings);
      }));
    y += 60;

    this.toggles.push(addCssToggle(this, GAME_WIDTH / 2, y, 440, "SCREEN SHAKE",
      () => this.save.settings.screenShake,
      (v) => this.save.updateSettings({ screenShake: v })));
    y += 50;

    this.toggles.push(addCssToggle(this, GAME_WIDTH / 2, y, 440, "PARTICLES",
      () => this.save.settings.particleQuality === "normal",
      (v) => this.save.updateSettings({ particleQuality: v ? "normal" : "low" }),
      { onLabel: "NORMAL", offLabel: "LOW" }));
    y += 70;

    // Reset save — two-tap confirmation to avoid accidental wipes.
    const RESET_IDLE = "RESET SAVE DATA";
    const RESET_CONFIRM = "TAP AGAIN TO CONFIRM";
    const CONFIRM_WINDOW_MS = 4000;

    let confirmArmedUntil = 0;
    let armTimer: Phaser.Time.TimerEvent | undefined;
    const resetBtn = addChromeButton(this, GAME_WIDTH / 2, y, 280, 40, RESET_IDLE, "#ff5577", () => {
      audio.uiClick();
      const now = this.time.now;
      if (now < confirmArmedUntil) {
        // confirmed
        confirmArmedUntil = 0;
        resetBtn.setLabel(RESET_IDLE);
        armTimer?.remove();
        armTimer = undefined;
        this.save.reset();
        audio.setSettings(this.save.settings);
        this.sliders.forEach((s) => s.refresh());
        this.toggles.forEach((t) => t.refresh());
        return;
      }
      confirmArmedUntil = now + CONFIRM_WINDOW_MS;
      resetBtn.setLabel(RESET_CONFIRM);
      armTimer?.remove();
      armTimer = this.time.delayedCall(CONFIRM_WINDOW_MS, () => {
        confirmArmedUntil = 0;
        resetBtn.setLabel(RESET_IDLE);
        armTimer = undefined;
      });
    }, "danger");

    addCssHint(this, GAME_WIDTH / 2, GAME_HEIGHT - 38, "ESC to return");

    this.input.keyboard?.once("keydown-ESC", () => this.scene.start(SCENES.MainMenu));
  }
}
