import Phaser from "phaser";
import { COLORS, FONT_FAMILY, GAME_HEIGHT, GAME_WIDTH, SCENES } from "../constants";
import { audio } from "../systems/AudioSystem";
import { CrazyGamesAdapter } from "../systems/CrazyGamesAdapter";
import type { SaveSystem } from "../systems/SaveSystem";
import { addChromeButton, addGlassPanel, addSceneBackdrop } from "../ui/SceneChrome";
import { formatScore } from "../utils/math";

export type GameOverData = {
  score: number;
  scrap: number;
  levelReached: number;
};

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENES.GameOver);
  }

  create(data: GameOverData): void {
    audio.stopMusic();
    audio.gameOver();
    CrazyGamesAdapter.gameplayStop();
    CrazyGamesAdapter.requestMidgameAd();

    const save = this.registry.get("save") as SaveSystem | undefined;
    save?.recordRun({ level: data.levelReached, score: data.score, scrap: data.scrap });

    addSceneBackdrop(this, "danger");
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x06061a, 0.55);
    overlay.setInteractive();
    addGlassPanel(this, GAME_WIDTH / 2, 285, 540, 350, COLORS.warning, 0.88);

    const headline = this.add.text(GAME_WIDTH / 2, 130, "CONTAINMENT FAILED", {
      fontFamily: FONT_FAMILY,
      fontStyle: "900",
      fontSize: "44px",
      color: "#ff5577",
      stroke: "#06061a",
      strokeThickness: 5,
    });
    headline.setOrigin(0.5);

    const sub = this.add.text(GAME_WIDTH / 2, 175, "The slime mutants overpowered your repair bot.", {
      fontFamily: FONT_FAMILY,
      fontSize: "14px",
      color: "#9bb0c8",
    });
    sub.setOrigin(0.5);

    const lines = [
      { label: "REACHED LEVEL", value: `${data.levelReached}` },
      { label: "FINAL SCORE", value: formatScore(data.score) },
      { label: "SCRAP COLLECTED", value: `${data.scrap}` },
    ];
    lines.forEach((line, idx) => {
      const y = 240 + idx * 32;
      const lbl = this.add.text(GAME_WIDTH / 2 - 120, y, line.label, {
        fontFamily: FONT_FAMILY,
        fontStyle: "bold",
        fontSize: "14px",
        color: "#6ffcff",
      });
      lbl.setOrigin(0, 0.5);
      const val = this.add.text(GAME_WIDTH / 2 + 120, y, line.value, {
        fontFamily: FONT_FAMILY,
        fontStyle: "900",
        fontSize: "18px",
        color: "#e7f6ff",
      });
      val.setOrigin(1, 0.5);
    });

    this.buildButton(GAME_WIDTH / 2, 390, "RETRY", COLORS.neonGreen, () => {
      this.scene.start(SCENES.Game, { level: 0, freshRun: true });
    });
    this.buildButton(GAME_WIDTH / 2, 440, "MAIN MENU", COLORS.neonCyan, () => {
      this.scene.start(SCENES.MainMenu);
    });
  }

  private buildButton(x: number, y: number, label: string, color: number, cb: () => void): void {
    addChromeButton(this, x, y, 230, 42, label, color, () => {
      audio.uiClick();
      cb();
    });
  }
}
