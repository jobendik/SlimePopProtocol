import Phaser from "phaser";
import { SCENES } from "../constants";
import { Hud } from "../ui/Hud";
import { isTouchDevice, TouchControls } from "../ui/TouchControls";
import { findUpgrade } from "../data/upgrades";
import type { UpgradeStacks } from "../systems/UpgradeSystem";

export type HudInitState = {
  hearts: number;
  level: number;
  totalLevels: number;
  score: number;
  scrap: number;
};

export type HudUpdatePayload = Partial<HudInitState> & {
  combo?: number;
  shield?: boolean;
  upgrades?: UpgradeStacks;
  hintText?: string;
  clearHint?: boolean;
};

/**
 * Sits on top of GameScene.  GameScene fires HUD events; this scene
 * just renders state.
 */
export class HudScene extends Phaser.Scene {
  private hud!: Hud;
  private touchControls?: TouchControls;

  constructor() {
    super(SCENES.Hud);
  }

  create(data: HudInitState): void {
    this.hud = new Hud(this);
    this.hud.setHearts(data.hearts);
    this.hud.setLevel(data.level, data.totalLevels);
    this.hud.setScore(data.score);
    this.hud.setScrap(data.scrap);

    if (isTouchDevice()) {
      this.touchControls = new TouchControls(this);
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.touchControls?.destroy();
      this.touchControls = undefined;
    });

    const gameScene = this.scene.get(SCENES.Game);
    gameScene.events.on("hud:update", (payload: HudUpdatePayload) => {
      if (payload.hearts !== undefined) this.hud.setHearts(payload.hearts);
      if (payload.level !== undefined && payload.totalLevels !== undefined) {
        this.hud.setLevel(payload.level, payload.totalLevels);
      }
      if (payload.score !== undefined) this.hud.setScore(payload.score);
      if (payload.scrap !== undefined) this.hud.setScrap(payload.scrap);
      if (payload.combo !== undefined) this.hud.setCombo(payload.combo);
      if (payload.shield !== undefined) this.hud.setShield(payload.shield);
      if (payload.upgrades) {
        const entries = Object.entries(payload.upgrades)
          .filter(([, stacks]) => (stacks ?? 0) > 0)
          .map(([id, stacks]) => {
            const def = findUpgrade(id as never);
            return { icon: def.icon, color: def.color, stacks: stacks ?? 0 };
          });
        this.hud.setUpgrades(entries);
      }
      if (payload.hintText) this.hud.showHint(payload.hintText);
      if (payload.clearHint) this.hud.clearHint();
    });
    gameScene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameScene.events.removeAllListeners("hud:update");
    });
  }
}
