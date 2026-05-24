import Phaser from "phaser";
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from "./constants";
import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { HowToPlayScene } from "./scenes/HowToPlayScene";
import { OptionsScene } from "./scenes/OptionsScene";
import { GameScene } from "./scenes/GameScene";
import { HudScene } from "./scenes/HudScene";
import { PauseScene } from "./scenes/PauseScene";
import { UpgradeScene } from "./scenes/UpgradeScene";
import { LevelCompleteScene } from "./scenes/LevelCompleteScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { VictoryScene } from "./scenes/VictoryScene";

export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: "game-root",
    backgroundColor: COLORS.bgDeep,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelArt: false,
    antialias: true,
    roundPixels: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 1100 },
        debug: false,
        fps: 60,
      },
    },
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
    dom: {
      createContainer: false,
    },
    render: {
      powerPreference: "high-performance",
      transparent: false,
    },
    input: {
      gamepad: true,
      // Joystick + jump + shoot need three simultaneous touches; bump to 4 for safety.
      activePointers: 4,
    },
    audio: {
      disableWebAudio: false,
    },
    scene: [
      BootScene,
      PreloadScene,
      MainMenuScene,
      HowToPlayScene,
      OptionsScene,
      GameScene,
      HudScene,
      PauseScene,
      UpgradeScene,
      LevelCompleteScene,
      GameOverScene,
      VictoryScene,
    ],
  };
}
