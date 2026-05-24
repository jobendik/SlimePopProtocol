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
  private hintBg?: Phaser.GameObjects.Graphics;
  private hintTimer?: Phaser.Time.TimerEvent;
  private shieldIcon?: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const panel = scene.add.graphics();
    panel.fillStyle(0x000000, 0.22);
    panel.fillRoundedRect(12, 12, 276, 44, 8);
    panel.fillStyle(0x070b22, 0.82);
    panel.fillRoundedRect(8, 8, 276, 44, 8);
    panel.lineStyle(2, COLORS.neonCyan, 0.55);
    panel.strokeRoundedRect(8, 8, 276, 44, 8);
    panel.fillStyle(COLORS.neonCyan, 0.65);
    panel.fillRect(24, 8, 96, 3);
    panel.fillStyle(0xffffff, 0.06);
    panel.fillRoundedRect(12, 12, 268, 15, 6);
    panel.setDepth(DEPTH.hud);

    // Hearts — textures baked at TEX_SUPERSAMPLE× density.
    for (let i = 0; i < PLAYER.maxHearts; i++) {
      const h = scene.add.image(30 + i * 28, 27, TEX.heart);
      h.setDepth(DEPTH.hud + 1);
      h.setScale(LOGICAL_SCALE);
      this.hearts.push(h);
    }

    // Level label
    this.levelLabel = scene.add.text(142, 18, "LEVEL 1", {
      fontFamily: FONT_FAMILY,
      fontStyle: "bold",
      fontSize: "12px",
      color: "#6ffcff",
      letterSpacing: 2,
    } as Phaser.Types.GameObjects.Text.TextStyle);
    this.levelLabel.setDepth(DEPTH.hud + 1);

    // Score
    const scorePanel = scene.add.graphics();
    scorePanel.fillStyle(0x000000, 0.22);
    scorePanel.fillRoundedRect(GAME_WIDTH - 276, 12, 264, 44, 8);
    scorePanel.fillStyle(0x070b22, 0.82);
    scorePanel.fillRoundedRect(GAME_WIDTH - 280, 8, 272, 44, 8);
    scorePanel.lineStyle(2, COLORS.neonGold, 0.55);
    scorePanel.strokeRoundedRect(GAME_WIDTH - 280, 8, 272, 44, 8);
    scorePanel.fillStyle(COLORS.neonGold, 0.7);
    scorePanel.fillRect(GAME_WIDTH - 112, 8, 82, 3);
    scorePanel.fillStyle(0xffffff, 0.06);
    scorePanel.fillRoundedRect(GAME_WIDTH - 276, 12, 264, 15, 6);
    scorePanel.setDepth(DEPTH.hud);

    this.scoreLabel = scene.add.text(GAME_WIDTH - 18, 16, "0", {
      fontFamily: FONT_FAMILY,
      fontStyle: "bold",
      fontSize: "22px",
      color: "#e7f6ff",
      stroke: "#06061a",
      strokeThickness: 3,
    });
    this.scoreLabel.setOrigin(1, 0);
    this.scoreLabel.setDepth(DEPTH.hud + 1);

    this.scrapIcon = scene.add.image(GAME_WIDTH - 248, 33, TEX.scrap);
    this.scrapIcon.setDepth(DEPTH.hud + 1);
    this.scrapIcon.setScale(LOGICAL_SCALE);
    this.scrapLabel = scene.add.text(GAME_WIDTH - 236, 33, "0", {
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
      fontSize: "24px",
      color: "#ff6cf2",
      stroke: "#06061a",
      strokeThickness: 5,
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
      const x = idx * 34;
      const back = this.scene.add.rectangle(x + 14, 14, 28, 28, 0x070b22, 0.86);
      back.setStrokeStyle(1, e.color, 0.65);
      const circle = this.scene.add.circle(x + 14, 14, 10, e.color, 0.24);
      circle.setStrokeStyle(1.4, e.color, 0.95);
      const txt = this.scene.add.text(x + 12, 12, e.icon, {
        fontFamily: FONT_FAMILY,
        fontStyle: "bold",
        fontSize: "13px",
        color: "#ffffff",
      });
      txt.setOrigin(0.5);
      txt.setPosition(x + 14, 14);
      this.upgradeRow.add(back);
      this.upgradeRow.add(circle);
      this.upgradeRow.add(txt);
      this.upgradeRowChildren.push(back, circle, txt);
      if (e.stacks > 1) {
        const stackLbl = this.scene.add.text(x + 24, 22, `x${e.stacks}`, {
          fontFamily: FONT_FAMILY,
          fontStyle: "bold",
          fontSize: "10px",
          color: "#ffd166",
          stroke: "#06061a",
          strokeThickness: 2,
        });
        this.upgradeRow.add(stackLbl);
        this.upgradeRowChildren.push(stackLbl);
      }
    });
  }

  setShield(active: boolean): void {
    if (active && !this.shieldIcon) {
      this.shieldIcon = this.scene.add.image(258, 29, TEX.particle);
      this.shieldIcon.setTint(0xcfe9ff);
      this.shieldIcon.setScale(1.35 * LOGICAL_SCALE);
      this.shieldIcon.setDepth(DEPTH.hud + 1);
      this.shieldIcon.setBlendMode(Phaser.BlendModes.ADD);
    } else if (!active && this.shieldIcon) {
      this.shieldIcon.destroy();
      this.shieldIcon = undefined;
    }
  }

  showHint(text: string, durationMs = 4500): void {
    this.hintTimer?.remove();
    this.hint?.destroy();
    this.hintBg?.destroy();
    const width = Math.min(620, Math.max(260, text.length * 9 + 36));
    this.hintBg = this.scene.add.graphics();
    this.hintBg.fillStyle(0x000000, 0.22);
    this.hintBg.fillRoundedRect(GAME_WIDTH / 2 - width / 2 + 5, 68, width, 34, 8);
    this.hintBg.fillStyle(0x090d24, 0.9);
    this.hintBg.fillRoundedRect(GAME_WIDTH / 2 - width / 2, 64, width, 34, 8);
    this.hintBg.lineStyle(2, COLORS.neonGold, 0.8);
    this.hintBg.strokeRoundedRect(GAME_WIDTH / 2 - width / 2, 64, width, 34, 8);
    this.hintBg.fillStyle(COLORS.neonGold, 0.35);
    this.hintBg.fillRect(GAME_WIDTH / 2 - width / 2 + 14, 64, width - 28, 2);
    this.hintBg.setDepth(DEPTH.hud + 1);
    this.hintBg.setAlpha(0);

    this.hint = this.scene.add.text(GAME_WIDTH / 2, 80, text, {
      fontFamily: FONT_FAMILY,
      fontStyle: "bold",
      fontSize: "14px",
      color: "#ffd166",
      stroke: "#06061a",
      strokeThickness: 3,
    } as Phaser.Types.GameObjects.Text.TextStyle);
    this.hint.setOrigin(0.5);
    this.hint.setDepth(DEPTH.hud + 2);
    this.hint.setAlpha(0);

    this.scene.tweens.add({
      targets: [this.hint, this.hintBg],
      alpha: 1,
      duration: 220,
    });
    this.hintTimer = this.scene.time.delayedCall(durationMs, () => {
      if (!this.hint || !this.hintBg) return;
      const target = this.hint;
      const bg = this.hintBg;
      this.scene.tweens.add({
        targets: [target, bg],
        alpha: 0,
        duration: 320,
        onComplete: () => {
          target.destroy();
          bg.destroy();
        },
      });
      this.hint = undefined;
      this.hintBg = undefined;
      this.hintTimer = undefined;
    });
  }

  clearHint(): void {
    this.hintTimer?.remove();
    this.hintTimer = undefined;
    if (!this.hint && !this.hintBg) return;
    const target = this.hint;
    const bg = this.hintBg;
    const fadeTargets = [target, bg].filter(
      (obj): obj is Phaser.GameObjects.Text | Phaser.GameObjects.Graphics => !!obj
    );
    this.scene.tweens.add({
      targets: fadeTargets,
      alpha: 0,
      duration: 220,
      onComplete: () => {
        target?.destroy();
        bg?.destroy();
      },
    });
    this.hint = undefined;
    this.hintBg = undefined;
  }
}

export { COLORS };
