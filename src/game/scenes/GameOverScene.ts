import Phaser from "phaser";
import { DEPTH, GAME_HEIGHT, GAME_WIDTH, SCENES } from "../constants";
import { audio } from "../systems/AudioSystem";
import { CrazyGamesAdapter } from "../systems/CrazyGamesAdapter";
import { CssVisual } from "../systems/CssVisual";
import type { SaveSystem } from "../systems/SaveSystem";
import {
  addChromeButton,
  addCssText,
  addGlassPanel,
  addSceneBackdrop,
  addSceneTitle,
} from "../ui/SceneChrome";
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

    const overlay = new CssVisual(this, "cv-overlay-dim", {
      depth: DEPTH.hud - 2,
      pixelWidth: GAME_WIDTH,
      pixelHeight: GAME_HEIGHT,
    });
    overlay.node.style.background = "rgba(6, 6, 26, 0.55)";
    overlay.node.style.pointerEvents = "auto";
    overlay.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    addGlassPanel(this, GAME_WIDTH / 2, 285, 540, 360, "#ff5577");
    addSceneTitle(this, GAME_WIDTH / 2, 130, "CONTAINMENT FAILED");

    addCssText(this, GAME_WIDTH / 2, 178,
      "The slime mutants overpowered your repair bot.",
      { size: 13, color: "#9bb0c8", weight: 500, letterSpacing: 1, width: 540 });

    const stats: Array<{ label: string; value: string }> = [
      { label: "REACHED LEVEL", value: `${data.levelReached}` },
      { label: "FINAL SCORE",   value: formatScore(data.score) },
      { label: "SCRAP COLLECTED", value: `${data.scrap}` },
    ];
    stats.forEach((s, i) => {
      const y = 240 + i * 36;
      addCssText(this, GAME_WIDTH / 2 - 110, y, s.label, {
        size: 13, color: "#6ffcff", weight: 700, letterSpacing: 3, align: "left", width: 240,
      });
      addCssText(this, GAME_WIDTH / 2 + 110, y, s.value, {
        size: 20, color: "#e7f6ff", weight: 900, letterSpacing: 1, align: "right", width: 240,
      });
    });

    addChromeButton(this, GAME_WIDTH / 2 - 130, 405, 230, 46, "RETRY", "#9efc7a", () => {
      audio.uiClick();
      this.scene.start(SCENES.Game, { level: 0, freshRun: true });
    });
    addChromeButton(this, GAME_WIDTH / 2 + 130, 405, 230, 46, "MAIN MENU", "#6ffcff", () => {
      audio.uiClick();
      this.scene.start(SCENES.MainMenu);
    });
  }
}
