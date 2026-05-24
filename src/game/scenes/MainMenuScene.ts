import Phaser from "phaser";
import {
  COLORS,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_TITLE,
  GAME_VERSION,
  GAME_WIDTH,
  SCENES,
  TEX,
} from "../constants";
import { audio } from "../systems/AudioSystem";
import type { SaveSystem } from "../systems/SaveSystem";

type MenuButton = {
  bg: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
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

    this.buildBackground();
    this.buildTitle();
    this.buildButtons();
    this.buildHeroPreview();
    this.buildFooter();
    this.installKeyboard();
  }

  private buildBackground(): void {
    const g = this.add.graphics();
    g.fillStyle(COLORS.bgDeep, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const grad = this.add.graphics();
    grad.fillStyle(0x0c1244, 0.6);
    grad.fillCircle(GAME_WIDTH * 0.7, GAME_HEIGHT * 0.4, 320);
    grad.fillStyle(COLORS.neonPink, 0.06);
    grad.fillCircle(GAME_WIDTH * 0.25, GAME_HEIGHT * 0.7, 260);

    // floor strip
    const floor = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 26, GAME_WIDTH, 60, 0x121542);
    floor.setStrokeStyle(2, COLORS.neonCyan, 1);

    // floating sparks
    for (let i = 0; i < 18; i++) {
      const dot = this.add.image(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT - 80),
        TEX.particle
      );
      dot.setTint(i % 3 === 0 ? COLORS.neonPink : COLORS.neonCyan);
      dot.setAlpha(0.5);
      dot.setScale(0.4 + Math.random() * 0.6);
      this.tweens.add({
        targets: dot,
        y: dot.y - 40 - Math.random() * 80,
        alpha: 0,
        duration: 2400 + Math.random() * 2000,
        repeat: -1,
        yoyo: false,
        delay: Math.random() * 2000,
        onRepeat: () => {
          dot.y = GAME_HEIGHT + 20;
          dot.x = Phaser.Math.Between(0, GAME_WIDTH);
          dot.setAlpha(0.5);
        },
      });
    }
  }

  private buildTitle(): void {
    const t = this.add.text(GAME_WIDTH / 2, 110, GAME_TITLE.toUpperCase(), {
      fontFamily: FONT_FAMILY,
      fontStyle: "900",
      fontSize: "52px",
      color: "#6ffcff",
      stroke: "#06061a",
      strokeThickness: 6,
      letterSpacing: 4,
    } as Phaser.Types.GameObjects.Text.TextStyle);
    t.setOrigin(0.5);
    t.setShadow(0, 4, "#0d1b3a", 8, false, true);

    const sub = this.add.text(GAME_WIDTH / 2, 160, "Containment Arcade", {
      fontFamily: FONT_FAMILY,
      fontSize: "16px",
      color: "#ff6cf2",
      fontStyle: "bold",
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

    const startY = 250;
    for (let i = 0; i < this.items.length; i++) {
      const y = startY + i * 56;
      const bg = this.add.rectangle(GAME_WIDTH / 2, y, 260, 44, 0x121542, 0.7);
      bg.setStrokeStyle(2, COLORS.neonCyan, 0.8);
      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerover", () => this.select(i));
      bg.on("pointerdown", () => {
        audio.uiClick();
        this.items[i].action();
      });

      const label = this.add.text(GAME_WIDTH / 2, y, this.items[i].label, {
        fontFamily: FONT_FAMILY,
        fontStyle: "bold",
        fontSize: "18px",
        color: "#e7f6ff",
      });
      label.setOrigin(0.5);

      this.buttons.push({ bg, label });
    }
    this.select(0);
  }

  private buildHeroPreview(): void {
    const heroX = GAME_WIDTH * 0.78;
    const heroY = GAME_HEIGHT * 0.55;

    const bot = this.add.image(heroX, heroY, TEX.player);
    bot.setScale(2.4);

    this.tweens.add({
      targets: bot,
      y: heroY - 6,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const slime = this.add.image(heroX - 50, heroY + 30, TEX.slimeBasic);
    slime.setScale(1.6);
    this.tweens.add({
      targets: slime,
      scaleX: 1.7,
      scaleY: 1.5,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const field = this.add.image(heroX - 24, heroY - 30, TEX.field);
    field.setScale(1.6);
    field.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: field,
      scale: 1.85,
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
        btn.bg.setFillStyle(0x1c2a4a, 0.9);
        btn.label.setColor("#ffd166");
      } else {
        btn.bg.setStrokeStyle(2, COLORS.neonCyan, 0.5);
        btn.bg.setFillStyle(0x121542, 0.7);
        btn.label.setColor("#e7f6ff");
      }
    });
  }

  private startGame(): void {
    this.scene.start(SCENES.Game, { level: 0, freshRun: true });
  }
}
