import Phaser from "phaser";
import { COLORS, FONT_FAMILY, GAME_HEIGHT, GAME_WIDTH, SCENES } from "../constants";
import { audio } from "../systems/AudioSystem";
import { CrazyGamesAdapter } from "../systems/CrazyGamesAdapter";
import { SaveSystem } from "../systems/SaveSystem";
import { TextureFactory } from "../systems/TextureFactory";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENES.Preload);
  }

  create(): void {
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.bgDeep, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.fillStyle(COLORS.bgFar, 0.6);
    bg.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 220);
    bg.fillStyle(COLORS.neonCyan, 0.08);
    bg.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 145);

    // Visual: loading bar while we generate textures
    const bar = this.add.graphics();
    const label = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 40,
      "GENERATING ASSETS...",
      {
        fontFamily: FONT_FAMILY,
        fontSize: "14px",
        color: "#6ffcff",
      }
    );
    label.setOrigin(0.5);

    const drawBar = (p: number) => {
      bar.clear();
      bar.fillStyle(0x000000, 0.25);
      bar.fillRoundedRect(GAME_WIDTH / 2 - 164, GAME_HEIGHT / 2 - 8, 328, 16, 6);
      bar.fillStyle(0x10173a, 1);
      bar.fillRoundedRect(GAME_WIDTH / 2 - 160, GAME_HEIGHT / 2 - 6, 320, 12, 4);
      bar.fillStyle(COLORS.neonCyan, 1);
      bar.fillRoundedRect(
        GAME_WIDTH / 2 - 156,
        GAME_HEIGHT / 2 - 2,
        Math.max(0, 312 * p),
        4,
        2
      );
      bar.fillStyle(0xffffff, 0.45);
      bar.fillRoundedRect(
        GAME_WIDTH / 2 - 156,
        GAME_HEIGHT / 2 - 2,
        Math.max(0, 312 * p),
        1,
        1
      );
    };
    drawBar(0.1);

    // Build textures in tiny tasks to keep the boot bar visible.
    const steps: Array<() => void> = [
      () => TextureFactory.buildAll(this),
      () => {
        const save = new SaveSystem();
        this.registry.set("save", save);
        audio.setSettings(save.settings);
      },
    ];

    let done = 0;
    const total = steps.length;
    const run = () => {
      if (done >= total) {
        drawBar(1);
        CrazyGamesAdapter.loadingStop();
        this.time.delayedCall(120, () => {
          // ?level=N (parsed in BootScene) takes the player straight into a
          // fresh run at that level, skipping the main menu.
          const startLevelIndex = this.registry.get("startLevelIndex");
          if (typeof startLevelIndex === "number") {
            this.scene.start(SCENES.Game, {
              level: startLevelIndex,
              freshRun: true,
            });
          } else {
            this.scene.start(SCENES.MainMenu);
          }
        });
        return;
      }
      const step = steps[done++];
      step();
      drawBar(done / total);
      this.time.delayedCall(40, run);
    };

    run();
  }
}
