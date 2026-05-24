import Phaser from "phaser";
import {
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_TITLE,
  GAME_VERSION,
  GAME_WIDTH,
  LOGICAL_SCALE,
  SCENES,
  TEX,
} from "../constants";
import { LEVEL_COUNT } from "../data/levels";
import { audio } from "../systems/AudioSystem";
import type { SaveSystem } from "../systems/SaveSystem";
import { addChromeButton, addSceneBackdrop } from "../ui/SceneChrome";

type MenuButton = {
  bg: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  edge: Phaser.GameObjects.Rectangle;
};

export class MainMenuScene extends Phaser.Scene {
  private buttons: MenuButton[] = [];
  private selectedIndex = 0;
  private items: Array<{ label: string; action: () => void }> = [];

  constructor() {
    super(SCENES.MainMenu);
  }

  create(): void {
    audio.attach(this);
    audio.startMusic();
    audio.setMusicIntensity(0);

    this.buildBackground();
    this.buildTitle();
    this.buildButtons();
    this.buildHeroPreview();
    this.buildFooter();
    this.installKeyboard();
    if (this.registry.get("debug") === true) {
      this.buildDebugLevelGrid();
    }
  }

  private buildBackground(): void {
    addSceneBackdrop(this, "blue");
  }

  private buildTitle(): void {
    const titleX = GAME_WIDTH * 0.36;
    const t = this.add.text(titleX, 104, GAME_TITLE.toUpperCase(), {
      fontFamily: FONT_FAMILY,
      fontStyle: "900",
      fontSize: "48px",
      color: "#6ffcff",
      stroke: "#06061a",
      strokeThickness: 6,
      letterSpacing: 4,
    } as Phaser.Types.GameObjects.Text.TextStyle);
    t.setOrigin(0.5);
    t.setShadow(0, 5, "#0d1b3a", 10, false, true);

    const sub = this.add.text(titleX, 155, "Containment Arcade", {
      fontFamily: FONT_FAMILY,
      fontSize: "16px",
      color: "#ff6cf2",
      fontStyle: "bold",
      letterSpacing: 3,
    });
    sub.setOrigin(0.5);

    this.tweens.add({
      targets: [t],
      scale: 1.02,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private buildButtons(): void {
    this.items = [
      { label: "PLAY", action: () => this.startGame() },
      { label: "HOW TO PLAY", action: () => this.scene.start(SCENES.HowToPlay) },
      { label: "OPTIONS", action: () => this.scene.start(SCENES.Options) },
    ];

    const startY = 258;
    const buttonX = GAME_WIDTH * 0.34;
    for (let i = 0; i < this.items.length; i++) {
      const y = startY + i * 56;
      const button = addChromeButton(this, buttonX, y, 280, 44, this.items[i].label, COLORS.neonCyan, () => {
        audio.uiClick();
        this.items[i].action();
      });
      button.bg.on("pointerover", () => this.select(i));
      this.buttons.push(button);
    }
    this.select(0);
  }

  private buildHeroPreview(): void {
    const heroX = GAME_WIDTH * 0.74;
    const heroY = GAME_HEIGHT * 0.58;
    const platform = this.add.image(heroX, heroY + 74, TEX.platform);
    platform.setDisplaySize(260, 34);
    platform.setDepth(1);

    const ring = this.add.image(heroX - 6, heroY - 6, TEX.shockwave);
    ring.setTint(COLORS.neonCyan);
    ring.setAlpha(0.35);
    ring.setScale(3.3 * LOGICAL_SCALE);
    ring.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: ring,
      angle: 360,
      duration: 9000,
      repeat: -1,
      ease: "Linear",
    });

    // All textures baked at TEX_SUPERSAMPLE× density — every scale is multiplied
    // by LOGICAL_SCALE so the on-screen size matches the original design.
    const bot = this.add.image(heroX, heroY, TEX.player);
    bot.setScale(3.1 * LOGICAL_SCALE);
    bot.setDepth(2);

    this.tweens.add({
      targets: bot,
      y: heroY - 6,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const slime = this.add.image(heroX - 74, heroY + 42, TEX.slimeBasic);
    slime.setScale(2.25 * LOGICAL_SCALE);
    slime.setDepth(2);
    this.tweens.add({
      targets: slime,
      scaleX: 2.4 * LOGICAL_SCALE,
      scaleY: 2.05 * LOGICAL_SCALE,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const field = this.add.image(heroX - 38, heroY - 38, TEX.field);
    field.setScale(2.2 * LOGICAL_SCALE);
    field.setBlendMode(Phaser.BlendModes.ADD);
    field.setDepth(3);
    this.tweens.add({
      targets: field,
      scale: 2.55 * LOGICAL_SCALE,
      alpha: 0.7,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private buildFooter(): void {
    const save = this.registry.get("save") as SaveSystem | undefined;
    const best = save?.data.bestLevel ?? 0;
    const bestScore = save?.data.bestScore ?? 0;

    const footer = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 36,
      `BEST LEVEL ${best} / 12     BEST SCORE ${bestScore.toLocaleString()}`,
      {
        fontFamily: FONT_FAMILY,
        fontSize: "12px",
        color: "#9bb0c8",
        letterSpacing: 2,
      } as Phaser.Types.GameObjects.Text.TextStyle
    );
    footer.setOrigin(0.5);

    const ver = this.add.text(
      GAME_WIDTH - 12,
      GAME_HEIGHT - 12,
      `v${GAME_VERSION}`,
      {
        fontFamily: FONT_FAMILY,
        fontSize: "11px",
        color: "#445",
      }
    );
    ver.setOrigin(1, 1);
  }

  private installKeyboard(): void {
    this.input.keyboard?.on("keydown-DOWN", () => {
      this.select((this.selectedIndex + 1) % this.items.length);
      audio.uiClick();
    });
    this.input.keyboard?.on("keydown-S", () => {
      this.select((this.selectedIndex + 1) % this.items.length);
      audio.uiClick();
    });
    this.input.keyboard?.on("keydown-UP", () => {
      this.select((this.selectedIndex - 1 + this.items.length) % this.items.length);
      audio.uiClick();
    });
    this.input.keyboard?.on("keydown-W", () => {
      this.select((this.selectedIndex - 1 + this.items.length) % this.items.length);
      audio.uiClick();
    });
    const confirm = () => {
      audio.uiClick();
      this.items[this.selectedIndex].action();
    };
    this.input.keyboard?.on("keydown-ENTER", confirm);
    this.input.keyboard?.on("keydown-SPACE", confirm);
  }

  private select(i: number): void {
    this.selectedIndex = i;
    this.buttons.forEach((btn, idx) => {
      if (idx === i) {
        btn.bg.setStrokeStyle(3, COLORS.neonPink, 1);
        btn.bg.setFillStyle(0x17204d, 0.96);
        btn.edge.setFillStyle(COLORS.neonPink, 0.85);
        btn.label.setColor("#ffd166");
      } else {
        btn.bg.setStrokeStyle(2, COLORS.neonCyan, 0.58);
        btn.bg.setFillStyle(0x10173a, 0.88);
        btn.edge.setFillStyle(COLORS.neonCyan, 0.45);
        btn.label.setColor("#e7f6ff");
      }
    });
  }

  private startGame(): void {
    this.scene.start(SCENES.Game, { level: 0, freshRun: true });
  }

  /**
   * Dev-only quick-jump grid.  Rendered only when `?debug=1` is in the URL.
   * Twelve numbered buttons that start a fresh run at the picked level — no
   * need to grind through 1–11 when iterating on later levels.
   */
  private buildDebugLevelGrid(): void {
    const cellSize = 32;
    const gap = 4;
    const totalWidth = LEVEL_COUNT * cellSize + (LEVEL_COUNT - 1) * gap;
    const startX = (GAME_WIDTH - totalWidth) / 2 + cellSize / 2;
    const y = GAME_HEIGHT - 70;

    const label = this.add.text(GAME_WIDTH / 2, y - 26, "DEBUG: SKIP TO LEVEL", {
      fontFamily: FONT_FAMILY,
      fontStyle: "bold",
      fontSize: "11px",
      color: "#ff6cf2",
      letterSpacing: 2,
    } as Phaser.Types.GameObjects.Text.TextStyle);
    label.setOrigin(0.5);

    for (let i = 0; i < LEVEL_COUNT; i++) {
      const x = startX + i * (cellSize + gap);
      const cell = this.add.rectangle(x, y, cellSize, cellSize, 0x1c1144, 0.85);
      cell.setStrokeStyle(1, COLORS.neonPink, 0.6);
      cell.setInteractive({ useHandCursor: true });
      const num = this.add.text(x, y, `${i + 1}`, {
        fontFamily: FONT_FAMILY,
        fontStyle: "900",
        fontSize: "14px",
        color: "#e7f6ff",
      });
      num.setOrigin(0.5);
      cell.on("pointerover", () => {
        cell.setStrokeStyle(2, COLORS.neonGold, 1);
        num.setColor("#ffd166");
      });
      cell.on("pointerout", () => {
        cell.setStrokeStyle(1, COLORS.neonPink, 0.6);
        num.setColor("#e7f6ff");
      });
      cell.on("pointerdown", () => {
        audio.uiClick();
        this.scene.start(SCENES.Game, { level: i, freshRun: true });
      });
    }
  }
}
