import Phaser from "phaser";
import { createGameConfig } from "./game/config";
import { SCENES } from "./game/constants";
import { audio } from "./game/systems/AudioSystem";
import "./game/styles/game-graphics.css";

function hideBootOverlay(): void {
  const overlay = document.getElementById("boot-overlay");
  if (!overlay) return;
  overlay.classList.add("hidden");
  window.setTimeout(() => overlay.remove(), 600);
}

/**
 * Pause active gameplay and silence audio when the page is hidden or loses
 * focus.  Without this, the game keeps running in a background tab — wasting
 * CPU, draining mobile battery, and (worse) letting timers/physics fall out of
 * sync with rendering once the browser resumes the throttled rAF loop.
 *
 * We deliberately do NOT auto-resume gameplay on focus return.  The pause menu
 * stays open so the player chooses when to dive back in.  Audio context is
 * resumed automatically because it can't replay missed events anyway.
 */
function installVisibilityPause(game: Phaser.Game): void {
  const pauseGameplay = (): void => {
    audio.suspend();
    // Only intervene if the player is mid-game and not already paused.
    if (!game.scene.isActive(SCENES.Game)) return;
    if (game.scene.isActive(SCENES.Pause)) return;
    game.scene.pause(SCENES.Game);
    game.scene.run(SCENES.Pause);
  };

  const restoreAudio = (): void => {
    audio.resume();
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseGameplay();
    else restoreAudio();
  });
  window.addEventListener("blur", pauseGameplay);
  window.addEventListener("focus", restoreAudio);
}

window.addEventListener("DOMContentLoaded", () => {
  const game = new Phaser.Game(createGameConfig());

  game.events.once(Phaser.Core.Events.READY, () => {
    hideBootOverlay();
    installVisibilityPause(game);
  });

  window.addEventListener("resize", () => {
    game.scale.refresh();
  });
});
