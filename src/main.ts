import Phaser from "phaser";
import { createGameConfig } from "./game/config";

function hideBootOverlay(): void {
  const overlay = document.getElementById("boot-overlay");
  if (!overlay) return;
  overlay.classList.add("hidden");
  window.setTimeout(() => overlay.remove(), 600);
}

window.addEventListener("DOMContentLoaded", () => {
  const game = new Phaser.Game(createGameConfig());

  game.events.once(Phaser.Core.Events.READY, () => {
    hideBootOverlay();
  });

  window.addEventListener("resize", () => {
    game.scale.refresh();
  });
});
