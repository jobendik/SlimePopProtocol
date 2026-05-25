import Phaser from "phaser";
import { DEPTH, GAME_HEIGHT, GAME_WIDTH, SCENES } from "../constants";
import { audio } from "../systems/AudioSystem";
import { CssVisual } from "../systems/CssVisual";
import {
  addCssHint,
  addGlassPanel,
  addSceneBackdrop,
  addSceneTitle,
} from "../ui/SceneChrome";

const SECTIONS: Array<{ icon: string; color: string; lines: string[] }> = [
  {
    icon: "MOVE",
    color: "#6ffcff",
    lines: ["WASD or Arrow Keys to move", "Space / W / Up to jump"],
  },
  {
    icon: "SHOOT",
    color: "#ff6cf2",
    lines: ["Left Mouse / J / X — fire a containment field", "Fields fly forward and lock onto slimes"],
  },
  {
    icon: "POP",
    color: "#ffd166",
    lines: ["Touch a trapped field or shoot it to pop", "Chain multiple pops for massive combo bonus"],
  },
  {
    icon: "CLEAR",
    color: "#9efc7a",
    lines: ["Clear every slime to open the portal", "Enter the portal to advance", "Every 3 levels, choose a new upgrade"],
  },
];

export class HowToPlayScene extends Phaser.Scene {
  constructor() {
    super(SCENES.HowToPlay);
  }

  create(): void {
    addSceneBackdrop(this, "purple");
    addGlassPanel(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 6, 800, 450, "#6ffcff");
    addSceneTitle(this, GAME_WIDTH / 2, 64, "HOW TO PLAY");

    this.buildSections();
    this.buildEnemyShowcase();

    addCssHint(this, GAME_WIDTH / 2, GAME_HEIGHT - 40, "Press ESC or click to return");

    const back = () => {
      audio.uiClick();
      this.scene.start(SCENES.MainMenu);
    };
    this.input.once(Phaser.Input.Events.POINTER_DOWN, back);
    this.input.keyboard?.once("keydown-ESC", back);
    this.input.keyboard?.once("keydown-ENTER", back);
    this.input.keyboard?.once("keydown-SPACE", back);
  }

  private buildSections(): void {
    const baseY = 138;
    const rowH = 64;

    SECTIONS.forEach((sec, i) => {
      const y = baseY + i * rowH;

      // Section card
      const card = new CssVisual(this, "cv-howto-card", {
        depth: DEPTH.hud,
        pixelWidth: 740,
        pixelHeight: rowH - 8,
      });
      card.node.style.cssText = `
        background: linear-gradient(180deg, rgba(16, 23, 58, 0.88) 0%, rgba(8, 11, 30, 0.92) 100%);
        border: 1.5px solid ${sec.color}66;
        border-left: 4px solid ${sec.color};
        border-radius: 8px;
        padding: 8px 20px 8px 24px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45), 0 0 12px ${sec.color}22;
      `;

      const linesHtml = sec.lines
        .map(
          (l) =>
            `<div style="font-size:13px;color:#e7f6ff;letter-spacing:0.5px;line-height:1.55;">${l}</div>`
        )
        .join("");

      card.node.querySelector(".cv-flip")!.innerHTML = `
        <div style="display:flex;align-items:center;height:100%;gap:18px;">
          <div style="
            min-width:90px;
            font-size:18px;
            font-weight:900;
            letter-spacing:3px;
            color:${sec.color};
            text-shadow:0 0 6px ${sec.color}99, 0 1px 0 #06061a;
          ">${sec.icon}</div>
          <div style="flex:1;">${linesHtml}</div>
        </div>
      `;
      card.setPosition(GAME_WIDTH / 2, y);
    });
  }

  private buildEnemyShowcase(): void {
    const enemyY = 400;
    const kinds: Array<{ cls: string; html: string; name: string }> = [
      {
        cls: "cv-slime cv-slime-basic",
        name: "BASIC",
        html: `
          <div class="slime-shadow"></div>
          <div class="slime-body"></div>
          <div class="slime-eyes"><span></span><span></span></div>
          <div class="slime-mouth"></div>
        `,
      },
      {
        cls: "cv-slime cv-slime-bouncer",
        name: "BOUNCER",
        html: `
          <div class="slime-shadow"></div>
          <div class="slime-crown"></div>
          <div class="slime-body"></div>
          <div class="slime-eyes"><span></span><span></span></div>
          <div class="slime-mouth"></div>
        `,
      },
      {
        cls: "cv-slime cv-slime-charger",
        name: "CHARGER",
        html: `
          <div class="slime-shadow"></div>
          <div class="slime-crown"></div>
          <div class="slime-body"></div>
          <div class="slime-eyes"><span></span><span></span></div>
          <div class="slime-mouth"></div>
        `,
      },
      {
        cls: "cv-slime cv-slime-shield",
        name: "PLATED",
        html: `
          <div class="slime-shadow"></div>
          <div class="slime-crown"></div>
          <div class="slime-body"></div>
          <div class="slime-eyes"><span></span><span></span></div>
          <div class="slime-mouth"></div>
        `,
      },
    ];

    kinds.forEach((k, i) => {
      const x = GAME_WIDTH / 2 - 200 + i * 130;

      const slime = new CssVisual(this, k.cls, { depth: DEPTH.hud });
      slime.setHtml(k.html);
      slime.setPosition(x, enemyY);
      slime.dom.setScale(1.7, 1.7);

      // Name label
      const lbl = new CssVisual(this, "cv-text", {
        depth: DEPTH.hud,
        pixelWidth: 120,
        pixelHeight: 16,
      });
      const inner = document.createElement("div");
      inner.textContent = k.name;
      inner.style.cssText = `
        text-align: center;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 3px;
        color: #9bb0c8;
        text-shadow: 0 0 4px #06061a;
        width: 100%;
      `;
      lbl.node.querySelector(".cv-flip")!.appendChild(inner);
      lbl.setPosition(x, enemyY + 32);
    });
  }
}
