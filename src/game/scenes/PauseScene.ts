import Phaser from "phaser";
import { COLORS, FONT_FAMILY, GAME_HEIGHT, GAME_WIDTH, SCENES } from "../constants";
import { audio } from "../systems/AudioSystem";
import { addChromeButton, addGlassPanel } from "../ui/SceneChrome";

export class PauseScene extends Phaser.Scene {
  constructor() {
    super(SCENES.Pause);
  }

  create(): void {
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x06061a, 0.78);
    overlay.setInteractive();
    addGlassPanel(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, 420, 270, COLORS.neonCyan, 0.88);

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, "PAUSED", {
      fontFamily: FONT_FAMILY,
      fontStyle: "900",
      fontSize: "48px",
      color: "#6ffcff",
      stroke: "#06061a",
      strokeThickness: 5,
    });
    title.setOrigin(0.5);

    const items: Array<{ label: string; action: () => void }> = [
      { label: "RESUME", action: () => this.close() },
      { label: "QUIT TO MENU", action: () => this.quitToMenu() },
    ];

    items.forEach((it, idx) => {
      const y = GAME_HEIGHT / 2 + idx * 50;
      addChromeButton(this, GAME_WIDTH / 2, y, 240, 40, it.label, COLORS.neonCyan, () => {
        audio.uiClick();
        it.action();
      });
    });

    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, "Press ESC or P to resume", {
      fontFamily: FONT_FAMILY,
      fontSize: "12px",
      color: "#9bb0c8",
    });
    hint.setOrigin(0.5);

    this.input.keyboard?.once("keydown-ESC", () => this.close());
    this.input.keyboard?.once("keydown-P", () => this.close());
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
