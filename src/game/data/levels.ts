import type { SlimeKind } from "../entities/SlimeEnemy";

export type PlatformSpec = {
  x: number;
  y: number;
  width: number;
  /** "short" uses the 48-wide texture, "wide" uses the 96-wide texture tiled. */
  style?: "short" | "wide";
};

export type SlimeSpawn = {
  kind: SlimeKind;
  x: number;
  y: number;
  facing?: 1 | -1;
};

export type LevelData = {
  id: number;
  name: string;
  hint?: string;
  player: { x: number; y: number };
  exit: { x: number; y: number };
  platforms: PlatformSpec[];
  slimes: SlimeSpawn[];
  boss?: { x: number; y: number };
  background?: "lab-blue" | "lab-purple" | "lab-amber";
};

/*
 * Coordinate system: 0..960 horizontal, 0..540 vertical.  The outer floor and
 * walls are added by LevelManager so each entry only needs to declare its own
 * interior platforms.
 */

export const LEVELS: readonly LevelData[] = [
  // 01 — Safe tutorial.  Only one stationary basic slime.
  {
    id: 1,
    name: "Calibration",
    hint: "Shoot (J / X / Click) to launch a containment field.",
    player: { x: 140, y: 420 },
    exit: { x: 880, y: 410 },
    platforms: [
      { x: 380, y: 380, width: 192, style: "wide" },
    ],
    slimes: [{ kind: "basic", x: 600, y: 440, facing: -1 }],
    background: "lab-blue",
  },

  // 02 — Reinforce trap+pop with two slimes
  {
    id: 2,
    name: "Tandem Trap",
    hint: "Pop the field by touching it — chain pops give bonus score.",
    player: { x: 100, y: 420 },
    exit: { x: 880, y: 220 },
    platforms: [
      { x: 240, y: 380, width: 144, style: "wide" },
      { x: 560, y: 320, width: 144, style: "wide" },
      { x: 800, y: 260, width: 144, style: "wide" },
    ],
    slimes: [
      { kind: "basic", x: 300, y: 340, facing: 1 },
      { kind: "basic", x: 620, y: 280, facing: -1 },
    ],
    background: "lab-blue",
  },

  // 03 — Three slimes, easy chain setup
  {
    id: 3,
    name: "Lab Floor",
    hint: "Trap two slimes side by side, then pop one for a chain reaction.",
    player: { x: 120, y: 420 },
    exit: { x: 120, y: 220 },
    platforms: [
      { x: 240, y: 380, width: 96, style: "wide" },
      { x: 624, y: 380, width: 96, style: "wide" },
      { x: 80, y: 260, width: 144, style: "wide" },
      { x: 736, y: 260, width: 144, style: "wide" },
    ],
    slimes: [
      { kind: "basic", x: 260, y: 340 },
      { kind: "basic", x: 480, y: 440 },
      { kind: "basic", x: 660, y: 340 },
    ],
    background: "lab-blue",
  },

  // 04 — Introduce bouncer
  {
    id: 4,
    name: "Pink Hoppers",
    hint: "Pink hoppers leap unpredictably. Catch them mid-air.",
    player: { x: 480, y: 420 },
    exit: { x: 880, y: 110 },
    platforms: [
      { x: 80, y: 380, width: 192, style: "wide" },
      { x: 384, y: 320, width: 192, style: "wide" },
      { x: 688, y: 260, width: 192, style: "wide" },
      { x: 80, y: 180, width: 192, style: "wide" },
      { x: 800, y: 150, width: 96, style: "wide" },
    ],
    slimes: [
      { kind: "basic", x: 120, y: 340 },
      { kind: "bouncer", x: 420, y: 280 },
      { kind: "bouncer", x: 720, y: 220 },
    ],
    background: "lab-purple",
  },

  // 05 — Tighter platforms, more chain pressure
  {
    id: 5,
    name: "Stack Drop",
    player: { x: 100, y: 420 },
    exit: { x: 880, y: 420 },
    platforms: [
      { x: 200, y: 410, width: 96, style: "wide" },
      { x: 400, y: 340, width: 96, style: "wide" },
      { x: 600, y: 270, width: 96, style: "wide" },
      { x: 400, y: 200, width: 96, style: "wide" },
      { x: 200, y: 130, width: 96, style: "wide" },
    ],
    slimes: [
      { kind: "basic", x: 220, y: 370 },
      { kind: "basic", x: 420, y: 300 },
      { kind: "bouncer", x: 620, y: 230 },
      { kind: "basic", x: 420, y: 160 },
    ],
    background: "lab-purple",
  },

  // 06 — Wide open chain arena
  {
    id: 6,
    name: "Containment Bay",
    player: { x: 480, y: 420 },
    exit: { x: 880, y: 110 },
    platforms: [
      { x: 80, y: 380, width: 96, style: "wide" },
      { x: 784, y: 380, width: 96, style: "wide" },
      { x: 240, y: 290, width: 96, style: "wide" },
      { x: 624, y: 290, width: 96, style: "wide" },
      { x: 432, y: 220, width: 96, style: "wide" },
      { x: 80, y: 150, width: 96, style: "wide" },
      { x: 784, y: 150, width: 96, style: "wide" },
    ],
    slimes: [
      { kind: "basic", x: 120, y: 340 },
      { kind: "basic", x: 820, y: 340 },
      { kind: "bouncer", x: 280, y: 250 },
      { kind: "bouncer", x: 660, y: 250 },
      { kind: "basic", x: 480, y: 180 },
    ],
    background: "lab-purple",
  },

  // 07 — Introduce charger
  {
    id: 7,
    name: "Charge Lane",
    hint: "Orange chargers telegraph before dashing. Use the platforms.",
    player: { x: 380, y: 200 },
    exit: { x: 880, y: 410 },
    platforms: [
      { x: 380, y: 230, width: 192, style: "wide" },
      { x: 80, y: 320, width: 144, style: "wide" },
      { x: 736, y: 320, width: 144, style: "wide" },
    ],
    slimes: [
      { kind: "charger", x: 200, y: 440 },
      { kind: "charger", x: 760, y: 440 },
      { kind: "basic", x: 480, y: 190 },
    ],
    background: "lab-amber",
  },

  // 08 — Charger + bouncer combo
  {
    id: 8,
    name: "Crossfire",
    player: { x: 100, y: 420 },
    exit: { x: 880, y: 110 },
    platforms: [
      { x: 240, y: 380, width: 96, style: "wide" },
      { x: 624, y: 380, width: 96, style: "wide" },
      { x: 432, y: 290, width: 96, style: "wide" },
      { x: 80, y: 200, width: 192, style: "wide" },
      { x: 688, y: 200, width: 192, style: "wide" },
      { x: 432, y: 110, width: 96, style: "wide" },
    ],
    slimes: [
      { kind: "charger", x: 480, y: 440 },
      { kind: "bouncer", x: 280, y: 340 },
      { kind: "bouncer", x: 660, y: 340 },
      { kind: "basic", x: 480, y: 250 },
      { kind: "basic", x: 140, y: 160 },
      { kind: "basic", x: 820, y: 160 },
    ],
    background: "lab-amber",
  },

  // 09 — Introduce shield slime
  {
    id: 9,
    name: "Plated Lab Rats",
    hint: "Cyan plated slimes need two trap+pop cycles to defeat.",
    player: { x: 480, y: 420 },
    exit: { x: 120, y: 110 },
    platforms: [
      { x: 80, y: 380, width: 144, style: "wide" },
      { x: 736, y: 380, width: 144, style: "wide" },
      { x: 384, y: 300, width: 192, style: "wide" },
      { x: 80, y: 200, width: 192, style: "wide" },
      { x: 688, y: 200, width: 192, style: "wide" },
    ],
    slimes: [
      { kind: "shield", x: 120, y: 340 },
      { kind: "shield", x: 820, y: 340 },
      { kind: "basic", x: 480, y: 260 },
      { kind: "bouncer", x: 200, y: 160 },
    ],
    background: "lab-amber",
  },

  // 10 — Mixed mayhem
  {
    id: 10,
    name: "Reactor Overflow",
    player: { x: 100, y: 420 },
    exit: { x: 880, y: 110 },
    platforms: [
      { x: 240, y: 410, width: 96, style: "wide" },
      { x: 480, y: 360, width: 96, style: "wide" },
      { x: 720, y: 310, width: 96, style: "wide" },
      { x: 480, y: 240, width: 96, style: "wide" },
      { x: 240, y: 190, width: 96, style: "wide" },
      { x: 720, y: 170, width: 96, style: "wide" },
      { x: 432, y: 110, width: 96, style: "wide" },
    ],
    slimes: [
      { kind: "basic", x: 260, y: 370 },
      { kind: "bouncer", x: 500, y: 320 },
      { kind: "charger", x: 740, y: 270 },
      { kind: "bouncer", x: 500, y: 200 },
      { kind: "shield", x: 740, y: 130 },
      { kind: "basic", x: 480, y: 70 },
    ],
    background: "lab-purple",
  },

  // 11 — Last gauntlet before boss
  {
    id: 11,
    name: "Containment Failure",
    player: { x: 480, y: 200 },
    exit: { x: 480, y: 50 },
    platforms: [
      { x: 240, y: 410, width: 96, style: "wide" },
      { x: 624, y: 410, width: 96, style: "wide" },
      { x: 80, y: 330, width: 96, style: "wide" },
      { x: 784, y: 330, width: 96, style: "wide" },
      { x: 240, y: 250, width: 96, style: "wide" },
      { x: 624, y: 250, width: 96, style: "wide" },
      { x: 432, y: 160, width: 96, style: "wide" },
      { x: 80, y: 110, width: 96, style: "wide" },
      { x: 784, y: 110, width: 96, style: "wide" },
    ],
    slimes: [
      { kind: "charger", x: 280, y: 440 },
      { kind: "charger", x: 680, y: 440 },
      { kind: "shield", x: 120, y: 290 },
      { kind: "shield", x: 820, y: 290 },
      { kind: "bouncer", x: 280, y: 210 },
      { kind: "bouncer", x: 680, y: 210 },
      { kind: "basic", x: 480, y: 120 },
    ],
    background: "lab-purple",
  },

  // 12 — Boss finale
  {
    id: 12,
    name: "Reactor Core",
    hint: "Shoot containment fields at the Reactor Blob — each hit damages it.",
    player: { x: 480, y: 420 },
    exit: { x: 480, y: 50 },
    platforms: [
      { x: 80, y: 380, width: 144, style: "wide" },
      { x: 736, y: 380, width: 144, style: "wide" },
      { x: 80, y: 220, width: 144, style: "wide" },
      { x: 736, y: 220, width: 144, style: "wide" },
      { x: 384, y: 300, width: 192, style: "wide" },
    ],
    slimes: [],
    // Boss patrols at y=200 so the player can shoot it from the y=220
    // side platforms.  At y=130 it was floating above every reachable
    // shooting position, leaving the player no way to land a hit.
    boss: { x: 480, y: 200 },
    background: "lab-amber",
  },
];

export const LEVEL_COUNT = LEVELS.length;
