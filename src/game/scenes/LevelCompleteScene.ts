import Phaser from "phaser";
import { DEPTH, GAME_HEIGHT, GAME_WIDTH, SCENES } from "../constants";
import { audio } from "../systems/AudioSystem";
import { CssVisual } from "../systems/CssVisual";
import type { SaveSystem } from "../systems/SaveSystem";
import {
  addChromeButton,
  addCssText,
  addGlassPanel,
  addSceneTitle,
} from "../ui/SceneChrome";
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
    const save = this.registry.get("save") as SaveSystem | undefined;
    save?.recordRun({ level: data.levelNumber, score: data.score, scrap: 0 });

    // Dim overlay
    const overlay = new CssVisual(this, "cv-overlay-dim", {
      depth: DEPTH.hud - 2,
      pixelWidth: GAME_WIDTH,
      pixelHeight: GAME_HEIGHT,
    });
    overlay.node.style.background = "rgba(6, 6, 26, 0.82)";
    overlay.node.style.pointerEvents = "auto";
    overlay.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    addGlassPanel(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, 540, 340, "#ffd166");
    addSceneTitle(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 110, `LEVEL ${data.levelNumber} CLEAR`);

    addCssText(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60,
      `Containment secured. ${data.totalLevels - data.levelNumber} sections remaining.`,
      { size: 13, color: "#9bb0c8", weight: 500, letterSpacing: 1, width: 480 });

    this.buildStatsRow(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 16, [
      { label: "SCORE", value: formatScore(data.score), color: "#e7f6ff" },
      { label: "SCRAP", value: `${data.scrap}`, color: "#ffd166" },
      { label: "BEST CHAIN", value: `x${data.bestCombo}`, color: "#ff6cf2" },
    ]);

    addChromeButton(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 116, 250, 46, "CONTINUE",
      "#9efc7a", () => this.advance(data));

    this.input.keyboard?.once("keydown-ENTER", () => this.advance(data));
    this.input.keyboard?.once("keydown-SPACE", () => this.advance(data));
  }

  private buildStatsRow(cx: number, cy: number, stats: Array<{ label: string; value: string; color: string }>): void {
    const rowGap = 38;
    stats.forEach((s, i) => {
      const y = cy + i * rowGap;
      addCssText(this, cx - 110, y, s.label, {
        size: 13, color: "#6ffcff", weight: 700, letterSpacing: 3, align: "left", width: 200,
      });
      addCssText(this, cx + 110, y, s.value, {
        size: 20, color: s.color, weight: 900, letterSpacing: 1, align: "right", width: 200,
      });
    });
  }

  private advance(data: LevelCompleteData): void {
    audio.uiClick();
    this.scene.stop();
    data.onContinue();
  }
}
