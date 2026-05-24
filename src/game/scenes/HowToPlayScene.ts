import Phaser from "phaser";
import { COLORS, FONT_FAMILY, GAME_HEIGHT, GAME_WIDTH, SCENES, TEX } from "../constants";
import { audio } from "../systems/AudioSystem";

export class HowToPlayScene extends Phaser.Scene {
  constructor() {
    super(SCENES.HowToPlay);
  }

  create(): void {
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.bgDeep);
    bg.setAlpha(1);

    const title = this.add.text(GAME_WIDTH / 2, 60, "HOW TO PLAY", {
      fontFamily: FONT_FAMILY,
      fontStyle: "900",
      fontSize: "36px",
      color: "#6ffcff",
      stroke: "#06061a",
      strokeThickness: 4,
    });
    title.setOrigin(0.5);

    const sections: Array<{ icon: string; lines: string[]; color: string }> = [
      {
        icon: "MOVE",
        color: "#6ffcff",
        lines: [
          "WASD or Arrow Keys to move",
          "Space / W / Up to jump",
        ],
      },
      {
        icon: "SHOOT",
        color: "#ff6cf2",
        lines: [
          "Left Mouse / J / X — fire a containment field",
          "Fields fly forward and lock onto slimes",
        ],
      },
      {
        icon: "POP",
        color: "#ffd166",
        lines: [
          "Touch a trapped field or shoot it to pop",
          "Chain multiple pops for massive combo bonus",
        ],
      },
      {
        icon: "CLEAR",
        color: "#9efc7a",
        lines: [
          "Clear every slime to open the portal",
          "Enter the portal to advance",
          "Every 3 levels, choose a new upgrade",
        ],
      },
    ];

    const baseY = 130;
    const rowH = 78;
    sections.forEach((sec, i) => {
      const y = baseY + i * rowH;
      const card = this.add.rectangle(GAME_WIDTH / 2, y, 720, rowH - 10, 0x121542, 0.65);
      card.setStrokeStyle(1.5, parseInt(sec.color.replace("#", "0x"), 16), 0.6);

      const tag = this.add.text(GAME_WIDTH / 2 - 320, y, sec.icon, {
        fontFamily: FONT_FAMILY,
        fontStyle: "900",
        fontSize: "20px",
        color: sec.color,
      });
      tag.setOrigin(0, 0.5);

      sec.lines.forEach((line, li) => {
        const t = this.add.text(
          GAME_WIDTH / 2 - 200,
          y + li * 18 - (sec.lines.length - 1) * 9,
          line,
          {
            fontFamily: FONT_FAMILY,
            fontSize: "14px",
            color: "#e7f6ff",
          }
        );
        t.setOrigin(0, 0.5);
      });
    });

    // Tiny enemy showcase
    const enemyY = baseY + sections.length * rowH + 24;
    const enemies = [
      { tex: TEX.slimeBasic, name: "Basic" },
      { tex: TEX.slimeBouncer, name: "Bouncer" },
      { tex: TEX.slimeCharger, name: "Charger" },
      { tex: TEX.slimeShield, name: "Plated" },
    ];
    enemies.forEach((e, i) => {
      const x = GAME_WIDTH / 2 - 180 + i * 120;
      const img = this.add.image(x, enemyY, e.tex);
      img.setScale(1.6);
      const lbl = this.add.text(x, enemyY + 28, e.name, {
        fontFamily: FONT_FAMILY,
        fontSize: "12px",
        color: "#9bb0c8",
      });
      lbl.setOrigin(0.5);
    });

    const hint = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 40,
      "Press ESC or click to return",
      {
        fontFamily: FONT_FAMILY,
        fontSize: "13px",
        color: "#6ffcff",
      }
    );
    hint.setOrigin(0.5);

    const back = () => {
      audio.uiClick();
      this.scene.start(SCENES.MainMenu);
    };
    this.input.once(Phaser.Input.Events.POINTER_DOWN, back);
    this.input.keyboard?.once("keydown-ESC", back);
    this.input.keyboard?.once("keydown-ENTER", back);
    this.input.keyboard?.once("keydown-SPACE", back);
  }
}
