You are Claude Code acting as a senior professional web game developer, technical game designer, Phaser/TypeScript engineer, UX designer, and CrazyGames release consultant.

Your task is to create a highly polished, original, browser-based arcade platformer inspired by the core “trap enemies in floating bubbles and pop them” gameplay fantasy, but NOT a clone, NOT a remake, and NOT an infringing copy of Bubble Bobble or any other existing IP.

Working title:
SLIME POP PROTOCOL

High-level concept:
Create a fast, cute, juicy, neon arcade platformer where a tiny repair robot traps bouncing slime monsters inside glowing energy containment fields, then chain-pops those fields to clear compact arena levels, collect scrap, trigger combos, unlock upgrades, and survive escalating lab chaos.

This must feel like a complete playable CrazyGames-ready HTML5 game prototype, not just a toy demo.

============================================================
0. LEGAL / ORIGINALITY REQUIREMENTS
============================================================

This game must be clearly original.

Do NOT use:
- the name Bubble Bobble, Bubble Bubble, Bobble, Bub, Bob, Taito, or anything similar
- dragons as player characters
- characters that resemble Bubble Bobble dragons
- original Bubble Bobble enemy designs
- original Bubble Bobble level layouts
- original music, jingles, SFX style, score item identity, or EXTEND system
- direct copies of visual style, stage structure, enemy behavior, or UI identity

Use this original framing instead:
- Player character: a cute small repair robot / lab bot
- Main mechanic: energy containment fields, not dragon bubbles
- Enemies: slime mutants, lab blobs, gloop creatures, electric slime, armored slime
- World: corrupted slime lab / neon bio-reactor / containment facility
- Rewards: scrap, batteries, energy cells, slime crystals
- Progression: robot upgrades, modules, skins, challenge modifiers

The goal is to capture the broad arcade pleasure of:
TRAP → FLOAT → POP → CHAIN REACTION → COLLECT → CLEAR LEVEL
while making all art, naming, mechanics, progression, UI, and worldbuilding original.

============================================================
1. TECH STACK
============================================================

Use:
- Phaser 3
- TypeScript
- Vite
- HTML/CSS for shell/loading if useful
- Canvas/WebGL rendering through Phaser
- No heavy external assets
- No copyrighted assets
- No remote dependencies at runtime except normal bundled libraries
- No external login
- No custom fullscreen button

Prefer simple procedural/vector-style game art created in code:
- Phaser Graphics
- generated textures
- simple sprite-like shapes
- particle effects
- gradients/glows where possible
- lightweight sound synthesis or tiny generated SFX system if feasible

The project must run with:
npm install
npm run dev
npm run build
npm run preview

If there is already an existing project in this repo:
1. Inspect the current structure first.
2. Preserve what is useful.
3. Avoid broad destructive refactors.
4. Implement the game cleanly in the existing structure if possible.
5. If the repo is empty or unsuitable, create a clean Vite + Phaser + TypeScript project.

============================================================
2. CRAZYGAMES-FIRST DESIGN GOALS
============================================================

This is intended for CrazyGames. Optimize for:

A. Immediate understanding
The player should understand the core mechanic within 10 seconds:
- move
- jump
- shoot energy field
- trap slime
- pop field
- collect scrap
- clear level

B. Instant fun
The first level must be safe, readable, and satisfying. No confusing menus. No long text. No instant death. No hard opening.

C. Strong thumbnail identity
The game should visually communicate:
- cute robot
- glowing bubble/field
- trapped slime
- juicy pop explosion
- neon lab/platform arena

D. Browser performance
The game must remain lightweight, fast, and smooth:
- low asset count
- small bundle
- avoid massive spritesheets
- avoid huge audio files
- avoid excessive particles
- stable frame timing
- physics should feel consistent at 60 Hz, 120 Hz, 144 Hz, etc.

E. Responsive layout
Support common CrazyGames iframe ratios and fullscreen desktop sizes:
- 16:9 desktop iframe
- 1366x768
- 1920x1080
- 1280x720
- smaller iframe sizes
- tablet/mobile-ish widths if feasible

F. PEGI12-safe
No gore, no realistic violence, no adult content. Slime splats are colorful and cartoonish.

G. No custom fullscreen button
CrazyGames provides fullscreen. Do not add an in-game fullscreen button.

============================================================
3. GAME IDENTITY
============================================================

Working title:
Slime Pop Protocol

Alternative internal subtitle:
Containment Arcade

Tone:
- cute but energetic
- modern arcade
- neon sci-fi
- playful lab chaos
- satisfying chain reactions
- premium but lightweight

Visual style:
- dark blue/purple laboratory background
- glowing cyan player robot
- green/pink/orange slime enemies
- transparent energy containment spheres
- bright pop particles
- simple readable platforms
- clean UI with high contrast

Avoid:
- generic military sci-fi
- realistic gore
- cluttered backgrounds
- tiny unreadable sprites
- overly retro imitation
- dull gray boxes
- low-contrast text

============================================================
4. CORE GAMEPLAY LOOP
============================================================

Each level is a compact single-screen arena.

Loop:
1. Player spawns safely.
2. Slime enemies patrol/jump around platforms.
3. Player fires energy containment fields.
4. If a field hits a slime, the slime becomes trapped.
5. Trapped slime floats upward slowly inside the field.
6. Player can pop the field by:
   - touching it
   - shooting it
   - dashing through it if dash is implemented
7. Popping a trapped slime destroys the enemy and drops scrap/energy.
8. Popping one field can trigger nearby fields in a chain reaction.
9. Clear all enemies to open the exit/portal.
10. Player enters portal to advance.
11. Every few levels, offer an upgrade choice.

Primary satisfaction:
CHAIN POPS.

The player should feel clever and powerful when they trap several slimes and pop them in a cascade.

============================================================
5. MVP FEATURE SET
============================================================

Build a complete vertical slice with the following minimum features:

A. Player robot
- left/right movement
- jump
- optional double jump or wall bounce only if stable
- shoot containment field
- clear readable animation states, even if procedural:
  idle, move, jump, shoot, hurt
- responsive controls
- coyote time
- jump buffering
- variable jump height if feasible

B. Energy containment fields
- fired from robot
- limited fire rate
- visible glowing sphere
- slow travel
- disappears after timeout if it hits nothing
- traps enemies on contact
- trapped enemy floats upward
- trapped enemy escapes after timer if not popped
- can be popped by player touch or shot
- pop creates shockwave
- shockwave can pop nearby trapped enemies
- pop gives score/scrap
- combo multiplier for chain pops

C. Slime enemies
Implement at least 4 enemy types:

1. Basic Slime
- hops left/right
- turns at ledges/walls
- easy to trap
- introduced in level 1

2. Bouncer Slime
- jumps higher
- changes direction unpredictably but fairly
- introduced after player understands basics

3. Charger Slime
- pauses, telegraphs, then rushes horizontally
- dangerous but readable
- can be trapped during or after charge

4. Shield Slime / Armored Slime
- requires two hits or must be hit from behind / after stun
- introduced later
- do not make early levels frustrating

D. Levels
Create at least 12 handcrafted levels:
- Level 1: safe tutorial level
- Levels 2–3: reinforce basic trap/pop
- Levels 4–6: introduce platforms and chain opportunities
- Levels 7–9: introduce new enemy types
- Levels 10–11: harder mixed levels
- Level 12: mini-boss or intense finale

Each level should be stored as data, not hardcoded spaghetti.

Level data should include:
- platforms
- player spawn
- enemy spawns
- hazards if any
- exit position
- optional tutorial hint

E. Mini-boss
Implement one boss or mini-boss if feasible:
- big slime reactor blob
- has clear phases
- spawns small slimes
- can be damaged by popping trapped slimes near it or by direct field pops
- simple but satisfying
- readable telegraphs

F. Upgrades
After every 3 levels, show a simple upgrade choice screen with 3 options.

Possible upgrades:
- larger containment fields
- faster field recharge
- longer trap duration
- bigger chain-pop radius
- extra jump
- magnetic scrap
- one-hit shield
- pop shockwave damage
- field pierces one slime
- movement speed +10%

Store upgrades in a simple player run state.

G. Game states
Implement clean states:
- Loading
- Main Menu
- Playing
- Paused
- Upgrade Choice
- Level Complete
- Game Over
- Victory

H. Main menu
Keep it simple:
- title
- “Play”
- “How to Play”
- “Options”
- small version text
- no clutter

I. How to Play
Short and visual:
- Move: WASD / Arrow keys
- Jump: Space / W / Up
- Shoot: Mouse / J / X
- Trap slimes in energy fields
- Pop trapped slimes for combos
- Clear all slimes and enter portal

J. Options
- master volume
- SFX volume
- music volume if music exists
- screen shake on/off
- particles low/normal
- reset save

K. Save data
Use localStorage for:
- best level reached
- best score
- unlocked robot skins if implemented
- settings

Do not require login.

============================================================
6. CONTROLS
============================================================

Desktop keyboard:
- A/D or Left/Right: move
- W / Up / Space: jump
- J / X / Left Mouse: shoot containment field
- K / Shift: dash, only if dash is implemented and stable
- P / Esc: pause

Mouse:
- If using mouse aim, allow simple 8-direction or aim-to-pointer shooting.
- If this complicates the game, keep shooting in facing direction. Simplicity is better.

Gamepad support:
Add if easy:
- D-pad / left stick: move
- A: jump
- X / RT: shoot
- B: dash

Mobile:
Not required for the first version, but do not make the architecture impossible to extend.

Important:
Controls must feel responsive and forgiving:
- coyote time
- jump buffering
- no slippery movement unless intentionally tuned
- no frustrating first level

============================================================
7. FEEL / JUICE REQUIREMENTS
============================================================

This game lives or dies on game feel.

Implement strong feedback:

A. Shooting
- muzzle flash
- tiny recoil
- field-launch sound
- field trail

B. Trapping
- slime squashes into field
- sphere pulses
- enemy wobbles inside
- small “TRAPPED!” or icon feedback if useful

C. Popping
- bright ring shockwave
- particles
- slime splash
- scrap burst
- combo text
- short screen shake
- pitch-varied pop sound

D. Chain reactions
- delay between chain pops should be tiny but visible
- pop → pulse → next pop → bigger combo
- show “x2”, “x3”, “MEGA POP”, etc.
- reward skill with more scrap and score

E. Player hurt
- clear flash
- knockback
- brief invulnerability
- health UI flash

F. Level clear
- portal opens
- satisfying sound
- score tally
- quick transition

G. Upgrade choice
- cards feel rewarding
- clear icons or simple symbolic graphics
- player understands effect immediately

Do not overdo particles so performance suffers. Provide low-particle mode.

============================================================
8. GAME BALANCE
============================================================

Target session:
- First run: 3–8 minutes
- Full 12-level clear: 8–15 minutes
- Restart should be instant

Difficulty curve:
- Level 1: cannot realistically die unless player tries
- Level 2: first real enemy danger
- Level 3: first simple chain opportunity
- Level 4+: introduce more active movement
- Level 7+: mixed enemies
- Level 12: mini-boss / finale

Player health:
- 3 hearts by default
- brief invulnerability after hit
- no one-shot deaths early

Enemy contact:
- damages player
- enemy should not camp spawn
- enemy should not immediately hit player after spawn

Trapped enemies:
- trapped duration should be long enough for beginners
- escape should be clear and telegraphed
- escaped enemy becomes dangerous again

Scoring:
- base pop score
- combo multiplier
- scrap bonus
- level clear bonus
- no need for complex economy at first

============================================================
9. LEVEL DESIGN RULES
============================================================

Levels should be compact and readable.

Good level:
- player sees enemies immediately
- platforms create interesting angles
- no unfair spawn hits
- enough open space for fields
- chain-pop opportunities
- not too much vertical distance
- clear exit

Avoid:
- maze-like layouts
- tiny platforms
- blind jumps
- projectile spam
- excessive hazards
- enemies spawning on top of player
- too much text

Tutorial hints:
Use tiny contextual hints that disappear after action is performed, not long instructions.

Examples:
Level 1:
“Shoot a field to trap the slime.”
When slime trapped:
“Touch or shoot the field to pop it.”
When enemy cleared:
“Enter the portal.”

Level 2:
“Trap two slimes, then pop one for a chain.”

============================================================
10. UI / HUD
============================================================

HUD must be clean and readable:
- hearts/lives
- level number
- score
- combo indicator
- scrap count
- current upgrade icons if any

Style:
- dark translucent panels
- cyan/green accents
- readable font size
- no tiny text
- works at 907x510 iframe size
- works at 1920x1080 fullscreen

Do not clutter the screen.

============================================================
11. ART DIRECTION IN CODE
============================================================

Since we may not have final art assets, create strong procedural placeholder art that already looks intentional.

Player robot:
- small cyan/white robot
- round or square head
- glowing visor
- tiny antenna or backpack field emitter
- squash/stretch on movement
- simple thruster/jump particles

Slimes:
- colorful blobs
- eyes
- squash/stretch
- wobble animation
- distinct colors per type

Containment field:
- transparent cyan sphere
- animated outline
- inner glow
- small electric arcs
- trapped slime visible inside

Platforms:
- dark metal lab platforms
- neon edges
- occasional slime drips
- readable collision boundaries

Background:
- dark lab wall
- subtle parallax
- pipes/reactor silhouettes
- animated small lights
- no clutter behind gameplay

Portal:
- glowing exit ring
- opens only after clear
- cyan or gold

============================================================
12. AUDIO
============================================================

Implement lightweight audio if feasible.

Use either:
- tiny generated WebAudio SFX, or
- very small placeholder audio system ready for assets later

SFX needed:
- shoot
- trap
- pop
- chain pop
- enemy escape
- player jump
- player land
- player hurt
- collect scrap
- level clear
- upgrade selected
- game over
- victory

Requirements:
- volume controls
- muted by default only if browser autoplay requires it
- resume AudioContext on first user interaction
- pitch variation for repeated pop sounds
- avoid annoying harsh sounds

Music:
Optional. If implemented, keep it lightweight and subtle.
A simple generated loop is acceptable.

============================================================
13. ARCHITECTURE REQUIREMENTS
============================================================

Keep the codebase clean and maintainable.

Suggested structure:

src/
  main.ts
  game/
    config.ts
    constants.ts
    scenes/
      BootScene.ts
      PreloadScene.ts
      MainMenuScene.ts
      GameScene.ts
      UpgradeScene.ts
      GameOverScene.ts
      VictoryScene.ts
    entities/
      Player.ts
      SlimeEnemy.ts
      BasicSlime.ts
      BouncerSlime.ts
      ChargerSlime.ts
      ShieldSlime.ts
      ContainmentField.ts
      ScrapPickup.ts
      Portal.ts
    systems/
      LevelManager.ts
      UpgradeSystem.ts
      ComboSystem.ts
      SaveSystem.ts
      AudioSystem.ts
      EffectsSystem.ts
      InputSystem.ts
      CrazyGamesAdapter.ts
    data/
      levels.ts
      upgrades.ts
    ui/
      Hud.ts
      UpgradeCard.ts
    utils/
      math.ts
      timing.ts
      debug.ts

Do not make one giant file.
Do not over-engineer.
Use clear TypeScript types.
Use data-driven levels and upgrades.
Use constants for tuning values.
Comment important gameplay logic.

============================================================
14. PHYSICS REQUIREMENTS
============================================================

Use Phaser Arcade Physics unless there is a strong reason not to.

Important:
- stable platformer movement
- fixed/normalized delta where necessary
- avoid refresh-rate dependent physics bugs
- test high refresh rate assumptions
- do not make jump height depend on frame rate
- tune gravity and velocity carefully

Player movement should feel:
- responsive
- forgiving
- arcade-like
- not floaty unless intentionally tuned
- not slippery

Containment field physics:
- fields move clearly
- collision with slimes is reliable
- trapped enemies should not break physics
- trapped fields float upward slowly
- field pop detection must be reliable

============================================================
15. CRAZYGAMES SDK ADAPTER
============================================================

Create a CrazyGamesAdapter wrapper, but make it safe in local dev.

Requirements:
- Detect whether window.CrazyGames exists.
- If unavailable, use no-op fallbacks.
- Do not crash locally.
- Prepare methods for:
  - init()
  - loadingStart()
  - loadingStop()
  - gameplayStart()
  - gameplayStop()
  - happyTime() if appropriate after big achievements
  - requestMidgameAd() only at safe moments, not during action
  - save/load data later if cloud save is added

Important:
- Do not block the basic game if SDK is unavailable.
- Do not show external ads.
- Do not call ad breaks during active gameplay.
- Safe ad moments could be:
  - after game over
  - after several levels
  - before returning to menu
- Do not implement aggressive monetization in this prototype.

If SDK script setup is not included yet, leave clear TODO comments in index.html and CrazyGamesAdapter.ts.

============================================================
16. PERFORMANCE REQUIREMENTS
============================================================

Target:
- 60 FPS on average desktop browser
- lightweight build
- fast startup
- no memory leaks when restarting levels
- no runaway particle emitters
- no console spam in production
- no huge base64 assets
- no unnecessary libraries

Add:
- particle quality setting
- debug mode flag
- clean entity destruction
- object pooling for fields/particles if needed
- cap max particles
- cap max active pickups
- cap max active fields

============================================================
17. POLISH PASS REQUIREMENTS
============================================================

After implementing the first working version, do a polish pass.

Check:
- Is the first level fun within 10 seconds?
- Is the player ever confused?
- Is the trap/pop mechanic obvious?
- Are enemies readable?
- Are fields readable?
- Is the chain reaction satisfying?
- Does the game restart quickly?
- Is the HUD readable?
- Does the game run without console errors?
- Does resizing work?
- Does pausing work?
- Are settings saved?
- Is there any copyrighted or derivative content? Remove it.

============================================================
18. ACCEPTANCE CRITERIA
============================================================

The task is complete only when all of this is true:

1. The game runs locally with npm run dev.
2. The game builds with npm run build.
3. There are no TypeScript errors.
4. There are no obvious console errors during normal play.
5. There is a playable main menu.
6. There is a complete first-run onboarding flow.
7. There are at least 12 playable levels.
8. There are at least 4 enemy types.
9. The player can trap enemies in energy fields.
10. Trapped enemies float and can escape.
11. The player can pop trapped enemies.
12. Chain pops work.
13. Score/combo/scrap rewards work.
14. Upgrade choices appear every 3 levels.
15. Game over works.
16. Victory works.
17. Settings save locally.
18. The game is original and does not copy protected Bubble Bobble assets, names, dragons, layouts, music, or enemy designs.
19. The game is readable at common CrazyGames iframe sizes.
20. The game has clear comments and a short README.

============================================================
19. README REQUIREMENTS
============================================================

Create or update README.md with:

- Game title
- Short description
- Controls
- How to run
- How to build
- Current features
- Known limitations
- CrazyGames integration notes
- Legal/originality note: this is an original game inspired by general arcade containment mechanics, with original characters, world, art, and mechanics

============================================================
20. IMPLEMENTATION STRATEGY
============================================================

Work in this order:

Step 1:
Inspect repo and identify current project structure.

Step 2:
Set up or verify Vite + Phaser + TypeScript.

Step 3:
Create scenes and boot flow:
Boot → Preload → Main Menu → Game → Upgrade/GameOver/Victory.

Step 4:
Create procedural textures/art:
robot, slimes, platforms, fields, pickups, portal.

Step 5:
Implement player movement with good feel:
coyote time, jump buffer, responsive movement.

Step 6:
Implement basic slime and containment field.

Step 7:
Implement pop and chain-pop system.

Step 8:
Implement level manager and first 3 tutorial levels.

Step 9:
Implement HUD, score, scrap, hearts.

Step 10:
Implement remaining enemies and 12 levels.

Step 11:
Implement upgrade system.

Step 12:
Implement boss/finale if feasible.

Step 13:
Implement audio and effects.

Step 14:
Implement settings and local save.

Step 15:
Implement CrazyGamesAdapter no-op-safe wrapper.

Step 16:
Polish, balance, fix bugs, optimize, update README.

Do not stop after creating scaffolding. Deliver a playable game.

============================================================
21. GAME FEEL TUNING VALUES — STARTING POINTS
============================================================

Use these as initial values, then tune by feel:

Player:
- move speed: 180–240 px/s
- acceleration: fast
- deceleration: fast
- jump velocity: 360–460 px/s
- gravity: 900–1300 px/s²
- coyote time: 80–120 ms
- jump buffer: 100–140 ms
- invulnerability after hit: 1000 ms

Containment field:
- speed: 260–360 px/s
- lifetime if empty: 1200–1800 ms
- trap duration: 3500–5000 ms
- float speed while trapped: 25–45 px/s upward
- base pop radius: 70–100 px
- upgraded pop radius: up to 140 px
- fire cooldown: 300–500 ms

Combo:
- combo window: 900–1300 ms
- chain delay: 80–150 ms
- score multiplier increases per chained pop
- scrap bonus every 3+ chain

Enemies:
- basic slime speed: 60–90 px/s
- bouncer speed: 70–110 px/s
- charger windup: 700–1000 ms
- charger speed: 220–300 px/s
- shield slime: slower but tougher

These values are not fixed. Tune for fun.

============================================================
22. IMPORTANT DESIGN PRIORITIES
============================================================

Prioritize in this order:

1. Fun first 10 seconds
2. Responsive movement
3. Reliable trap/pop mechanic
4. Satisfying chain reactions
5. Readability
6. Performance
7. Progression
8. Visual polish
9. More content

Do not prioritize:
- huge content volume
- complex story
- multiplayer
- advanced procedural generation
- complicated economy
- realistic physics
- excessive menus
- heavy asset pipelines

============================================================
23. FINAL SELF-REVIEW
============================================================

Before finishing, perform a self-review and report:

- What was implemented
- What files were created/changed
- How to run the game
- How to build the game
- Any known limitations
- Suggested next steps
- Whether CrazyGames-specific requirements were considered
- Whether any risky derivative elements were avoided

Also run:
npm run build

If build fails, fix it before finishing.

Remember:
The goal is not to create a tiny technical demo.
The goal is to create the strongest possible first playable version of an original CrazyGames-ready arcade platformer called Slime Pop Protocol.