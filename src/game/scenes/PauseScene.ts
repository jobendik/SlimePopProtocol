import Phaser from "phaser";
import { DEPTH, GAME_HEIGHT, GAME_WIDTH, SCENES } from "../constants";
import { audio } from "../systems/AudioSystem";
import { CssVisual } from "../systems/CssVisual";
import {
  addChromeButton,
  addCssHint,
  addGlassPanel,
  addSceneTitle,
  type ChromeButton,
} from "../ui/SceneChrome";

export class PauseScene extends Phaser.Scene {
  private buttons: ChromeButton[] = [];
  private selectedIndex = 0;
  private items: Array<{ label: string; action: () => void }> = [];

  constructor() {
    super(SCENES.Pause);
  }

  create(): void {
    // Dim overlay — a full-bleed CssVisual that swallows pointer events
    // so clicks fall onto buttons only, not the paused game underneath.
    const overlay = new CssVisual(this, "cv-pause-dim", {
      depth: DEPTH.hud - 2,
      pixelWidth: GAME_WIDTH,
      pixelHeight: GAME_HEIGHT,
    });
    overlay.node.style.background = "rgba(6, 6, 26, 0.78)";
    overlay.node.style.pointerEvents = "auto";
    overlay.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    addGlassPanel(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, 420, 280, "#6ffcff");
    addSceneTitle(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 78, "PAUSED");

    this.items = [
      { label: "RESUME", action: () => this.close() },
      { label: "QUIT TO MENU", action: () => this.quitToMenu() },
    ];

    this.items.forEach((it, idx) => {
      const y = GAME_HEIGHT / 2 + 10 + idx * 60;
      const btn = addChromeButton(this, GAME_WIDTH / 2, y, 260, 46, it.label, "#6ffcff", () => {
        audio.uiClick();
        it.action();
      });
      btn.visual.node.addEventListener("pointerenter", () => this.select(idx));
      this.buttons.push(btn);
    });
    this.select(0);

    addCssHint(this, GAME_WIDTH / 2, GAME_HEIGHT - 38, "Press ESC or P to resume");

    this.input.keyboard?.once("keydown-ESC", () => this.close());
    this.input.keyboard?.once("keydown-P", () => this.close());
    this.input.keyboard?.on("keydown-DOWN", () => this.select((this.selectedIndex + 1) % this.items.length));
    this.input.keyboard?.on("keydown-UP",   () => this.select((this.selectedIndex - 1 + this.items.length) % this.items.length));
    const confirm = () => {
      audio.uiClick();
      this.items[this.selectedIndex].action();
    };
    this.input.keyboard?.on("keydown-ENTER", confirm);
    this.input.keyboard?.on("keydown-SPACE", confirm);
  }

  private select(i: number): void {
    this.selectedIndex = i;
    this.buttons.forEach((btn, idx) => btn.setSelected(idx === i));
  }

  private close(): void {
    this.scene.resume(SCENES.Game);
    this.scene.stop();
  }

  private quitToMenu(): void {
    this.scene.stop(SCENES.Game);
    this.scene.stop(SCENES.Hud);
    this.scene.stop();
    this.scene.start(SCENES.MainMenu);
  }
}
