import Phaser from "phaser";
import { COLORS, FONT_FAMILY, GAME_HEIGHT, GAME_WIDTH, SCENES, TEX } from "../constants";
import { audio } from "../systems/AudioSystem";
import { CrazyGamesAdapter } from "../systems/CrazyGamesAdapter";
import type { SaveSystem } from "../systems/SaveSystem";
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

    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x06061a, 0.92);
    overlay.setInteractive();

    // Confetti / sparks
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(-40, GAME_HEIGHT);
      const p = this.add.image(x, y, TEX.star);
      p.setTint(Phaser.Utils.Array.GetRandom([COLORS.neonCyan, COLORS.neonPink, COLORS.neonGold, COLORS.neonGreen]));
      p.setScale(0.5 + Math.random());
      this.tweens.add({
        targets: p,
        y: y + GAME_HEIGHT + 60,
        x: x + Phaser.Math.Between(-60, 60),
        angle: 360,
        duration: 4000 + Math.random() * 4000,
        repeat: -1,
        delay: Math.random() * 2000,
      });
    }

    const title = this.add.text(GAME_WIDTH / 2, 120, "REACTOR STABILIZED", {
      fontFamily: FONT_FAMILY,
      fontStyle: "900",
      fontSize: "44px",
      color: "#ffd166",
      stroke: "#06061a",
      strokeThickness: 5,
    });
    title.setOrigin(0.5);

    const sub = this.add.text(GAME_WIDTH / 2, 168, "You popped the Reactor Blob and saved the lab.", {
      fontFamily: FONT_FAMILY,
      fontSize: "14px",
      color: "#9efc7a",
    });
    sub.setOrigin(0.5);

    const lines = [
      { label: "FINAL SCORE", value: formatScore(data.score) },
      { label: "TOTAL SCRAP", value: `${data.scrap}` },
    ];
    lines.forEach((l, idx) => {
      const y = 250 + idx * 36;
      this.add.text(GAME_WIDTH / 2 - 120, y, l.label, {
        fontFamily: FONT_FAMILY,
        fontStyle: "bold",
        fontSize: "14px",
        color: "#6ffcff",
      }).setOrigin(0, 0.5);
      this.add.text(GAME_WIDTH / 2 + 120, y, l.value, {
        fontFamily: FONT_FAMILY,
        fontStyle: "900",
        fontSize: "20px",
        color: "#e7f6ff",
      }).setOrigin(1, 0.5);
    });

    this.buildButton(GAME_WIDTH / 2, 400, "PLAY AGAIN", COLORS.neonGreen, () => {
      this.scene.start(SCENES.Game, { level: 0, freshRun: true });
    });
    this.buildButton(GAME_WIDTH / 2, 450, "MAIN MENU", COLORS.neonCyan, () => {
      this.scene.start(SCENES.MainMenu);
    });
  }

  private buildButton(x: number, y: number, label: string, color: number, cb: () => void): void {
    const bg = this.add.rectangle(x, y, 220, 40, 0x121542, 0.95);
    bg.setStrokeStyle(2, color, 1);
    bg.setInteractive({ useHandCursor: true });
    const lbl = this.add.text(x, y, label, {
      fontFamily: FONT_FAMILY,
      fontStyle: "900",
      fontSize: "16px",
      color: "#e7f6ff",
    });
    lbl.setOrigin(0.5);
    bg.on("pointerover", () => {
      bg.setStrokeStyle(3, COLORS.neonPink, 1);
      lbl.setColor("#ffd166");
    });
    bg.on("pointerout", () => {
      bg.setStrokeStyle(2, color, 1);
      lbl.setColor("#e7f6ff");
    });
    bg.on("pointerdown", () => {
      audio.uiClick();
      cb();
    });
  }
}
