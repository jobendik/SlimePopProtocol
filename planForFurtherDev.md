# Plan For Further Development — Slime Pop Protocol

**Purpose.** This is the working development plan and "memorybank" for Slime Pop Protocol. Any future session — fresh chat or fresh contributor — should be able to read this doc top-to-bottom and know what state the game is in, what it is trying to be, what to build next, and what to deliberately *not* build. It supersedes `SlimePopProtocol-roadAhead.md`, which is a useful idea catalog but too sprawling to act on directly.

**North star.** Maximize **CrazyGames retention metrics** (D1/D7 return, session length, pages-per-session) without sacrificing the game's identity. Every feature in this doc is justified by one of three levers:

1. **Reduce time-to-first-fun** (click to first satisfying pop ≤ 15 seconds).
2. **Increase per-session length** (give skilled players reasons to play one more level / one more run).
3. **Increase return visits** (give the player a reason to come back tomorrow).

If a feature does not pull one of those three levers, it is a "later/maybe."

---

## 1. Current state (honest snapshot)

Read this section first when picking the project back up. Then verify against the code — the snapshot may have aged.

**Stack.** Vite + TypeScript + Phaser 3 (3.80.x). Zero runtime deps beyond Phaser. Procedural art via [TextureFactory](src/game/systems/TextureFactory.ts), procedural SFX via [AudioSystem](src/game/systems/AudioSystem.ts). Bundle is tiny — keep it that way.

**What works.**
- Complete scene flow: [BootScene](src/game/scenes/BootScene.ts) → Preload → MainMenu → HowToPlay/Options → Game/Hud ↔ Pause/Upgrade → LevelComplete → GameOver/Victory.
- 12 handcrafted levels in [levels.ts](src/game/data/levels.ts), boss in level 12.
- 4 slime types (basic / bouncer / charger / shield) in [SlimeEnemy.ts](src/game/entities/SlimeEnemy.ts), 1 boss in [BossSlime.ts](src/game/entities/BossSlime.ts).
- 11 upgrades in [upgrades.ts](src/game/data/upgrades.ts), offered every 3 levels.
- Combo + chain system, screen shake, particles, shockwaves, floating combo text.
- Keyboard + mouse + gamepad input via [InputSystem](src/game/systems/InputSystem.ts).
- LocalStorage save with bestLevel/bestScore/totalScrap and settings ([SaveSystem](src/game/systems/SaveSystem.ts)).
- CrazyGames adapter wrapper exists ([CrazyGamesAdapter.ts](src/game/systems/CrazyGamesAdapter.ts)), SDK script tag is loaded from [index.html](index.html), and the adapter is correctly wired: `init()` and `loadingStart` fire from [BootScene](src/game/scenes/BootScene.ts), `loadingStop` from [PreloadScene](src/game/scenes/PreloadScene.ts), `gameplayStart` from [GameScene](src/game/scenes/GameScene.ts), `gameplayStop` + `requestMidgameAd` + `recordRun` from [GameOverScene](src/game/scenes/GameOverScene.ts) and [VictoryScene](src/game/scenes/VictoryScene.ts), and `requestMidgameAd` from [UpgradeScene](src/game/scenes/UpgradeScene.ts).
- Visibility / window-blur pause is installed in [main.ts](src/main.ts) — backgrounded tabs pause `GameScene`, launch `PauseScene`, and suspend the audio context. Audio resumes on focus return; gameplay does not auto-resume.
- `Phaser.Scale.FIT` at 960×540 — iframe-friendly.

**What does NOT work / is missing (the gap to "CG-ready").**
- **No metaprogression / reason to return.** Only persistent state is `bestLevel` / `bestScore` / `totalScrap` — but `totalScrap` is never spent. One full playthrough exhausts the game. (Phase 1.)
- **No level-select.** After dying on level 8 you have to replay 1–7. (Phase 1.)
- **No medals / per-level objectives** beyond completion. (Phase 1.)
- `SaveSystem.recordRun()` now fires from `GameOverScene`, `VictoryScene`, **and** `LevelCompleteScene` (the level-complete call passes `scrap: 0` so the run total isn't double-counted when GameOver/Victory adds it at run-end).
- **Manual verification still owed for Phase 0:** iframe size sweep at 800×600 / 1280×720 / 1920×1080 / 414×736, and a full first-clear with the console open looking for warnings.

**What's in place as of 2026-05-23.**
- Touch controls: floating joystick (left-half tap) + jump + shoot buttons in [TouchControls.ts](src/game/ui/TouchControls.ts), auto-mounted by HudScene when `'ontouchstart' in window || maxTouchPoints > 0`. Mouse-click-as-shoot is suppressed when touch is active so tap-on-joystick doesn't fire phantom shots.
- Procedural music: calm pad (3 detuned saw/triangle oscillators through a slowly-swept lowpass) plus an arp layer crossfaded in by [GameScene](src/game/scenes/GameScene.ts) when boss is alive or ≤ 2 slimes remain. Started by MainMenu and persists across the menu→game transition; stopped on GameOver/Victory.
- Action-anchored Level 1 tutorial in [Tutorial.ts](src/game/systems/Tutorial.ts): four prompts (MOVE → JUMP → SHOOT → POP) that follow the player/field and disappear as each action lands. Labels swap to touch-style on touch devices.
- First-hit forgiveness: first non-absorbed hit per run extends invulnerability by 2 s and shows a "STAY CLEAR — SHIELD BOOSTED" prompt.
- `PLAYER.jumpVelocity` bumped from -420 to -580 (max apex 80 px → 153 px) so the y=380 first-platform convention used by most levels is reachable from the floor with ~16 px of margin.
- Dev shortcuts via URL params, parsed in [BootScene](src/game/scenes/BootScene.ts) and acted on in [PreloadScene](src/game/scenes/PreloadScene.ts) / [MainMenuScene](src/game/scenes/MainMenuScene.ts): `?debug=1` adds a 12-button level-skip grid to the main menu, `?level=N` (1..12) skips the menu and starts a fresh run at level N. Both are no-ops in production URLs.
- Graphics no longer pixelated. Two fixes stacked: (a) removed the `image-rendering: pixelated` CSS in [index.html](index.html) that was forcing nearest-neighbour upscaling, and (b) every procedural texture is now baked at `TEX_SUPERSAMPLE = 2`× pixel density via a `bake()` helper in [TextureFactory.ts](src/game/systems/TextureFactory.ts), with every sprite consumer applying `setScale(LOGICAL_SCALE)` (or multiplying its existing scale by it) so positions, physics bodies, and level data stay in 960×540 world units while textures carry 4× the pixel data.

---

## 2. Strategic frame

**The pitch (do not drift from this).** A tiny repair robot traps mutated slimes inside glowing containment fields, then chain-pops them for cascading combos in a corrupted neon lab.

**The signature loop (every feature should serve this).**

```
TRAP → FLOAT → POP → CHAIN → COLLECT → CLEAR
```

**Three things that must always be true.**
1. The game is **playable in under 5 seconds** from clicking the CrazyGames thumbnail.
2. The **first containment + pop happens within the first 15 seconds**, with no menu in the way.
3. The chain pop is **the most satisfying single thing in the game**. Audio, visuals, screen shake, time-dilation hints — protect this moment above all else.

**Identity guardrails.** Robot (not dragon), containment field (not bubble), slime mutants (not generic enemies), neon lab (not fantasy cave), scrap/modules (not fruit-style score items). The roadAhead.md doc lists these correctly; preserve them.

---

## 3. CrazyGames-specific KPI targets

Set targets so we know when a feature is "good enough" to move on.

| Metric | Target | Current (estimated) | Why |
|---|---|---|---|
| Bundle size (gzip, excl. Phaser) | < 50 KB | likely already | CG users on mobile / weak connections |
| Cold load to first input | < 3 s | ~1–2 s | Bounce rate before play starts |
| First pop after first click | < 15 s | possible but text-heavy | Determines "I get it" moment |
| Stable FPS on mid-tier mobile | 60 (degrade to 30 gracefully) | unknown | CG mobile traffic |
| Full first-clear runtime | 10–20 min | likely 15–25 min currently | Long enough to feel like a real game, short enough to finish |
| Reasons to return tomorrow | ≥ 1 (daily challenge or meta unlock) | 0 | Drives D1 retention |
| Pause works on `visibilitychange` | yes | no | Background tab safety |

---

## 4. Evaluation of `SlimePopProtocol-roadAhead.md`

**Strengths.** Strong identity guardrails (sections 1–4), useful risk inventory (section 3), comprehensive feature catalog, good "anti-roadmap" (section 30).

**Weaknesses (why this new doc exists).**
- 2,800+ lines is too much to act on. Most of it is "could exist" rather than "should be built next."
- The Priority Matrix (section 28) is helpful but high-level — it doesn't say *which file* or *which order*.
- It treats Endless Containment, Co-op, level editor, lab hub etc. as parallel-priority ideas. They are not — most are scope traps that will sink the project before launch.
- It under-weights mobile. Touch is mentioned as one of many "5.1" items, but it is in practice the single most important task.
- It does not define a clear v1.0 cut line.

**How to use it.** Treat roadAhead.md as a brainstorming reference — pull from sections 6 (field variants), 7 (enemy ideas), 11 (game modes), and 29 (catalog) when picking what to add inside a phase. But sequence and definition of "done" come from *this* doc.

---

## 5. Phased plan

Four phases. Do them in order. Do not skip ahead unless explicitly approved.

### Phase 0 — CrazyGames-ready cut (the only thing that matters right now)

**Goal.** Ship a build that we would not be embarrassed to submit to CrazyGames Basic Launch. Single playthrough only — no meta yet. Mobile must work.

**Definition of done.** A player on a mid-range Android phone in landscape can click the CG thumbnail and clear level 1 without ever touching a keyboard, in under 60 seconds total.

**Tasks.**
- [ ] **Touch controls.** Add an on-screen overlay scene (e.g. `TouchControlsScene` or layered into HUD) with left-half virtual joystick + right-half jump button + right-half shoot button. Show only when `'ontouchstart' in window`. Feed into [InputSystem](src/game/systems/InputSystem.ts) as a new input source. Buttons must be large (≥ 80 px), semi-transparent (~40% alpha), and *not* overlap the play field's center bottom.
- [ ] **Bump `activePointers`** in [config.ts](src/game/config.ts#L54) from 2 to 4. Joystick + jump + shoot needs ≥ 3 simultaneous touches.
- [ ] **Wire CrazyGames SDK.** Uncomment the script tag in [index.html](index.html), call `CrazyGamesAdapter.init()` from `main.ts` before the Phaser game boots, and verify `loadingStart()` / `loadingStop()` bracket the asset boot in [BootScene](src/game/scenes/BootScene.ts) + [PreloadScene](src/game/scenes/PreloadScene.ts).
- [ ] **Pair `gameplayStart` / `gameplayStop`.** `GameScene.create()` calls `gameplayStart()` ([GameScene.ts:128](src/game/scenes/GameScene.ts#L128)) but nothing calls `gameplayStop()` on shutdown. Add to `shutdownScene()`.
- [ ] **Midgame ad calls.** Call `CrazyGamesAdapter.requestMidgameAd()` from `LevelCompleteScene.onContinue` *only* when transitioning to the upgrade scene (every 3 levels), and from `GameOverScene` on game over. Never during play. The 2-min cooldown is already built in.
- [ ] **Visibility / blur pause.** Listen on `document.visibilityState` (and `window.blur`) — if hidden and `GameScene` is active, pause it and suspend audio context. Resume on visible. Today, alt-tabbing leaves timers and physics running.
- [ ] **Verify `SaveSystem.recordRun()`** is actually called on level complete, game over, and victory. If not, wire it in.
- [ ] **Music loop, one track.** Two layers via the existing `musicBus` in [AudioSystem](src/game/systems/AudioSystem.ts): a calm pad for menu / play, a more intense layer that crossfades in during boss / when ≤ 2 slimes remain. Procedural synth — no external assets. Respect `settings.musicVolume`.
- [ ] **Tutorial-by-doing on Level 1.** Replace the long `hint` string. Use small floating prompts attached to the action: "← →" near the player at spawn until they move; "JUMP" above the player after they move; "SHOOT" when they're near the slime; "POP!" on the first trapped field. On touch, swap key icons for finger icons. Suppress all text after the first containment.
- [ ] **Forgive the first hit.** First time the player takes damage, also grant 2 s extra invulnerability and show a "STAY CLEAR" prompt. Stops "die in 4 seconds, bounce" churn.
- [ ] **Reset-save confirmation.** [OptionsScene](src/game/scenes/OptionsScene.ts) reset should require a confirm — easy to misclick and erase progress.
- [ ] **Iframe size sweep.** Test at 800×600, 1280×720, 1920×1080, 414×736 (phone landscape). `Scale.FIT` should handle it, but verify HUD readability and touch button position at each.
- [ ] **Console silence.** Zero warnings, zero errors on a full first-clear. CG QA flags noisy consoles.
- [ ] **`npm run build`** passes. `tsc --noEmit` clean.

**Stretch in Phase 0 (do if time, don't push it).**
- [ ] Polish field state visuals to match roadAhead §5.4 (empty / trapping / stable / warning / escape / pop). Today the empty→trapped distinction is texture-only.
- [x] `?debug=1` grid + `?level=N` direct boot (no FPS overlay yet, but the level-skip part is in).

---

### Phase 1 — Retention pass (the moment Phase 0 is done)

**Goal.** Give players a reason to come back tomorrow and a reason to play the level *they just played* one more time. This is where D1/D7 retention is won.

**Definition of done.** A player who finished the campaign yesterday opens the game today, sees something new on the menu (daily challenge or unlocked content), and plays at least one more session.

**Tasks.**
- [ ] **Level select screen.** Grid of 12 nodes, locked / unlocked / completed / medaled states, best score per node, replay-from-here. Insert as a new scene reached from main menu "PLAY" → if `bestLevel > 0` show level select, else start level 1 directly. Avoid making it a multi-screen world map — single screen.
- [ ] **Medals (3 per level).** Bronze = clear. Silver = clear with combo ≥ 3. Gold = clear with no damage. Store as bitmask in save (`medals: Record<levelId, number>`). Show on level-select grid and on level-complete screen. Add a `saveVersion: 2` field to support migration.
- [ ] **Daily Protocol.** A fixed-seed run of 5 selected levels with a daily modifier (faster slimes / one heart / tiny fields / chain ×2 etc.). Seed = `YYYYMMDD`. Score posted to local "best daily" record. Even without leaderboards, a daily score-to-beat creates a return reason.
- [ ] **Arcade Run mode.** Start at level 1, all 12 played back-to-back, no save between, scoring focus, upgrade offered after every 2 levels instead of 3. Score saved separately. This is the strongest long-session mode for arcade players.
- [ ] **Achievements (10–15 max).** First Trap, First Chain ×3, Chain ×5, Clear No Damage, Clear Daily, Beat Reactor Blob, Collect 1000 scrap, Full Medal Sweep, etc. Show as a small toast on unlock. Persist via save.
- [ ] **Persistent unlock currency.** Convert `totalScrap` from a vanity stat into a spendable currency. Add a small "Lab" screen with 5–8 permanent unlocks: starting +1 heart (expensive), starting shield, faster default emitter, +1 upgrade choice per offer, robot color skin. Keep costs meaningful — first unlock at ~150 scrap, last at ~3000.
- [ ] **One new robot skin** unlockable from the Lab. Recolor only — TextureFactory can swap the player tint. No new art.
- [ ] **Return screen.** On boot, if `lastPlayedAt` was > 16 h ago, show a short "Welcome back" panel: your medals, today's Daily Protocol available, latest unlocked thing. Auto-dismiss on input.
- [ ] **Save migration.** Bump `SAVE_KEY` to `::v2` (or add `saveVersion` field). Old saves should load gracefully — fill new fields with defaults, never crash.

---

### Phase 2 — Content + depth pass

**Goal.** Move from "12 levels + boss" to enough handcrafted content that the campaign feels like a real game, and add the first new mechanic that deepens the chain loop.

**Definition of done.** 24 levels in 3 visually distinct sectors, 2 bosses, 1 new slime type, 1 new hazard, 1 new field variant. Average campaign clear: 25–35 minutes.

**Tasks.**
- [ ] **Sector framing.** Group existing 12 levels into Sector 1 (Calibration Wing, lab-blue, levels 1–6, ends in mini-boss) + Sector 2 (Reactor Bay, lab-amber, levels 7–12, ends in Reactor Blob). Add a sector splash card on entry. Keep it lightweight — no cinematic, just title + tagline.
- [ ] **12 new levels (Sector 3).** Cryo Containment, lab-cyan-white palette. Introduce one new mechanic per 3-level batch. Ends in a new boss.
- [ ] **1 new slime: Splitter.** Splits into two tiny slimes when popped *outside* of a chain. Chain-popped splitters don't split. This single rule deepens the chain identity: chains become tactically optimal, not just satisfying.
- [ ] **1 new hazard: Reactor Vent.** Periodic upward gust. Pushes the player and any floating fields upward. Creates chain setups, doesn't kill.
- [ ] **1 new field variant: Sticky Field.** Sticks to the first surface it touches and traps slimes that wander into it. Unlocked from the Lab; loadout-style — pick standard OR sticky for the run.
- [ ] **New boss (Sector 3).** "Cryo Mother" or similar — armored, plates broken only by chain pops (not single pops). Reinforces chain identity.
- [ ] **Refactor `GameScene` if needed.** It's already pushing 670 lines. Extract `FieldSystem` and `PickupSystem` only when you actually need to add behavior that doesn't fit. Don't preemptively refactor — wait until the third change to a section makes it obvious.
- [ ] **Level data schema update.** Add optional `sector`, `modifier`, `medalTargets` fields to [LevelData](src/game/data/levels.ts). Keep all-optional to avoid mass migration.
- [ ] **Validation script.** `npm run validate-levels` — node script that loads `LEVELS` and asserts: spawn in bounds, portal in bounds, no slime in a wall, unique ids, monotonically-increasing ids. Cheap, catches authoring errors.

---

### Phase 3 — Live ops + polish (only after Phases 0–2 land)

**Goal.** Squeeze long-tail retention. This phase is conditional — only do it if the game is performing on CrazyGames.

**Tasks.**
- [ ] **Weekly events.** Themed week (Electric Week, Swarm Week). Single global modifier active for 7 days. Pure data, near-zero code if Daily Protocol is built well.
- [ ] **CrazyGames data API** for cross-device save (only if CG analytics show > X% multi-device usage).
- [ ] **Leaderboards** (CG-provided) for Daily Protocol, Arcade Run high score, and longest chain.
- [ ] **Endless Containment mode.** One arena, escalating waves, upgrade between waves. Only build this if Daily Protocol proves people want a non-campaign mode.
- [ ] **Boss Rush.** Unlocked after full clear + all medals. Three bosses back-to-back.
- [ ] **Reduced-motion / colorblind-friendly modes** in [OptionsScene](src/game/scenes/OptionsScene.ts). Slimes already have shape differences (basic round vs bouncer puffy vs charger angular vs shield plated) — formalize this and add an outline-only mode for the field-trapped state.
- [ ] **Audio "barks" pass.** Six short synth blips with vocoded-feel for "containment!" / "cascade!" / "portal!" — optional, off by default.

---

## 6. The anti-list (things to deliberately NOT do)

This list saves more time than the to-do list. Re-read it whenever an "amazing idea" appears.

- ❌ **Co-op multiplayer.** Doubles design and QA cost. Out of scope for v1.x. Reconsider only after the game is a CG success.
- ❌ **Level editor / UGC.** Same reason. Cool but a scope sink.
- ❌ **Skill trees with > 10 nodes.** The Lab unlocks (Phase 1) are enough.
- ❌ **More than one rare currency.** Scrap is the only currency until we have data showing a second one is needed.
- ❌ **Story dialogue scenes.** Use level titles + 1-line sector taglines. No talking heads.
- ❌ **Custom fullscreen button.** CrazyGames provides one.
- ❌ **Pay-to-win.** All Lab unlocks must be acquirable through play in a reasonable time. Rewarded ads (if added) only grant convenience (double scrap, extra upgrade reroll), never raw power.
- ❌ **Heavy art pipeline.** Stay procedural. The "look" is a feature, not a limitation. If we ever add custom sprites, they replace procedurals — not add to bundle.
- ❌ **Tycoon / idle / lab-base meta.** Tempting; not us. Lab screen is a 1-screen unlock shop, not a base-builder.
- ❌ **Anything that delays the first level start.** No splash logos > 1 s, no required intro, no settings prompt before play.
- ❌ **Touch UI that covers gameplay.** Always test at phone aspect ratios; the buttons must not occlude the action zone.

---

## 7. Architecture notes (read before refactoring)

**Don't refactor until the third change.** [GameScene](src/game/scenes/GameScene.ts) is the natural pressure point. Resist extracting systems on speculation. Extract `FieldSystem` only when adding sticky fields (Phase 2) makes the inline code awkward. Extract `BossSystem` only when adding the second boss.

**Singletons in use.** `audio` from [AudioSystem.ts](src/game/systems/AudioSystem.ts) is a process-wide singleton. `CrazyGamesAdapter` is fully static. `SaveSystem` is registered on Phaser's `registry` under key `"save"`. Don't introduce a new global without good reason.

**Event bus pattern.** GameScene emits `hud:update` events that [HudScene](src/game/scenes/HudScene.ts) listens for. Continue this — don't reach into HudScene directly.

**Tuning lives in [constants.ts](src/game/constants.ts).** When balancing, change values there, not in entity classes. The exception is per-enemy AI timing inside [SlimeEnemy.ts](src/game/entities/SlimeEnemy.ts) which is enemy-local.

**Phaser version is 3.80.x.** Don't upgrade casually — Scale.FIT and arcade physics behavior shifts between minor versions.

---

## 8. Decision log

Append to this section in future sessions when a non-obvious call is made. Format: `YYYY-MM-DD — Decision — Why`.

- 2026-05-23 — Visibility-pause leaves the PauseScene open on focus return; user must manually resume. — Auto-resuming is a footgun on mobile: the player may have switched apps to message someone and not want the game to restart silently. The audio context resumes automatically since it can't replay missed events anyway.
- 2026-05-23 — Reset-save uses a two-tap arm-and-confirm pattern inside the existing button instead of a modal scene. — A modal for one button is heavyweight; the two-tap UX is well understood and keeps OptionsScene self-contained.
- 2026-05-23 — `activePointers` set to 4, not 3. — Cheap headroom against a user resting an extra finger on the screen.
- 2026-05-23 — Joystick is floating (spawns where the player taps in the left half) rather than fixed-position. — Reliable across all phone form factors; fixed-position joysticks fall under the thumb on small screens but not large ones.
- 2026-05-23 — Mouse-click-as-shoot disabled when touch is active. — Otherwise every joystick or jump tap fires a phantom containment field. Edge case (touchscreen laptop + mouse) is acceptable collateral; those users still have keyboard.
- 2026-05-23 — Music intensity layer is driven by boss-alive OR ≤ 2 slimes remaining, not by combo or HP. — Combo is too jittery (constantly flapping); HP requires the music to react to recovery, adding complexity. The chosen rule maps to the moments where the player actually feels pressure.
- 2026-05-23 — First-hit forgiveness is per-run, not per-level. — Per-level is too generous (12 freebies per playthrough); per-run prevents the "early hit → bounce" churn the system is meant to fix without dulling later-level stakes.
- 2026-05-23 — `PLAYER.jumpVelocity` raised from -420 to -580 (max jump 80 px → 153 px). — Most levels placed their first platform at y=380, leaving a 137 px floor-to-platform gap that the original jump could not clear. Bumping was preferable to re-authoring all 12 level layouts; the new value gives ~16 px of margin on the tightest gaps and the variable-jump cut still keeps short taps useful (~31 px). If level redesigns later in the project reduce the worst-case gap, this could be tuned down for a snappier feel.
- 2026-05-23 — `LevelCompleteScene.recordRun` passes `scrap: 0`, not the run's cumulative scrap. — Cumulative scrap is added once at GameOver/Victory; passing it here too would double-count, eventually triple-count etc. Only `bestLevel` and `bestScore` need per-level updates and those use `>` comparisons that are safe to call repeatedly.
- 2026-05-23 — Debug shortcuts live behind `?debug=1` and `?level=N` URL params, not a hidden key chord. — URL params are trivially shareable in QA ("just open ?level=7"), can't be triggered accidentally by players, and don't need a discoverability UI. The level-skip grid is rendered only when `?debug=1` so the production main menu stays clean.
- 2026-05-23 — Graphics crispness fixed by supersampling textures (`TEX_SUPERSAMPLE = 2`) + applying `LOGICAL_SCALE` everywhere, not by bumping the Phaser game resolution. — Bumping resolution would require either re-authoring every level coordinate (logical and physics) or routing every scene through camera-zoom compensation. The supersample approach is localized to the texture factory plus a one-line scale on each consumer, and the 4× texture memory cost is negligible at this asset count (~few KB). If a future render-resolution upgrade lands, `LOGICAL_SCALE = 1` cleanly disables the workaround. **Note:** the `bake()` helper relies on Phaser's `generateTexture` respecting the graphics object's `setScale` transform — verified-by-design but worth re-checking if textures ever look clipped/scaled-wrong after a Phaser version bump.
- 2026-05-23 — **Phaser arcade body offset gotcha (worth memorizing).** Phaser computes `body.position.x = sprite.x + scaleX * (offset.x - displayOriginX)`, where `displayOriginX = originX * sprite.width` uses the *raw texture width* (not displayWidth). So `body.offset` is in *texture coords*, and any sprite that has both an explicit `setOffset` AND a non-1 `setScale` needs the offset computed as `(textureSize - bodySize / scale) / 2` for centering. Phaser's `setSize(w, h, true)` auto-centering has the same bug — it uses `displayWidth/2` for centering, which only works when `scaleX = 1`. Symptom of getting this wrong with `LOGICAL_SCALE = 0.5`: the body sits off-centre (half the intended offset), the player visually clips through floors, and `collideWorldBounds` catches them at the bottom of the screen instead of the floor. Fixed in Player, BossSlime, and Portal.
- 2026-05-23 — **Player body is bottom-anchored, not centered.** The player visual sprite is 44 px tall but `PLAYER.height` is 28 — leaving 16 px of slack (8 top, 8 bottom). A centred body lets the visual feet poke 8 px below the floor (visible as "sunk into the platform" on every surface). Body is therefore anchored to the visual bottom via `offset.y = this.height - PLAYER.height / LOGICAL_SCALE` (32 for supersample, 16 for non-supersample). The head pokes above the collision rect — standard platformer practice, gives slight forgiveness on head hits. Was a latent issue in pre-supersample code too but the lower-resolution rendering masked it; the crispness pass made it visible. BossSlime/SlimeEnemy/ScrapPickup keep centered bodies because their visuals taper at the bottom (no hard-edged "feet" to misalign).

---

## 9. Quick reference — file map

| Concern | File |
|---|---|
| Tuning knobs (player, field, combo, scoring) | [src/game/constants.ts](src/game/constants.ts) |
| Phaser config (scale, physics, scenes) | [src/game/config.ts](src/game/config.ts) |
| Level definitions | [src/game/data/levels.ts](src/game/data/levels.ts) |
| Upgrade catalog | [src/game/data/upgrades.ts](src/game/data/upgrades.ts) |
| Main gameplay loop | [src/game/scenes/GameScene.ts](src/game/scenes/GameScene.ts) |
| Player physics + jump feel | [src/game/entities/Player.ts](src/game/entities/Player.ts) |
| Slime AI (4 subclasses) | [src/game/entities/SlimeEnemy.ts](src/game/entities/SlimeEnemy.ts) |
| Containment field lifecycle | [src/game/entities/ContainmentField.ts](src/game/entities/ContainmentField.ts) |
| Boss | [src/game/entities/BossSlime.ts](src/game/entities/BossSlime.ts) |
| HUD render layer | [src/game/scenes/HudScene.ts](src/game/scenes/HudScene.ts) + [src/game/ui/Hud.ts](src/game/ui/Hud.ts) |
| Save / settings | [src/game/systems/SaveSystem.ts](src/game/systems/SaveSystem.ts) |
| Input (kb + mouse + pad) | [src/game/systems/InputSystem.ts](src/game/systems/InputSystem.ts) |
| Audio (synth) | [src/game/systems/AudioSystem.ts](src/game/systems/AudioSystem.ts) |
| Procedural textures | [src/game/systems/TextureFactory.ts](src/game/systems/TextureFactory.ts) |
| Particles / shockwaves / shake | [src/game/systems/EffectsSystem.ts](src/game/systems/EffectsSystem.ts) |
| Upgrade run state | [src/game/systems/UpgradeSystem.ts](src/game/systems/UpgradeSystem.ts) |
| Combo tracking | [src/game/systems/ComboSystem.ts](src/game/systems/ComboSystem.ts) |
| Level builder | [src/game/systems/LevelManager.ts](src/game/systems/LevelManager.ts) |
| CrazyGames SDK wrapper | [src/game/systems/CrazyGamesAdapter.ts](src/game/systems/CrazyGamesAdapter.ts) |
| HTML entry / SDK script slot | [index.html](index.html) |

---

## 10. Master checklist (copy this when picking up the project)

Mark `[x]` as items complete. Pick up at the first unchecked Phase-0 item.

### Phase 0 — CrazyGames-ready
- [x] Touch controls overlay (floating joystick + jump + shoot)
- [x] `activePointers` raised to 4
- [x] SDK script tag uncommented in index.html
- [x] `CrazyGamesAdapter.init()` called (via BootScene)
- [x] `loadingStart` / `loadingStop` bracket boot
- [x] `gameplayStart` / `gameplayStop` paired (run-end paths only — see note on `LevelCompleteScene` above)
- [x] Midgame ad called on upgrade screen + game over
- [x] visibilitychange / blur pauses game + suspends audio
- [x] `SaveSystem.recordRun()` called from GameOver + Victory + LevelComplete (`scrap: 0` from LevelComplete to avoid double-count)
- [x] Procedural music: calm pad + intense arp crossfade
- [x] Level 1 tutorial converted to floating action-prompts
- [x] First-hit forgiveness window (2 s extra invuln, one per run)
- [x] Reset-save confirmation (two-tap arm-and-confirm pattern)
- [ ] **Manual:** iframe size sweep (800×600, 1280×720, 1920×1080, 414×736)
- [ ] **Manual:** zero console warnings on full first-clear
- [x] `npm run build` clean

### Phase 1 — Retention
- [ ] Level select grid
- [ ] Medals (bronze/silver/gold per level) + save migration
- [ ] Daily Protocol mode
- [ ] Arcade Run mode
- [ ] 10–15 achievements with toasts
- [ ] Persistent unlock currency (`totalScrap` becomes spendable)
- [ ] Lab screen with 5–8 unlocks
- [ ] One unlockable robot skin (recolor)
- [ ] Return-visit panel (> 16 h since last)
- [ ] Save schema v2 with migration

### Phase 2 — Content + depth
- [ ] Sector 1 / 2 framing on existing 12 levels
- [ ] Splash card on sector entry
- [ ] 12 new levels (Sector 3)
- [ ] Splitter slime
- [ ] Reactor Vent hazard
- [ ] Sticky Field variant + loadout pick
- [ ] Sector 3 boss
- [ ] Level data schema extended (sector, modifier, medalTargets)
- [ ] `npm run validate-levels` script

### Phase 3 — Live ops + polish (conditional on launch success)
- [ ] Weekly themed event system
- [ ] CG cross-device save (if multi-device usage justifies)
- [ ] CG leaderboards (Daily, Arcade, longest chain)
- [ ] Endless Containment mode (only if data justifies)
- [ ] Boss Rush
- [ ] Reduced-motion + colorblind modes
- [ ] Optional voice barks

---

**Last revised:** 2026-05-23. When this doc is more than a month out of date with the code, refresh §1 (Current state) before adding anything new.
