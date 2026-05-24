import Phaser from "phaser";
import { SCENES } from "../constants";
import { CrazyGamesAdapter } from "../systems/CrazyGamesAdapter";

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.Boot);
  }

  create(): void {
    // Fire-and-forget — SDK may or may not exist.
    void CrazyGamesAdapter.init();
    CrazyGamesAdapter.loadingStart();
    this.scene.start(SCENES.Preload);
  }
}
