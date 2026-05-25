import Phaser from "phaser";
import {
  DEPTH,
  GAME_HEIGHT,
  GAME_TITLE,
  GAME_VERSION,
  GAME_WIDTH,
  SCENES,
} from "../constants";
import { LEVEL_COUNT } from "../data/levels";
import { audio } from "../systems/AudioSystem";
import { CssVisual } from "../systems/CssVisual";
import type { SaveSystem } from "../systems/SaveSystem";
import {
  addChromeButton,
  addCssFooter,
  addCssText,
  addSceneBackdrop,
  addSceneTitle,
  type ChromeButton,
} from "../ui/SceneChrome";

export class MainMenuScene extends Phaser.Scene {
  private buttons: ChromeButton[] = [];
  private selectedIndex = 0;
  private items: Array<{ label: string; action: () => void }> = [];

  constructor() {
    super(SCENES.MainMenu);
  }

  create(): void {
    audio.attach(this);
    audio.startMusic();
    audio.setMusicIntensity(0);

    addSceneBackdrop(this, "blue");
    this.buildTitle();
    this.buildButtons();
    this.buildHeroPreview();
    this.buildFooter();
    this.installKeyboard();
    if (this.registry.get("debug") === true) {
      this.buildDebugLevelGrid();
    }
  }

  private buildTitle(): void {
    addSceneTitle(this, GAME_WIDTH * 0.36, 130, GAME_TITLE.toUpperCase(), "Containment Arcade");
  }

  private buildButtons(): void {
    this.items = [
      { label: "PLAY", action: () => this.startGame() },
      { label: "HOW TO PLAY", action: () => this.scene.start(SCENES.HowToPlay) },
      { label: "OPTIONS", action: () => this.scene.start(SCENES.Options) },
    ];

    const startY = 270;
    const buttonX = GAME_WIDTH * 0.34;
    this.items.forEach((item, i) => {
      const y = startY + i * 60;
      const btn = addChromeButton(this, buttonX, y, 280, 48, item.label, "#6ffcff", () => {
        audio.uiClick();
        item.action();
      });
      btn.visual.node.addEventListener("pointerenter", () => this.select(i));
      this.buttons.push(btn);
    });
    this.select(0);
  }

  /**
   * Cute CSS-rendered diorama: a player robot standing on a platform with a
   * slime mid-trap inside a containment field, all idle-animated by CSS
   * keyframes.  No physics, just visuals.
   */
  private buildHeroPreview(): void {
    const heroX = GAME_WIDTH * 0.74;
    const heroY = GAME_HEIGHT * 0.58;

    // Decorative platform
    const platform = new CssVisual(this, "cv-platform", {
      depth: DEPTH.hud - 2,
      pixelWidth: 260,
      pixelHeight: 22,
    });
    const bolts = Array.from({ length: 7 }, () => `<span></span>`).join("");
    platform.setHtml(`
      <div class="plat-body"></div>
      <div class="plat-bolts">${bolts}</div>
      <div class="plat-rail"></div>
    `);
    platform.setPosition(heroX, heroY + 80);
    platform.dom.setScale(1.1, 1.1);

    // Player robot, slightly enlarged for the title screen
    const bot = new CssVisual(this, "cv-player", { depth: DEPTH.hud - 1 });
    bot.setHtml(`
      <div class="bot-rails"></div>
      <div class="bot-legs"></div>
      <div class="bot-boots"><span></span><span></span></div>
      <div class="bot-body"></div>
      <div class="bot-core"></div>
      <div class="bot-helmet"></div>
      <div class="bot-visor"></div>
      <div class="bot-antenna"></div>
    `);
    bot.setPosition(heroX + 28, heroY + 38);
    bot.dom.setScale(2.6, 2.6);
    this.tweens.add({
      targets: bot.dom,
      y: heroY + 32,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // A slime peeking from the side
    const slime = new CssVisual(this, "cv-slime cv-slime-basic", { depth: DEPTH.hud - 1 });
    slime.setHtml(`
      <div class="slime-shadow"></div>
      <div class="slime-body"></div>
      <div class="slime-eyes"><span></span><span></span></div>
      <div class="slime-mouth"></div>
    `);
    slime.setPosition(heroX - 76, heroY + 60);
    slime.dom.setScale(1.85, 1.85);
    this.tweens.add({
      targets: slime.dom,
      y: heroY + 56,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Active containment field overlapping the robot's emitter
    const field = new CssVisual(this, "cv-field", { depth: DEPTH.hud });
    field.setHtml(`
      <div class="field-orb"></div>
      <div class="field-glint"></div>
    `);
    field.setPosition(heroX - 18, heroY - 12);
    field.dom.setScale(1.7, 1.7);
    this.tweens.add({
      targets: field.dom,
      scaleX: 1.95,
      scaleY: 1.5,
      duration: 920,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private buildFooter(): void {
    const save = this.registry.get("save") as SaveSystem | undefined;
    const best = save?.data.bestLevel ?? 0;
    const bestScore = save?.data.bestScore ?? 0;

    addCssFooter(
      this,
      `BEST LEVEL <strong>${best} / ${LEVEL_COUNT}</strong>` +
      `&nbsp;&nbsp;·&nbsp;&nbsp;` +
      `BEST SCORE <strong>${bestScore.toLocaleString()}</strong>`
    );

    // Version label at bottom-right
    addCssText(this, GAME_WIDTH - 28, GAME_HEIGHT - 12, `v${GAME_VERSION}`, {
      size: 11,
      color: "#5a607c",
      weight: 600,
      letterSpacing: 1,
      align: "right",
      width: 80,
    });
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
    this.buttons.forEach((btn, idx) => btn.setSelected(idx === i));
  }

  private startGame(): void {
    this.scene.start(SCENES.Game, { level: 0, freshRun: true });
  }

  /**
   * Dev-only quick-jump grid.  Rendered only when `?debug=1` is in the URL.
   */
  private buildDebugLevelGrid(): void {
    const cellSize = 32;
    const gap = 4;
    const totalWidth = LEVEL_COUNT * cellSize + (LEVEL_COUNT - 1) * gap;
    const startX = (GAME_WIDTH - totalWidth) / 2 + cellSize / 2;
    const y = GAME_HEIGHT - 80;

    addCssText(this, GAME_WIDTH / 2, y - 26, "DEBUG: SKIP TO LEVEL", {
      size: 11,
      color: "#ff6cf2",
      weight: 800,
      letterSpacing: 2,
    });

    for (let i = 0; i < LEVEL_COUNT; i++) {
      const x = startX + i * (cellSize + gap);
      const btn = addChromeButton(this, x, y, cellSize, cellSize, `${i + 1}`, "#ff6cf2", () => {
        audio.uiClick();
        this.scene.start(SCENES.Game, { level: i, freshRun: true });
      });
      // Compact label override
      const labelEl = btn.visual.node.querySelector(".btn-label") as HTMLElement;
      labelEl.style.fontSize = "13px";
      labelEl.style.letterSpacing = "0px";
    }
  }
}
