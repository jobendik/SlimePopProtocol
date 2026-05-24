/**
 * Central tuning + identity constants for Slime Pop Protocol.
 *
 * All values are starting points pulled from the design brief.  Adjust here
 * rather than scattering magic numbers across the codebase.
 */

export const GAME_TITLE = "Slime Pop Protocol";
export const GAME_VERSION = "0.1.0";

/** Logical render size — Phaser Scale.FIT keeps this aspect on every iframe. */
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

/**
 * Procedural textures are generated at this multiple of their logical size,
 * then every sprite consumer applies `setScale(LOGICAL_SCALE)` so positions,
 * physics bodies and level data stay in 960x540 world units while textures
 * carry extra pixel data — much crisper when the canvas is upscaled by the
 * browser to fit large iframes / fullscreen.
 *
 * Trade-off: more texture memory. Negligible here (a few dozen tiny textures,
 * largest is the 80×80 portal → 240×240 = 230 KB even at RGBA).
 */
export const TEX_SUPERSAMPLE = 3;
export const LOGICAL_SCALE = 1 / TEX_SUPERSAMPLE;

/** Centralised colour palette so every scene/system stays on-brand. */
export const COLORS = {
  bgDeep: 0x06061a,
  bgMid: 0x0a0f2e,
  bgFar: 0x101847,
  bgRim: 0x26318a,
  neonCyan: 0x6ffcff,
  neonCyanDim: 0x2f8c95,
  neonPink: 0xff6cf2,
  neonGold: 0xffd166,
  neonGreen: 0x9efc7a,
  neonOrange: 0xffa45a,
  platformBase: 0x202a5b,
  platformEdge: 0x6ffcff,
  platformShadow: 0x070918,
  steelDark: 0x141b3d,
  steelMid: 0x2f3c7e,
  glass: 0xcfe9ff,
  glassDark: 0x152047,
  scrap: 0xffd166,
  battery: 0x6ffcff,
  text: 0xe7f6ff,
  textDim: 0x9bb0c8,
  warning: 0xff5577,
  fieldCore: 0x6ffcff,
  fieldRim: 0xffffff,
  portal: 0xffd166,
  portalSecondary: 0x6ffcff,
} as const;

export const CSS_COLORS = {
  text: "#e7f6ff",
  textDim: "#9bb0c8",
  accent: "#6ffcff",
  pink: "#ff6cf2",
  gold: "#ffd166",
  warning: "#ff5577",
} as const;

export const FONT_FAMILY =
  "'Segoe UI', 'Trebuchet MS', system-ui, -apple-system, sans-serif";

/** Player tuning. */
export const PLAYER = {
  width: 22,
  height: 28,
  moveSpeed: 210,
  accel: 1700,
  drag: 1600,
  airDrag: 600,
  // -580 → ~153 px max jump from a standing tap. Sized so the player can
  // clear the floor → y=380 first-platform gap (137 px) found in most levels
  // with ~16 px of margin. Bumping was preferable to re-authoring every level.
  jumpVelocity: -580,
  maxFallSpeed: 720,
  gravity: 1100,
  coyoteMs: 110,
  jumpBufferMs: 130,
  variableJumpCutMultiplier: 0.45,
  invulnerabilityMs: 1100,
  maxHearts: 3,
  knockback: 220,
} as const;

/** Containment field tuning. */
export const FIELD = {
  radius: 16,
  speed: 320,
  emptyLifetimeMs: 1500,
  trapLifetimeMs: 4500,
  trapWarningMs: 1200,
  floatSpeed: 34,
  popRadius: 88,
  popRadiusMax: 150,
  fireCooldownMs: 380,
  fireCooldownMin: 180,
  spawnOffsetX: 18,
  spawnOffsetY: -2,
  bounceDamping: 0.6,
  maxActive: 32,
} as const;

/** Combo / scoring. */
export const COMBO = {
  windowMs: 1100,
  chainDelayMs: 110,
  bonusPerChain: 0.5,
  scrapBonusEvery: 3,
} as const;

/** Score values. */
export const SCORE = {
  basePop: 100,
  scrap: 25,
  levelClear: 500,
  bossDefeated: 5000,
} as const;

/** Enemy tuning. */
export const ENEMY = {
  basicSpeed: 78,
  bouncerSpeed: 95,
  bouncerJumpVelocity: -340,
  bouncerJumpIntervalMs: 1200,
  chargerSpeed: 260,
  chargerWalkSpeed: 50,
  chargerWindupMs: 800,
  chargerRecoveryMs: 600,
  shieldSpeed: 60,
  shieldHits: 2,
  contactDamage: 1,
  spawnSafeDistance: 110,
} as const;

export const BOSS = {
  hp: 6,
  spawnIntervalMs: 2200,
  contactDamage: 1,
  width: 96,
  height: 80,
} as const;

/** Persistent save key. */
export const SAVE_KEY = "slime-pop-protocol::save::v1";

/** Default settings. */
export const DEFAULT_SETTINGS = {
  masterVolume: 0.8,
  sfxVolume: 0.9,
  musicVolume: 0.5,
  screenShake: true,
  particleQuality: "normal" as "normal" | "low",
} as const;

export type GameSettings = {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  screenShake: boolean;
  particleQuality: "normal" | "low";
};

export type SaveData = {
  bestLevel: number;
  bestScore: number;
  totalScrap: number;
  settings: GameSettings;
};

/** Scene keys.  Keep these centralised so wiring stays consistent. */
export const SCENES = {
  Boot: "BootScene",
  Preload: "PreloadScene",
  MainMenu: "MainMenuScene",
  HowToPlay: "HowToPlayScene",
  Options: "OptionsScene",
  Game: "GameScene",
  Hud: "HudScene",
  Pause: "PauseScene",
  Upgrade: "UpgradeScene",
  LevelComplete: "LevelCompleteScene",
  GameOver: "GameOverScene",
  Victory: "VictoryScene",
} as const;

/** Texture keys produced by TextureFactory. */
export const TEX = {
  player: "tex-player",
  playerShoot: "tex-player-shoot",
  slimeBasic: "tex-slime-basic",
  slimeBouncer: "tex-slime-bouncer",
  slimeCharger: "tex-slime-charger",
  slimeShield: "tex-slime-shield",
  boss: "tex-boss",
  field: "tex-field",
  fieldTrapped: "tex-field-trapped",
  platform: "tex-platform",
  platformShort: "tex-platform-short",
  portal: "tex-portal",
  scrap: "tex-scrap",
  battery: "tex-battery",
  particle: "tex-particle",
  star: "tex-star",
  shockwave: "tex-shockwave",
  heart: "tex-heart",
  heartEmpty: "tex-heart-empty",
} as const;

/** Run-time depth ordering. */
export const DEPTH = {
  bgFar: -50,
  bgMid: -40,
  bgNear: -30,
  platform: 0,
  pickup: 5,
  enemy: 10,
  field: 15,
  player: 20,
  effect: 30,
  portal: 8,
  hud: 100,
  overlay: 200,
} as const;
