import Phaser from "phaser";
import { COLORS, DEPTH, GAME_HEIGHT, GAME_WIDTH, PLAYER } from "../constants";
import { CssVisual } from "../systems/CssVisual";
import { formatScore } from "../utils/math";

/**
 * CSS-rendered HUD.  The entire widget lives in a single DOM element
 * pinned to (GAME_WIDTH/2, GAME_HEIGHT/2) so it scales with the canvas.
 * Public API matches the previous Phaser-graphics implementation, so
 * HudScene needs no changes.
 */
export class Hud {
  private scene: Phaser.Scene;
  private visual: CssVisual;
  private heartEls: HTMLElement[] = [];
  private levelEl: HTMLElement;
  private scoreEl: HTMLElement;
  private scrapEl: HTMLElement;
  private comboEl: HTMLElement;
  private comboMultEl: HTMLElement;
  private comboWordEl: HTMLElement;
  private hintEl: HTMLElement;
  private upgradesEl: HTMLElement;
  private currentHearts: number = PLAYER.maxHearts;
  private hintTimer?: Phaser.Time.TimerEvent;
  private scoreBumpTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.visual = new CssVisual(scene, "cv-hud", {
      depth: DEPTH.hud,
      pixelWidth: GAME_WIDTH,
      pixelHeight: GAME_HEIGHT,
    });
    this.visual.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    // Build the full HUD markup once; we keep refs to update children.
    const hearts = Array.from({ length: PLAYER.maxHearts }, () =>
      `<div class="hud-heart"><i></i></div>`
    ).join("");

    this.visual.setHtml(`
      <div class="hud-panel hud-left">
        <div class="hud-hearts">${hearts}</div>
        <div class="hud-level">LEVEL 1 / 1</div>
        <div class="hud-shield"></div>
      </div>
      <div class="hud-panel hud-right">
        <div class="hud-score"><span class="hud-score-label">SCORE</span><span class="hud-score-value">0</span></div>
        <div class="hud-scrap"><span class="hud-scrap-icon"></span><span class="hud-scrap-value">0</span></div>
      </div>
      <div class="hud-combo">
        <div class="hud-combo-mult">x2</div>
        <div class="hud-combo-word">COMBO</div>
      </div>
      <div class="hud-hint"></div>
      <div class="hud-upgrades"></div>
    `);

    const root = this.visual.node;
    this.heartEls = Array.from(root.querySelectorAll(".hud-heart")) as HTMLElement[];
    this.levelEl = root.querySelector(".hud-level") as HTMLElement;
    this.scoreEl = root.querySelector(".hud-score-value") as HTMLElement;
    this.scrapEl = root.querySelector(".hud-scrap-value") as HTMLElement;
    this.comboEl = root.querySelector(".hud-combo") as HTMLElement;
    this.comboMultEl = root.querySelector(".hud-combo-mult") as HTMLElement;
    this.comboWordEl = root.querySelector(".hud-combo-word") as HTMLElement;
    this.hintEl = root.querySelector(".hud-hint") as HTMLElement;
    this.upgradesEl = root.querySelector(".hud-upgrades") as HTMLElement;

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.hintTimer?.remove();
      this.scoreBumpTimer?.remove();
      this.visual.destroy();
    });
  }

  setHearts(count: number): void {
    const lost = count < this.currentHearts;
    this.heartEls.forEach((el, i) => {
      const filled = i < count;
      el.setAttribute("data-empty", filled ? "0" : "1");
      // Pop animation on the heart that was just lost
      if (lost && i === count) {
        el.setAttribute("data-pop", "1");
        this.scene.time.delayedCall(400, () => el.removeAttribute("data-pop"));
      }
    });
    this.currentHearts = count;
  }

  setLevel(num: number, total: number): void {
    this.levelEl.textContent = `LEVEL ${num} / ${total}`;
  }

  setScore(score: number): void {
    this.scoreEl.textContent = formatScore(score);
    const host = this.scoreEl.parentElement as HTMLElement;
    host.setAttribute("data-bump", "1");
    this.scoreBumpTimer?.remove();
    this.scoreBumpTimer = this.scene.time.delayedCall(300, () => {
      host.removeAttribute("data-bump");
    });
  }

  setScrap(scrap: number): void {
    this.scrapEl.textContent = `${scrap}`;
  }

  setCombo(chain: number): void {
    if (chain <= 1) {
      this.comboEl.setAttribute("data-visible", "0");
      return;
    }
    const word = chain >= 5 ? "MEGA POP" : chain >= 3 ? "CHAIN" : "COMBO";
    this.comboMultEl.textContent = `x${chain}`;
    this.comboWordEl.textContent = word;
    this.comboEl.setAttribute("data-tier", chain >= 5 ? "mega" : "norm");
    this.comboEl.setAttribute("data-visible", "1");
  }

  setUpgrades(entries: Array<{ icon: string; color: number; stacks: number }>): void {
    this.upgradesEl.innerHTML = entries
      .map((e) => {
        const hex = `#${e.color.toString(16).padStart(6, "0")}`;
        const r = (e.color >> 16) & 0xff;
        const g = (e.color >> 8) & 0xff;
        const b = e.color & 0xff;
        const glow = `rgba(${r}, ${g}, ${b}, 0.55)`;
        const stack = e.stacks > 1 ? `<span class="stack">x${e.stacks}</span>` : "";
        return `<div class="hud-upgrade" style="--up-color:${hex};--up-glow:${glow}">${e.icon}${stack}</div>`;
      })
      .join("");
  }

  setShield(active: boolean): void {
    this.visual.setState("shield", active ? 1 : null);
  }

  showHint(text: string, durationMs = 4500): void {
    this.hintTimer?.remove();
    this.hintEl.textContent = text;
    this.hintEl.setAttribute("data-visible", "1");
    this.hintTimer = this.scene.time.delayedCall(durationMs, () => {
      this.clearHint();
    });
  }

  clearHint(): void {
    this.hintTimer?.remove();
    this.hintTimer = undefined;
    this.hintEl.setAttribute("data-visible", "0");
  }
}

export { COLORS };
