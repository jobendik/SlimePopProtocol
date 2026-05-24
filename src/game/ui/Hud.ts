import Phaser from "phaser";
import { COLORS, DEPTH, FONT_FAMILY, GAME_WIDTH, LOGICAL_SCALE, PLAYER, TEX } from "../constants";
import { formatScore } from "../utils/math";

/**
 * Lightweight HUD widget used by HudScene.  Pure rendering — state is fed
 * in from outside, so HUD never reaches into game systems directly.
 */
export class Hud {
  private scene: Phaser.Scene;
  private hearts: Phaser.GameObjects.Image[] = [];
  private scoreLabel: Phaser.GameObjects.Text;
  private scrapLabel: Phaser.GameObjects.Text;
  private scrapIcon: Phaser.GameObjects.Image;
  private levelLabel: Phaser.GameObjects.Text;
  private comboLabel: Phaser.GameObjects.Text;
  private upgradeRow: Phaser.GameObjects.Container;
  private upgradeRowChildren: Phaser.GameObjects.GameObject[] = [];
  private hint?: Phaser.GameObjects.Text;
  private shieldIcon?: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const panel = scene.add.graphics();
    panel.fillStyle(0x06061a, 0.6);
    panel.fillRoundedRect(8, 8, 240, 38, 8);
    panel.setDepth(DEPTH.hud);

    // Hearts — textures baked at TEX_SUPERSAMPLE× density.
    for (let i = 0; i < PLAYER.maxHearts; i++) {
      const h = scene.add.image(28 + i * 22, 27, TEX.heart);
      h.setDepth(DEPTH.hud + 1);
      h.setScale(LOGICAL_SCALE);
      this.hearts.push(h);
    }

    // Level label
    this.levelLabel = scene.add.text(120, 18, "LEVEL 1", {
      fontFamily: FONT_FAMILY,
      fontStyle: "bold",
      fontSize: "12px",
      color: "#6ffcff",
      letterSpacing: 2,
    } as Phaser.Types.GameObjects.Text.TextStyle);
    this.levelLabel.setDepth(DEPTH.hud + 1);

    // Score
    const scorePanel = scene.add.graphics();
    scorePanel.fillStyle(0x06061a, 0.6);
    scorePanel.fillRoundedRect(GAME_WIDTH - 248, 8, 240, 38, 8);
    scorePanel.setDepth(DEPTH.hud);

    this.scoreLabel = scene.add.text(GAME_WIDTH - 16, 18, "0", {
      fontFamily: FONT_FAMILY,
      fontStyle: "bold",
      fontSize: "20px",
      color: "#e7f6ff",
    });
    this.scoreLabel.setOrigin(1, 0);
    this.scoreLabel.setDepth(DEPTH.hud + 1);

    this.scrapIcon = scene.add.image(GAME_WIDTH - 220, 33, TEX.scrap);
    this.scrapIcon.setDepth(DEPTH.hud + 1);
    this.scrapIcon.setScale(LOGICAL_SCALE);
    this.scrapLabel = scene.add.text(GAME_WIDTH - 208, 33, "0", {
      fontFamily: FONT_FAMILY,
      fontStyle: "bold",
      fontSize: "12px",
      color: "#ffd166",
    });
    this.scrapLabel.setOrigin(0, 0.5);
    this.scrapLabel.setDepth(DEPTH.hud + 1);

    this.comboLabel = scene.add.text(GAME_WIDTH / 2, 30, "", {
      fontFamily: FONT_FAMILY,
      fontStyle: "900",
      fontSize: "22px",
      color: "#ff6cf2",
      stroke: "#06061a",
      strokeThickness: 4,
    });
    this.comboLabel.setOrigin(0.5);
    this.comboLabel.setDepth(DEPTH.hud + 1);
    this.comboLabel.setAlpha(0);

    this.upgradeRow = scene.add.container(8, 60);
    this.upgradeRow.setDepth(DEPTH.hud);
  }

  setHearts(count: number): void {
    this.hearts.forEach((h, i) => {
      h.setTexture(i < count ? TEX.heart : TEX.heartEmpty);
    });
  }

  setLevel(num: number, total: number): void {
    this.levelLabel.setText(`LEVEL ${num} / ${total}`);
  }

  setScore(score: number): void {
    this.scoreLabel.setText(formatScore(score));
  }

  setScrap(scrap: number): void {
    this.scrapLabel.setText(`${scrap}`);
  }

  setCombo(chain: number): void {
    if (chain <= 1) {
      this.scene.tweens.add({
        targets: this.comboLabel,
        alpha: 0,
        duration: 220,
      });
      return;
    }
    const word = chain >= 5 ? "MEGA POP" : chain >= 3 ? "CHAIN" : "COMBO";
    this.comboLabel.setText(`x${chain}  ${word}`);
    this.comboLabel.setAlpha(1);
    this.scene.tweens.killTweensOf(this.comboLabel);
    this.scene.tweens.add({
      targets: this.comboLabel,
      scale: { from: 1.3, to: 1 },
      duration: 240,
      ease: "Back.easeOut",
    });
  }

  setUpgrades(entries: Array<{ icon: string; color: number; stacks: number }>): void {
    this.upgradeRowChildren.forEach((c) => c.destroy());
    this.upgradeRowChildren = [];
    entries.forEach((e, idx) => {
      const x = idx * 30;
      const circle = this.scene.add.circle(x + 12, 12, 11, e.color, 0.25);
      circle.setStrokeStyle(1.5, e.color, 0.95);
      const txt = this.scene.add.text(x + 12, 12, e.icon, {
        fontFamily: FONT_FAMILY,
        fontStyle: "bold",
        fontSize: "13px",
        color: "#ffffff",
      });
      txt.setOrigin(0.5);
      this.upgradeRow.add(circle);
      this.upgradeRow.add(txt);
      this.upgradeRowChildren.push(circle, txt);
      if (e.stacks > 1) {
        const stackLbl = this.scene.add.text(x + 22, 20, `x${e.stacks}`, {
          fontFamily: FONT_FAMILY,
          fontSize: "10px",
          color: "#ffd166",
        });
        this.upgradeRow.add(stackLbl);
        this.upgradeRowChildren.push(stackLbl);
      }
    });
  }

  setShield(active: boolean): void {
    if (active && !this.shieldIcon) {
      this.shieldIcon = this.scene.add.image(160, 26, TEX.particle);
      this.shieldIcon.setTint(0xcfe9ff);
      this.shieldIcon.setScale(1.2 * LOGICAL_SCALE);
      this.shieldIcon.setDepth(DEPTH.hud + 1);
    } else if (!active && this.shieldIcon) {
      this.shieldIcon.destroy();
      this.shieldIcon = undefined;
    }
  }

  showHint(text: string, durationMs = 4500): void {
    this.hint?.destroy();
    this.hint = this.scene.add.text(GAME_WIDTH / 2, 80, text, {
      fontFamily: FONT_FAMILY,
      fontStyle: "bold",
      fontSize: "14px",
      color: "#ffd166",
      backgroundColor: "#06061a",
      padding: { x: 12, y: 6 },
    } as Phaser.Types.GameObjects.Text.TextStyle);
    this.hint.setOrigin(0.5);
    this.hint.setDepth(DEPTH.hud + 1);
    this.hint.setAlpha(0);

    this.scene.tweens.add({
      targets: this.hint,
      alpha: 1,
      duration: 220,
    });
    this.scene.time.delayedCall(durationMs, () => {
      if (!this.hint) return;
      const target = this.hint;
      this.scene.tweens.add({
        targets: target,
        alpha: 0,
        duration: 320,
        onComplete: () => target.destroy(),
      });
      this.hint = undefined;
    });
  }

  clearHint(): void {
    if (!this.hint) return;
    const target = this.hint;
    this.scene.tweens.add({
      targets: target,
      alpha: 0,
      duration: 220,
      onComplete: () => target.destroy(),
    });
    this.hint = undefined;
  }
}

export { COLORS };
