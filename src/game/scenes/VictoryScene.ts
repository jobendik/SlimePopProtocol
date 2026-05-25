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

export type VictoryData = {
  score: number;
  scrap: number;
};

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super(SCENES.Victory);
  }

  create(data: VictoryData): void {
    audio.stopMusic();
    audio.victory();
    CrazyGamesAdapter.happyTime();
    CrazyGamesAdapter.gameplayStop();

    const save = this.registry.get("save") as SaveSystem | undefined;
    save?.recordRun({ level: 12, score: data.score, scrap: data.scrap });

    addSceneBackdrop(this, "victory");

    const overlay = new CssVisual(this, "cv-overlay-dim", {
      depth: DEPTH.hud - 2,
      pixelWidth: GAME_WIDTH,
      pixelHeight: GAME_HEIGHT,
    });
    overlay.node.style.background = "rgba(6, 6, 26, 0.42)";
    overlay.node.style.pointerEvents = "auto";
    overlay.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    this.buildConfetti();

    addGlassPanel(this, GAME_WIDTH / 2, 286, 540, 350, "#ffd166");
    addSceneTitle(this, GAME_WIDTH / 2, 122, "REACTOR STABILIZED");

    addCssText(this, GAME_WIDTH / 2, 174,
      "You popped the Reactor Blob and saved the lab.",
      { size: 13, color: "#9efc7a", weight: 600, letterSpacing: 1, width: 520 });

    const stats: Array<{ label: string; value: string }> = [
      { label: "FINAL SCORE", value: formatScore(data.score) },
      { label: "TOTAL SCRAP", value: `${data.scrap}` },
    ];
    stats.forEach((s, i) => {
      const y = 244 + i * 36;
      addCssText(this, GAME_WIDTH / 2 - 110, y, s.label, {
        size: 13, color: "#6ffcff", weight: 700, letterSpacing: 3, align: "left", width: 240,
      });
      addCssText(this, GAME_WIDTH / 2 + 110, y, s.value, {
        size: 22, color: "#e7f6ff", weight: 900, letterSpacing: 1, align: "right", width: 240,
      });
    });

    addChromeButton(this, GAME_WIDTH / 2 - 130, 405, 230, 46, "PLAY AGAIN", "#9efc7a", () => {
      audio.uiClick();
      this.scene.start(SCENES.Game, { level: 0, freshRun: true });
    });
    addChromeButton(this, GAME_WIDTH / 2 + 130, 405, 230, 46, "MAIN MENU", "#6ffcff", () => {
      audio.uiClick();
      this.scene.start(SCENES.MainMenu);
    });
  }

  /**
   * Pure-CSS celebratory confetti: 50 absolutely-positioned tiny squares
   * cycling colour + falling via a CSS keyframe.  Cheap and on-brand.
   */
  private buildConfetti(): void {
    const confetti = new CssVisual(this, "cv-confetti", {
      depth: DEPTH.hud - 1,
      pixelWidth: GAME_WIDTH,
      pixelHeight: GAME_HEIGHT,
    });
    confetti.node.style.pointerEvents = "none";
    const palette = ["#6ffcff", "#ff6cf2", "#ffd166", "#9efc7a"];
    const html = Array.from({ length: 60 }, () => {
      const left = Math.random() * 100;
      const top = -10 - Math.random() * 30;
      const dur = (3 + Math.random() * 3).toFixed(2);
      const delay = (Math.random() * 4).toFixed(2);
      const size = (3 + Math.random() * 4).toFixed(1);
      const color = palette[Math.floor(Math.random() * palette.length)];
      const rot = Math.floor(Math.random() * 360);
      return `<i style="
        position:absolute;
        left:${left}%;
        top:${top}%;
        width:${size}px;
        height:${(parseFloat(size) * 1.6).toFixed(1)}px;
        background:${color};
        box-shadow:0 0 4px ${color};
        transform:rotate(${rot}deg);
        animation: confetti-fall ${dur}s linear ${delay}s infinite;
        opacity:0.85;
      "></i>`;
    }).join("");
    confetti.node.querySelector(".cv-flip")!.innerHTML = html;
    confetti.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);
  }
}
