import Phaser from "phaser";
import { COLORS, FONT_FAMILY, GAME_HEIGHT, GAME_WIDTH, SCENES } from "../constants";
import type { UpgradeDef } from "../data/upgrades";
import { audio } from "../systems/AudioSystem";
import { CrazyGamesAdapter } from "../systems/CrazyGamesAdapter";

export type UpgradeSceneData = {
  choices: UpgradeDef[];
  /** Callback invoked with the chosen upgrade id (or null if none picked). */
  onChosen: (id: UpgradeDef["id"]) => void;
};

/**
 * Modal upgrade-choice scene.  Pauses the game scene while a choice is made.
 * Pressing 1/2/3 selects the corresponding card.
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

    // ad-friendly: this is a safe moment between rounds
    CrazyGamesAdapter.requestMidgameAd();

    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x06061a, 0.85);
    overlay.setInteractive();

    const title = this.add.text(GAME_WIDTH / 2, 80, "INSTALL UPGRADE MODULE", {
      fontFamily: FONT_FAMILY,
      fontStyle: "900",
      fontSize: "32px",
      color: "#6ffcff",
      stroke: "#06061a",
      strokeThickness: 4,
    });
    title.setOrigin(0.5);

    const sub = this.add.text(GAME_WIDTH / 2, 116, "Choose one — the upgrade lasts for the rest of this run", {
      fontFamily: FONT_FAMILY,
      fontSize: "13px",
      color: "#9bb0c8",
    });
    sub.setOrigin(0.5);

    const cardWidth = 230;
    const cardHeight = 280;
    const spacing = 26;
    const totalWidth = this.choices.length * cardWidth + (this.choices.length - 1) * spacing;
    const startX = (GAME_WIDTH - totalWidth) / 2 + cardWidth / 2;
    const centerY = GAME_HEIGHT / 2 + 30;

    this.choices.forEach((def, idx) => {
      const x = startX + idx * (cardWidth + spacing);
      this.buildCard(x, centerY, cardWidth, cardHeight, def, idx + 1);
    });

    const hint = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40, "Press 1, 2, 3 or click a module", {
      fontFamily: FONT_FAMILY,
      fontSize: "12px",
      color: "#9bb0c8",
    });
    hint.setOrigin(0.5);

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
    const card = this.add.rectangle(x, y, w, h, 0x121542, 0.95);
    card.setStrokeStyle(2, def.color, 0.8);
    card.setInteractive({ useHandCursor: true });

    const hot = this.add.text(x - w / 2 + 12, y - h / 2 + 10, `${hotkey}`, {
      fontFamily: FONT_FAMILY,
      fontStyle: "900",
      fontSize: "20px",
      color: "#6ffcff",
    });

    const icon = this.add.text(x, y - 70, def.icon, {
      fontFamily: FONT_FAMILY,
      fontStyle: "900",
      fontSize: "64px",
      color: `#${def.color.toString(16).padStart(6, "0")}`,
    });
    icon.setOrigin(0.5);

    const name = this.add.text(x, y - 10, def.title, {
      fontFamily: FONT_FAMILY,
      fontStyle: "900",
      fontSize: "20px",
      color: "#e7f6ff",
    });
    name.setOrigin(0.5);

    const desc = this.add.text(x, y + 40, def.description, {
      fontFamily: FONT_FAMILY,
      fontSize: "13px",
      color: "#cfe9ff",
      wordWrap: { width: w - 40 },
      align: "center",
    });
    desc.setOrigin(0.5);

    card.on("pointerover", () => {
      card.setStrokeStyle(3, COLORS.neonPink, 1);
      this.tweens.add({ targets: card, scale: 1.04, duration: 140 });
      this.tweens.add({ targets: [icon, name, desc, hot], scale: 1.04, duration: 140 });
    });
    card.on("pointerout", () => {
      card.setStrokeStyle(2, def.color, 0.8);
      this.tweens.add({ targets: card, scale: 1, duration: 140 });
      this.tweens.add({ targets: [icon, name, desc, hot], scale: 1, duration: 140 });
    });
    card.on("pointerdown", () => {
      audio.upgradeSelected();
      this.confirm(def.id);
    });
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
