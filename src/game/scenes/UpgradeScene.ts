import Phaser from "phaser";
import { DEPTH, GAME_HEIGHT, GAME_WIDTH, SCENES } from "../constants";
import type { UpgradeDef } from "../data/upgrades";
import { audio } from "../systems/AudioSystem";
import { CrazyGamesAdapter } from "../systems/CrazyGamesAdapter";
import { CssVisual } from "../systems/CssVisual";
import {
  addCssHint,
  addCssText,
  addGlassPanel,
  addSceneTitle,
} from "../ui/SceneChrome";

export type UpgradeSceneData = {
  choices: UpgradeDef[];
  onChosen: (id: UpgradeDef["id"]) => void;
};

/**
 * Modal upgrade-choice scene.  Each choice is a CSS upgrade card with hover
 * lift + glow.  Press 1/2/3 to pick by keyboard.
 */
export class UpgradeScene extends Phaser.Scene {
  private choices: UpgradeDef[] = [];
  private onChosen?: (id: UpgradeDef["id"]) => void;

  constructor() {
    super(SCENES.Upgrade);
  }

  create(data: UpgradeSceneData): void {
    this.choices = data.choices;
    this.onChosen = data.onChosen;

    CrazyGamesAdapter.requestMidgameAd();

    const overlay = new CssVisual(this, "cv-overlay-dim", {
      depth: DEPTH.hud - 2,
      pixelWidth: GAME_WIDTH,
      pixelHeight: GAME_HEIGHT,
    });
    overlay.node.style.background = "rgba(6, 6, 26, 0.86)";
    overlay.node.style.pointerEvents = "auto";
    overlay.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    addGlassPanel(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18, 820, 420, "#6ffcff");
    addSceneTitle(this, GAME_WIDTH / 2, 90, "INSTALL UPGRADE MODULE");

    addCssText(this, GAME_WIDTH / 2, 140,
      "Choose one — the upgrade lasts for the rest of this run",
      { size: 13, color: "#9bb0c8", weight: 500, letterSpacing: 1, width: 720 });

    const cardWidth = 230;
    const cardHeight = 270;
    const spacing = 26;
    const totalWidth = this.choices.length * cardWidth + (this.choices.length - 1) * spacing;
    const startX = (GAME_WIDTH - totalWidth) / 2 + cardWidth / 2;
    const centerY = GAME_HEIGHT / 2 + 40;

    this.choices.forEach((def, idx) => {
      const x = startX + idx * (cardWidth + spacing);
      this.buildCard(x, centerY, cardWidth, cardHeight, def, idx + 1);
    });

    addCssHint(this, GAME_WIDTH / 2, GAME_HEIGHT - 40, "Press 1, 2, 3 or click a module");

    ["ONE", "TWO", "THREE"].forEach((key, idx) => {
      this.input.keyboard?.once(`keydown-${key}`, () => this.pick(idx));
    });
  }

  private buildCard(
    x: number,
    y: number,
    w: number,
    h: number,
    def: UpgradeDef,
    hotkey: number
  ): void {
    const hex = `#${def.color.toString(16).padStart(6, "0")}`;
    const r = (def.color >> 16) & 0xff;
    const g = (def.color >> 8)  & 0xff;
    const b = def.color & 0xff;
    const glow = `rgba(${r}, ${g}, ${b}, 0.45)`;

    const card = new CssVisual(this, "cv-upgrade-card", {
      depth: DEPTH.hud,
      pixelWidth: w,
      pixelHeight: h,
    });
    card.node.style.setProperty("--uc-color", hex);
    card.node.style.setProperty("--uc-glow", glow);
    card.setHtml(`
      <div class="uc-frame">
        <div style="
          position:absolute;
          top:8px;
          left:10px;
          font-size:18px;
          font-weight:900;
          color:#6ffcff;
          letter-spacing:1px;
          text-shadow:0 0 4px rgba(111, 252, 255, 0.6);
        ">${hotkey}</div>
        <div class="uc-icon">${def.icon}</div>
        <div class="uc-title">${def.title.toUpperCase()}</div>
        <div class="uc-desc">${def.description}</div>
      </div>
    `);
    card.setPosition(x, y);

    const click = () => {
      audio.upgradeSelected();
      this.confirm(def.id);
    };
    card.node.addEventListener("click", click);
    card.node.addEventListener("touchend", click);
  }

  private pick(idx: number): void {
    if (idx < 0 || idx >= this.choices.length) return;
    audio.upgradeSelected();
    this.confirm(this.choices[idx].id);
  }

  private confirm(id: UpgradeDef["id"]): void {
    const cb = this.onChosen;
    this.onChosen = undefined;
    this.scene.stop();
    cb?.(id);
  }
}
