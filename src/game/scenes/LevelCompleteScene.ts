import Phaser from "phaser";
import { COLORS, FONT_FAMILY, GAME_HEIGHT, GAME_WIDTH, SCENES } from "../constants";
import { audio } from "../systems/AudioSystem";
import { formatScore } from "../utils/math";

export type LevelCompleteData = {
  levelNumber: number;
  totalLevels: number;
  score: number;
  scrap: number;
  bestCombo: number;
  onContinue: () => void;
};

export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super(SCENES.LevelComplete);
  }

  create(data: LevelCompleteData): void {
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x06061a, 0.85);
    overlay.setInteractive();

    const card = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 520, 320, 0x121542, 0.95);
    card.setStrokeStyle(2, COLORS.neonCyan, 1);

    const headline = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 110, `LEVEL ${data.levelNumber} CLEAR`, {
      fontFamily: FONT_FAMILY,
      fontStyle: "900",
      fontSize: "30px",
      color: "#ffd166",
    });
    headline.setOrigin(0.5);

    const sub = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 76,
      `Containment secured.  ${data.totalLevels - data.levelNumber} sections remaining.`,
      {
        fontFamily: FONT_FAMILY,
        fontSize: "13px",
        color: "#9bb0c8",
      }
    );
    sub.setOrigin(0.5);

    const lines = [
      { label: "SCORE", value: formatScore(data.score), color: "#e7f6ff" },
      { label: "SCRAP", value: `${data.scrap}`, color: "#ffd166" },
      { label: "BEST CHAIN", value: `x${data.bestCombo}`, color: "#ff6cf2" },
    ];
    lines.forEach((line, idx) => {
      const y = GAME_HEIGHT / 2 - 30 + idx * 36;
      const lbl = this.add.text(GAME_WIDTH / 2 - 130, y, line.label, {
        fontFamily: FONT_FAMILY,
        fontStyle: "bold",
        fontSize: "14px",
        color: "#6ffcff",
      });
      lbl.setOrigin(0, 0.5);
      const val = this.add.text(GAME_WIDTH / 2 + 130, y, line.value, {
        fontFamily: FONT_FAMILY,
        fontStyle: "900",
        fontSize: "18px",
        color: line.color,
      });
      val.setOrigin(1, 0.5);
    });

    const button = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110, 220, 38, 0x1c4a2a, 0.9);
    button.setStrokeStyle(2, COLORS.neonGreen, 1);
    button.setInteractive({ useHandCursor: true });
    const buttonLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110, "CONTINUE", {
      fontFamily: FONT_FAMILY,
      fontStyle: "900",
      fontSize: "16px",
      color: "#e7f6ff",
    });
    buttonLabel.setOrigin(0.5);

    button.on("pointerdown", () => this.advance(data));
    this.input.keyboard?.once("keydown-ENTER", () => this.advance(data));
    this.input.keyboard?.once("keydown-SPACE", () => this.advance(data));
  }

  private advance(data: LevelCompleteData): void {
    audio.uiClick();
    this.scene.stop();
    data.onContinue();
  }
}
