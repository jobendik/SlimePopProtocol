import Phaser from "phaser";
import { LEVEL_COUNT } from "../data/levels";
import { SCENES } from "../constants";
import { CrazyGamesAdapter } from "../systems/CrazyGamesAdapter";

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.Boot);
  }

  create(): void {
    // Read dev/QA query params before any other scene runs so subsequent scenes
    // can branch on them.  Both are opt-in and stay quiet in normal play:
    //   ?debug=1   → show a level-skip grid on the main menu.
    //   ?level=N   → boot straight into level N (1..LEVEL_COUNT), bypassing the
    //                menu, with a fresh run state.  Useful for playtesting
    //                later levels without grinding through 1–11.
    const params = new URLSearchParams(window.location.search);
    this.registry.set("debug", params.get("debug") === "1");

    const levelParam = params.get("level");
    if (levelParam) {
      const parsed = parseInt(levelParam, 10);
      if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= LEVEL_COUNT) {
        // levels.ts uses 1-based ids but GameScene takes a 0-based index.
        this.registry.set("startLevelIndex", parsed - 1);
      }
    }

    // Fire-and-forget — SDK may or may not exist.
    void CrazyGamesAdapter.init();
    CrazyGamesAdapter.loadingStart();
    this.scene.start(SCENES.Preload);
  }
}
