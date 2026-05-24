# Slime Pop Protocol

A juicy, original arcade containment platformer for the browser.  You play a
tiny repair robot defending a corrupted slime lab — trap bouncing slime
mutants inside glowing energy containment fields, then chain-pop the fields
for cascading combos.

Built for CrazyGames-style HTML5 distribution: small bundle, fast startup,
no external assets, no logins, and an iframe-friendly responsive layout.

```
TRAP → FLOAT → POP → CHAIN → COLLECT → CLEAR
```

## Controls

| Action          | Keyboard                | Mouse / Gamepad         |
| --------------- | ----------------------- | ----------------------- |
| Move            | `A` / `D` / Arrow keys  | D-pad / left stick      |
| Jump            | `Space` / `W` / Up      | `A` button              |
| Shoot field     | `J` / `X` / `Z`         | Left click / `X` / `RT` |
| Pause           | `Esc` / `P`             | `Start`                 |
| UI shortcuts    | `Enter`, `1`/`2`/`3`    | —                       |

Touch a trapped containment field — or shoot it — to pop it.  Popping one
field detonates any other field nearby for a chain reaction.

## Running

```bash
npm install
npm run dev       # local dev server (auto port)
npm run build     # type-check + production build into dist/
npm run preview   # serve the built bundle
```

The project uses **Vite + TypeScript + Phaser 3** with no other runtime
dependencies.  All art and SFX are generated procedurally at boot
(see [src/game/systems/TextureFactory.ts](src/game/systems/TextureFactory.ts)
and [src/game/systems/AudioSystem.ts](src/game/systems/AudioSystem.ts)) so
the gzipped game payload (excluding the Phaser library) is tiny.

## Current features

- 12 handcrafted compact arena levels with a mini-boss finale
- 4 distinct slime enemies: Basic, Bouncer, Charger, Plated/Shield
- Reactor Blob mini-boss with HP bar and minion summons
- Containment field shoot + trap + float + pop + chain-reaction loop
- 11 unique upgrades offered every 3 levels (size, speed, magnet, shield, …)
- Combo system with score multiplier + floating combo text
- Full game-state flow: Boot → Preload → Main Menu → How-To / Options →
  Game ↔ Pause / Upgrade → Level Complete → Game Over / Victory
- HUD with hearts, score, scrap counter, combo readout, upgrade icons
- Procedural neon art, juicy particles, shockwave rings, screen shake
- Tiny WebAudio SFX synth (shoot/trap/pop/chain/escape/hurt/UI/victory)
- LocalStorage settings + best-level / best-score / scrap totals
- Options menu (master/SFX/music volume, screen shake, particle quality,
  reset save)
- Coyote time + jump buffering + variable jump height for forgiving feel
- Keyboard + mouse + gamepad input
- Responsive `Phaser.Scale.FIT` layout that works at any iframe size
- Safe CrazyGames SDK adapter — no-op fallback so local dev never breaks

## Known limitations

- No music track yet (system has a `musicBus` ready; volume slider works).
- No level editor; levels are declarative TypeScript data in
  [src/game/data/levels.ts](src/game/data/levels.ts).
- Mobile touch controls are not implemented (architecture leaves room).
- The CrazyGames SDK script tag is intentionally NOT included in
  `index.html` — see the TODO comment there before shipping.

## CrazyGames integration notes

The `CrazyGamesAdapter` ([src/game/systems/CrazyGamesAdapter.ts](src/game/systems/CrazyGamesAdapter.ts))
wraps the SDK behind safe no-ops.  When deploying to CrazyGames:

1. Add the SDK `<script>` tag to [index.html](index.html) (a TODO comment
   marks the spot).
2. The adapter automatically detects `window.CrazyGames.SDK` on boot and
   wires up `loadingStart`/`loadingStop`, `gameplayStart`/`gameplayStop`,
   `happyTime`, and `requestMidgameAd`.
3. Midgame ads are only requested at safe moments: between levels (upgrade
   screen) and after game over — never during action.  There is a 2-minute
   client-side cooldown to avoid spamming.
4. No in-game fullscreen button is provided (CrazyGames supplies its own).

## Architecture

```
src/
├── main.ts                 # boot the Phaser game
└── game/
    ├── config.ts           # Phaser game config, scene list
    ├── constants.ts        # tuning values, palette, scene keys
    ├── data/
    │   ├── levels.ts       # 12 declarative level definitions
    │   └── upgrades.ts     # upgrade catalogue
    ├── entities/
    │   ├── Player.ts
    │   ├── SlimeEnemy.ts   # base + 4 subclasses
    │   ├── BossSlime.ts
    │   ├── ContainmentField.ts
    │   ├── ScrapPickup.ts
    │   └── Portal.ts
    ├── scenes/
    │   ├── BootScene.ts
    │   ├── PreloadScene.ts
    │   ├── MainMenuScene.ts
    │   ├── HowToPlayScene.ts
    │   ├── OptionsScene.ts
    │   ├── GameScene.ts    # main game loop
    │   ├── HudScene.ts     # overlay HUD
    │   ├── PauseScene.ts
    │   ├── UpgradeScene.ts
    │   ├── LevelCompleteScene.ts
    │   ├── GameOverScene.ts
    │   └── VictoryScene.ts
    ├── systems/
    │   ├── AudioSystem.ts        # tiny WebAudio synth
    │   ├── ComboSystem.ts
    │   ├── CrazyGamesAdapter.ts  # safe SDK wrapper
    │   ├── EffectsSystem.ts      # particles + shockwaves + shake
    │   ├── InputSystem.ts        # keyboard + mouse + gamepad
    │   ├── LevelManager.ts       # builds level from data
    │   ├── SaveSystem.ts         # localStorage save
    │   ├── TextureFactory.ts     # procedural art
    │   └── UpgradeSystem.ts
    ├── ui/Hud.ts
    └── utils/math.ts
```

## Legal / originality

Slime Pop Protocol is an original work inspired by the broad arcade fantasy
of "trap enemies in floating bubbles and pop them."  It is **not** a clone,
remake, or derivative of Bubble Bobble or any other existing IP.

- The player is a cute lab repair robot, not a dragon.
- Enemies are slime mutants with original silhouettes and behaviour.
- Containment fields are energy spheres, not "bubbles."
- All level layouts, names, music/SFX synth, art, UI, story framing, scoring,
  and upgrades are original.
- No copyrighted assets are bundled — every texture is generated at boot
  inside the [TextureFactory](src/game/systems/TextureFactory.ts) and every
  sound effect is synthesised at runtime by the
  [AudioSystem](src/game/systems/AudioSystem.ts).
- PEGI 12-friendly: no gore, no realistic violence, no adult content.

## License

Source code is provided for review.  Add your preferred OSS license before
public distribution.
# SlimePopProtocol
