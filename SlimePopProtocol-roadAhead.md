# Slime Pop Protocol — Road Ahead

**Document purpose:** This document describes a broad, long-term development roadmap for **Slime Pop Protocol**, a browser-based arcade containment platformer about a tiny repair robot trapping slime mutants inside glowing energy fields and chain-popping them for combos, scrap, upgrades, and level clears. It is intentionally expansive: it covers immediate improvements, medium-term production priorities, CrazyGames-readiness, and many possible future systems the game *could* grow into if developed beyond the current prototype.

**Current project baseline:** The project is currently a **Vite + TypeScript + Phaser 3** game with no runtime dependencies beyond Phaser. It already includes a complete scene flow, 12 handcrafted arena levels, procedural textures, synthesized Web Audio SFX, keyboard/mouse/gamepad input, a localStorage save system, options menu, upgrade choices every few levels, a combo system, screen shake, particles, a mini-boss, four slime enemy types, and a safe CrazyGames SDK adapter. The core loop is already clear:

```text
TRAP → FLOAT → POP → CHAIN → COLLECT → CLEAR
```

**Core strategic principle:** The game should not merely become “a bigger Bubble Bobble-like game.” It should become **a highly polished, original, modern browser arcade containment game**: immediately understandable, cute, juicy, responsive, legally distinct, easy to replay, strong at small iframe sizes, and suitable for CrazyGames’ broad casual audience.

---

## 1. Product Vision

### 1.1 One-sentence pitch

**Slime Pop Protocol is a neon arcade containment platformer where a tiny repair robot traps mutated slimes inside energy fields, chain-pops them for massive combos, collects scrap, upgrades its lab gear, and restores order to a corrupted slime facility.**

### 1.2 Player promise

The player should quickly feel:

- “I understand the mechanic immediately.”
- “The robot feels responsive and forgiving.”
- “Trapping a slime feels good.”
- “Popping a containment field feels extremely satisfying.”
- “Chain reactions make me feel clever.”
- “Every level is short enough that I want one more try.”
- “The game looks cute, readable, and premium.”
- “There is more to unlock, but I am not overwhelmed.”
- “This is inspired by a classic arcade fantasy, but it clearly has its own identity.”

### 1.3 Market positioning

Slime Pop Protocol should position itself as a **modern arcade platformer with a containment-chain-reaction hook**, not as a remake, clone, or nostalgia product.

Possible positioning language:

- “Trap slime. Pop fields. Chain the lab back together.”
- “A cute neon containment arcade game.”
- “Capture bouncing slimes in energy bubbles and trigger explosive combos.”
- “A fast browser arcade platformer with chain-reaction combat.”
- “A modern single-screen arcade game built for short, satisfying sessions.”

### 1.4 Design identity

The project’s current identity is strong and should be protected:

- Player: small repair robot / lab maintenance bot.
- Enemies: slime mutants, reactor blobs, gloop creatures, armored slimes.
- Weapon: energy containment emitter.
- World: corrupted neon bio-lab / containment facility.
- Reward: scrap, batteries, cells, crystals, modules.
- Core satisfaction: trap several enemies, then pop one field and watch the chain cascade.

Avoid drifting into:

- dragons,
- fantasy bubble worlds,
- direct Bubble Bobble visual language,
- direct level-layout imitation,
- generic “space shooter” aesthetics,
- overly dark horror labs,
- military sci-fi,
- realistic gore,
- or UI-heavy upgrade clutter.

---

## 2. Current Strengths To Preserve

### 2.1 Clear core loop

The current loop is excellent for browser arcade play:

```text
Move → jump → shoot field → trap slime → pop field → chain → collect scrap → open portal
```

It is simple enough to understand in seconds, but has room for skill expression through timing, positioning, chain setup, and enemy prioritization.

Future features should deepen this loop rather than replace it.

### 2.2 Original containment framing

The game already avoids the most dangerous IP similarities by using:

- a robot instead of dragons,
- containment fields instead of bubbles,
- slime mutants instead of classic arcade enemies,
- a neon lab setting instead of a fantasy cave world,
- scrap/upgrades instead of direct score-item mimicry.

This originality should remain central.

### 2.3 Strong procedural asset pipeline

The game generates its textures and sounds at boot. This gives it major advantages for CrazyGames:

- tiny payload,
- no external asset licensing risk,
- fast load,
- easy palette consistency,
- easy variant generation,
- no heavy sprite sheets,
- no CDN dependency.

Preserve this unless adding carefully compressed custom art later has a clear benefit.

### 2.4 Phaser + TypeScript architecture

The current scene/system split is sensible:

- scenes for menu, options, gameplay, HUD, upgrades, victory, etc.,
- data-driven levels,
- data-driven upgrades,
- entity classes for player, slimes, fields, pickups, portal,
- systems for input, audio, effects, combos, save, SDK, level construction.

This is a good foundation. Avoid rewriting everything prematurely.

### 2.5 Built-in CrazyGames awareness

The project already has a safe SDK adapter and avoids mid-action ads. This is the right design principle.

Keep:

- no-op local fallback,
- safe loading/gameplay lifecycle calls,
- ads only between levels or after game over,
- no custom fullscreen button,
- iframe-friendly scaling.

### 2.6 Juicy feedback already present

The game already includes particles, shockwaves, floating combo text, screen shake, procedural SFX, and neon visuals. These should be improved, not discarded.

---

## 3. Strategic Risks

### 3.1 Risk: being perceived as too close to Bubble Bobble

Even if the code and art are original, the broad mechanic “trap enemies in bubbles and pop them” is familiar. The solution is not to hide the inspiration, but to make the new identity unmistakable.

Strengthen:

- robot/lab fantasy,
- containment-field terminology,
- slime-mutation enemy design,
- reactor/biohazard objectives,
- upgrade modules,
- chain-reaction systems,
- lab-map campaign,
- modern neon presentation.

Avoid:

- dragon silhouettes,
- bubble-shaped cute dinosaurs,
- similar enemy silhouettes,
- direct item/fruit score reward mimicry,
- EXTEND-like systems,
- identical level pacing,
- overly retro UI imitation.

### 3.2 Risk: overcomplicating a simple arcade mechanic

The game’s strength is immediate comprehension. If too many systems appear early, the player may bounce.

Rule:

> Add depth through optional mastery and progressive unlocks, not through front-loaded menus.

### 3.3 Risk: visual effects harming readability

Neon glow, particles, and shockwaves are valuable, but gameplay clarity is more valuable.

The player must always read:

- robot position,
- enemy position,
- active containment fields,
- trapped vs untrapped enemies,
- field escape timer,
- enemy telegraphs,
- portal location,
- hazards,
- pickups,
- remaining health.

Any effect that hides this information should be reduced.

### 3.4 Risk: desktop-only input

The current README notes that mobile touch controls are not implemented. For CrazyGames, this is a major opportunity and a major risk.

The game can work as desktop-only, but its ceiling is higher if it supports:

- touch joystick,
- jump button,
- shoot button,
- pause/settings,
- responsive UI,
- large enough touch targets,
- optional auto-aim assistance.

### 3.5 Risk: too few levels or too short a content runway

The current 12 levels are good for a vertical slice. A serious CrazyGames release likely needs either:

- more campaign levels,
- repeatable challenge modes,
- daily levels,
- score chase,
- difficulty variants,
- unlockable modifiers,
- or a procedural/endless mode.

The goal is not infinite content, but enough replay value to support 10+ minute sessions and return visits.

---

## 4. Development Philosophy

### 4.1 Protect the first 10 seconds

The first 10 seconds should communicate:

- the player is a robot,
- slimes are dangerous,
- shooting creates containment fields,
- trapped slimes can be popped,
- popping is satisfying,
- clearing the level opens the portal.

No long lore screen. No overloaded menu. No dense tutorial. No instant death.

### 4.2 Improve feel before adding systems

Priority order:

1. Movement feel.
2. Jump forgiveness.
3. Field firing feel.
4. Trap reliability.
5. Pop feedback.
6. Chain clarity.
7. Level readability.
8. Enemy telegraphs.
9. Mobile controls.
10. Progression and retention.

### 4.3 Make every level teach or test one idea

A level should have a reason to exist:

- teach basic trap/pop,
- teach chain reactions,
- teach vertical field timing,
- introduce bouncers,
- introduce chargers,
- introduce shield slimes,
- teach hazards,
- test enemy combinations,
- create a combo puzzle,
- create a boss pattern.

Avoid random layouts.

### 4.4 Add depth through combinations

The best arcade depth comes from combining simple parts:

- two slime types,
- one platform gimmick,
- one hazard,
- one chain opportunity,
- one reward objective.

Do not introduce five new ideas at once.

### 4.5 Keep production lightweight

Because this is a browser game, prefer:

- procedural visuals,
- compact data,
- low texture count,
- small audio footprint,
- deterministic systems where possible,
- limited dependencies,
- fast build/load.

---

## 5. Immediate Production Priorities

These are the most important improvements before expanding the game heavily.

### 5.1 Add mobile/touch controls

This should be one of the highest-priority roadmap items.

Recommended touch layout:

- left side: virtual joystick or left/right buttons,
- right side: jump button,
- right side: shoot/pop button,
- optional: secondary “burst”/dash button if later added,
- top-right: pause/settings.

Design principles:

- touch buttons must be large,
- controls must not cover the player or enemies,
- UI should adapt to landscape mobile,
- joystick opacity should be low but visible,
- input should feel forgiving,
- shooting direction should be obvious.

Possible mobile aim models:

1. **Facing-direction shot**
   - simplest,
   - player shoots left/right based on movement direction,
   - works like classic platformers.

2. **Tap-to-shoot direction**
   - tapping right half shoots toward tap point,
   - more precise but more complex.

3. **Auto-aim assist**
   - shoot toward nearest visible slime within a cone,
   - best for casual mobile accessibility,
   - must not trivialize the game.

4. **Hybrid**
   - manual direction on desktop,
   - light aim assistance on touch.

### 5.2 Improve first-run onboarding

The current How-To scene is useful, but the first level should teach through play.

Suggested first-run flow:

```text
Main Menu → PLAY → Level 1 starts immediately
Small prompt: Move
Small prompt: Jump
Small prompt: Shoot field
Slime gets trapped
Prompt: Touch or shoot field to pop
Pop effect
Portal opens
Prompt: Enter portal
```

Avoid showing all controls at once.

### 5.3 Add a clearer tutorial level variant

Level 1 should be almost impossible to fail unless the player walks directly into the slime repeatedly.

Possible changes:

- slow or semi-stationary first slime,
- wide floor,
- one platform only,
- slime starts far enough away,
- field hitbox slightly generous,
- prompt appears near action,
- first trap can be assisted/guaranteed,
- first pop creates exaggerated VFX.

### 5.4 Improve containment-field readability

The field has several states. Each state should be visually distinct:

1. **Empty field**
   - cyan transparent sphere,
   - small moving core,
   - fades over lifetime.

2. **Trapping field**
   - expands slightly on capture,
   - slime visibly compressed/contained,
   - rim becomes brighter.

3. **Stable trapped field**
   - floating upward,
   - calm hum,
   - clear outline.

4. **Warning trapped field**
   - flashes yellow/orange,
   - timer ring shrinks,
   - audio pulse.

5. **Escape moment**
   - crack effect,
   - field shatters,
   - slime drops/returns.

6. **Pop moment**
   - shockwave,
   - slime splash particles,
   - score/scrap burst.

### 5.5 Tune player hit forgiveness

Player frustration should come from poor decisions, not unclear collisions.

Possible forgiveness features:

- slightly smaller player hurtbox than sprite,
- brief post-hit invulnerability,
- knockback that does not throw player into repeated hits,
- ledge coyote time already exists and should be preserved,
- jump buffering already exists and should be preserved,
- optional “beginner shield” for first few levels,
- visible invulnerability flicker.

### 5.6 Build a better level-select/progress screen

For a 12+ level campaign, a simple level map can help retention.

Start simple:

- grid of level nodes,
- unlocked/completed/locked states,
- best score per level,
- star/medal rating,
- boss level markers.

Do not overbuild a world map too early.

---

## 6. Core Gameplay Expansion

### 6.1 Containment-field variants

The default containment field is the heart of the game. Variants can add depth.

Possible field types:

#### Standard Field

- baseline shot,
- traps one slime,
- can be popped,
- chain-reacts.

#### Heavy Field

- slower projectile,
- larger radius,
- stronger trap duration,
- good for shield slimes and boss adds.

#### Spark Field

- smaller but faster,
- lower cooldown,
- shorter trap duration,
- good for skilled players.

#### Sticky Field

- attaches to walls or platforms,
- traps slimes that touch it,
- creates combo setups.

#### Split Field

- splits into two smaller fields after travel,
- excellent for crowd control,
- must be balanced carefully.

#### Gravity Field

- pulls nearby slimes slightly,
- helps cluster enemies for chain pops.

#### Freeze Field

- traps slime longer,
- slows nearby enemies on pop,
- weaker score multiplier.

#### Overcharge Field

- damages untrapped enemies in pop radius,
- risk: longer cooldown,
- great for panic situations.

#### Bounce Field

- projectile bounces once off wall/platform,
- rewards trick shots.

#### Relay Field

- chain pop radius is smaller, but chain delay is faster,
- creates satisfying cascade effects.

Design caution:

> Field variants should be unlockable loadout choices, not all active at the same time.

### 6.2 Pop interaction improvements

Current pop methods:

- touch field,
- shoot field.

Possible additions:

- jump-stomp field to pop downward,
- dash-through field,
- charged shot to remote-pop,
- chain pop on perfect timing,
- pop field into directional shockwave,
- hold shoot to detonate oldest trapped field,
- double-tap shoot to pop nearest trapped field.

The key is to preserve simplicity. The default should remain intuitive.

### 6.3 Chain reaction system depth

The chain system is the game’s signature. It should be expanded carefully.

Possible chain rules:

- longer chain = higher score multiplier,
- every third chain drops bonus scrap,
- perfect chains fill a Protocol Meter,
- chain through different slime colors gives bonus,
- chain across vertical levels gives “air cascade” bonus,
- boss minions can be chain-popped into boss damage,
- “resonance” fields increase chain radius,
- “unstable” fields explode stronger but have shorter timer.

Possible chain medals:

- Double Pop,
- Triple Pop,
- Cascade x5,
- Full Lab Clear,
- No Escape,
- One-Shot Chain,
- Perfect Containment.

### 6.4 Player movement upgrades

The player already has coyote time, jump buffering, variable jump, and possible double-jump upgrade.

Possible additions:

#### Dash Module

- short horizontal dash,
- can pop fields if upgraded,
- cooldown-based,
- useful for mobility and risk/reward.

#### Wall Kick Module

- player can wall jump from lab walls,
- enables vertical levels,
- must be introduced gradually.

#### Hover Boots

- brief hover after jump,
- useful for casual players,
- may reduce difficulty too much if permanent.

#### Grapple Tether

- tether to containment fields or lab hooks,
- advanced, high-risk feature,
- could become too different from core game.

#### Stomp Boots

- downward slam,
- pops fields below,
- stuns slimes,
- high satisfaction.

#### Magnetic Boots

- walk on certain ceiling rails,
- strong level-gimmick potential,
- should be reserved for later worlds.

### 6.5 Shooting upgrades

Possible emitter upgrades:

- faster recharge,
- wider fields,
- longer trap duration,
- larger pop radius,
- faster projectile speed,
- two active shots at once,
- pierce one enemy,
- ricochet once,
- charged shot,
- remote detonation,
- homing micro-adjustment,
- field lifespan extension,
- temporary rapid-fire battery pickup.

Avoid making the player overpowered too early. The game needs the player to set up chains, not simply spam shots.

---

## 7. Enemy Roadmap

The current enemies are a good start:

- Basic Slime,
- Bouncer Slime,
- Charger Slime,
- Shield Slime,
- Reactor Blob mini-boss.

Future enemy design should follow this rule:

> Every slime type should teach a different trap/pop behavior.

### 7.1 New standard slime types

#### Splitter Slime

- splits into two smaller slimes when popped unless chain-popped,
- encourages careful timing,
- similar danger to classic splitting hazards, but framed as slime mitosis.

#### Sticky Slime

- leaves temporary slime patches on platforms,
- patches slow the player,
- can be cleaned by popping fields nearby.

#### Electric Slime

- periodically emits small arcs,
- arcs can pop fields early,
- must be trapped between pulses.

#### Ghost Slime

- phases through platforms,
- only solid when glowing,
- rewards timing.

#### Spore Slime

- releases small spores if left alive too long,
- priority target.

#### Mirror Slime

- copies player movement direction loosely,
- creates funny/challenging patterns.

#### Magnet Slime

- pulls scrap and fields slightly,
- can disrupt chain setups.

#### Heavy Slime

- cannot float quickly when trapped,
- requires longer trap duration or larger field,
- drops extra scrap.

#### Tiny Swarm Slime

- weak but numerous,
- great for chain satisfaction,
- should be introduced after player understands pop radius.

#### Bomb Slime

- explodes after trap timer expires,
- popping safely gives big chain bonus,
- teaches urgency.

#### Medic Slime

- heals shield/armored slimes,
- must be trapped first.

#### Crown Slime

- buffs nearby slimes,
- mini-leader target.

### 7.2 Enemy behavior categories

To keep variety manageable, classify enemies by behavior:

1. **Walker** — basic horizontal patrol.
2. **Jumper** — vertical chaos.
3. **Charger** — telegraphed burst danger.
4. **Armored** — requires multiple trap/pop cycles.
5. **Support** — buffs/heals/summons.
6. **Disruptor** — interferes with fields or movement.
7. **Swarm** — many low-threat enemies for combo joy.
8. **Boss add** — special simplified variants used during boss fights.

### 7.3 Telegraph standards

Every dangerous enemy must telegraph before high-threat actions.

Examples:

- charger flashes yellow before dash,
- bomb slime pulses before explosion,
- electric slime sparks before discharge,
- spore slime inflates before release,
- boss raises arms before slam,
- ghost slime flickers before becoming dangerous.

Telegraphs should be readable without reading text.

### 7.4 Enemy capture differences

Enemy types can interact differently with containment fields:

- Basic: trapped instantly.
- Bouncer: harder to hit but normal trap.
- Charger: can be trapped during windup, harder during dash.
- Shield: requires two trap/pop cycles.
- Heavy: floats slowly.
- Electric: may shorten trap timer.
- Sticky: field moves slower while holding it.
- Ghost: only trappable while visible.
- Bomb: trap timer becomes urgent countdown.

This gives variety without needing huge new systems.

---

## 8. Boss Roadmap

The current Reactor Blob mini-boss is a good foundation. Bosses should be built around containment and chain popping, not generic HP sponges.

### 8.1 Boss design principles

A Slime Pop boss should:

- create minions or hazards that interact with containment fields,
- be vulnerable through chain pops,
- have clear phases,
- telegraph attacks visibly,
- remain readable at iframe size,
- avoid excessive projectile spam,
- reward mastery of the core mechanic.

### 8.2 Possible bosses

#### Reactor Blob

Current mini-boss; expand into a polished first boss.

Possible attacks:

- summon basic slimes,
- ground bounce shockwave,
- slime rain from ceiling,
- shield phase broken by chain pop,
- vulnerable after three minions chain-pop near it.

#### Slime Queen Core

Large central slime attached to reactor tubes.

Mechanic:

- cannot be directly damaged,
- player must trap and pop minions near exposed core vents,
- vents open in sequence.

#### Magnetic Gloop Engine

Boss manipulates fields.

Mechanic:

- pulls containment fields toward itself,
- reverses field direction occasionally,
- creates combo puzzle opportunities.

#### Plated Ooze Tank

Armored boss with breakable plates.

Mechanic:

- shield plates are removed by chain pops,
- direct shots only stun adds,
- phase changes after each plate.

#### Spore Mother

Boss fills arena with spores.

Mechanic:

- spores can be trapped for giant chain bonuses,
- if not managed, they multiply.

#### Quantum Slime Twin

Two linked bosses.

Mechanic:

- popping a field near one charges the other,
- both must be stunned within a window.

#### Final Boss: The Corrupted Protocol

A rogue lab AI merged with slime.

Mechanic:

- changes arena layout,
- spawns enemy waves,
- creates fake containment fields,
- final phase requires massive chain reaction.

### 8.3 Boss rewards

Bosses should unlock meaningful features:

- new world/sector,
- new field type,
- new upgrade branch,
- new robot skin,
- permanent scrap bonus,
- challenge mode variant,
- lore log.

---

## 9. Level Design Roadmap

### 9.1 Campaign structure

A strong release version could have 30–60 levels divided into lab sectors.

Possible sectors:

1. **Calibration Wing**
   - basic movement,
   - basic slime,
   - simple trap/pop.

2. **Culture Tanks**
   - bouncers,
   - vertical platforms,
   - chain setups.

3. **Reactor Lanes**
   - chargers,
   - moving platforms,
   - timed hazards.

4. **Armor Lab**
   - shield slimes,
   - heavy slimes,
   - multi-cycle traps.

5. **Waste Pipes**
   - slime puddles,
   - conveyors,
   - sticky mechanics.

6. **Electric Containment**
   - arcs,
   - field disruptors,
   - timed safe zones.

7. **Bio-Dome Rupture**
   - spore enemies,
   - organic hazards,
   - swarm levels.

8. **Core Protocol**
   - mixed enemies,
   - boss gauntlets,
   - final encounter.

### 9.2 Level types

Not every level should be the same. Possible formats:

#### Standard Clear

Clear all slimes, open portal.

#### Combo Challenge

Level is easy to survive but designed for big chains.

#### Survival Timer

Survive until lab purge completes.

#### Rescue Level

Protect small helper bots trapped in tubes.

#### Reactor Stabilization

Pop fields near reactor nodes to charge them.

#### Hazard Puzzle

Use fields to trigger switches or block hazards.

#### Mini-Boss Room

One larger enemy with simple phases.

#### Swarm Room

Many tiny slimes, high combo satisfaction.

#### Escape Room

Portal appears immediately, but extra scrap is risky.

#### Challenge Variant

Same level with modifier: low gravity, faster slimes, one heart, etc.

### 9.3 Level objectives

Add optional objectives for replayability:

- clear level,
- clear under time limit,
- no damage,
- max chain of 3+,
- collect all scrap,
- no slime escapes,
- pop all slimes using chains,
- complete without jumping too many times,
- defeat boss without shield breaking.

These can produce medals/stars.

### 9.4 Level hazards

Possible hazards:

#### Slime Puddles

- slow player,
- can be cleaned by nearby pop.

#### Laser Gates

- turn on/off rhythmically,
- high readability required.

#### Conveyor Belts

- move player/slimes/fields,
- good for factory-lab theme.

#### Bounce Pads

- launch robot or slimes upward,
- create chain opportunities.

#### Electric Rails

- dangerous when active,
- can be disabled by popping fields near switch nodes.

#### Reactor Vents

- periodically blast upward,
- can push fields into chains.

#### Acid Drips

- falling droplets,
- simple timing hazard.

#### Moving Platforms

- basic, predictable movement,
- do not overuse early.

#### Gravity Panels

- change field float direction locally,
- advanced later-world mechanic.

#### Lockdown Doors

- close/open based on enemy count or switches.

### 9.5 Level data improvements

Current levels are declarative TypeScript data. Expand the schema gradually:

```ts
level = {
  id,
  name,
  sector,
  hint,
  player,
  exit,
  platforms,
  slimes,
  hazards,
  pickups,
  scripts,
  background,
  musicMood,
  medals,
  unlocks,
}
```

Keep level data readable. Do not overbuild a full scripting engine unless needed.

### 9.6 Level editor possibility

A small internal level editor could accelerate production.

Possible features:

- place platforms,
- place player spawn,
- place portal,
- place slime spawns,
- place hazards,
- test instantly,
- export TypeScript/JSON level data,
- show grid/snap,
- simulate enemy paths.

This is useful only if the game will have many levels. For 20–30 levels, hand-authored data may be enough.

---

## 10. Progression Systems

### 10.1 Upgrade choice system

The current upgrade system offers choices every 3 levels. This is strong and should be expanded.

Potential new upgrades:

#### Field Upgrades

- Bigger fields.
- Faster recharge.
- Longer trap duration.
- Larger chain radius.
- Faster field projectile.
- Ricochet field.
- Sticky field.
- Double field capacity.
- Remote pop.
- Trap two tiny enemies in one field.

#### Robot Movement Upgrades

- Double jump.
- Dash.
- Faster movement.
- Hover.
- Wall kick.
- Stomp pop.
- Reduced knockback.
- Higher jump.
- Air control.

#### Defense Upgrades

- Backup shield.
- Extra heart.
- Longer invulnerability.
- Slime puddle resistance.
- Electric resistance.
- First-hit auto-pop shockwave.

#### Economy Upgrades

- More scrap from chains.
- Bonus scrap from boss kills.
- Magnet range.
- Chance for rare crystals.
- Level-clear bonus.
- No-damage bonus.

#### Combo Upgrades

- Longer combo window.
- Faster chain propagation.
- Bigger combo score multiplier.
- Protocol Meter fills on chains.
- Chain pops slow time briefly.

### 10.2 Meta-upgrades between runs

Permanent progression can improve retention, but must not make the game feel grindy.

Possible permanent upgrades:

- starting hearts +1,
- small field cooldown reduction,
- small scrap bonus,
- unlock field variants,
- unlock robot skins,
- unlock challenge modes,
- unlock lab sectors,
- upgrade magnet pickup duration,
- unlock starting module slots.

Avoid pay-to-win feeling. Make skill still matter.

### 10.3 Module loadout system

A simple module system could add strategic depth.

Example:

- Player can equip 2–3 modules before a run.
- Modules alter playstyle.

Possible modules:

- Chain Reactor: bigger chain radius, lower score per direct pop.
- Safety Shell: start with shield, lower score multiplier.
- Speed Frame: faster movement, lower trap duration.
- Collector Coil: magnet scrap, weaker field size.
- Overcharge Emitter: stronger pops, longer cooldown.
- Precision Lens: faster projectile, smaller field.

This creates replayability without cluttering levels.

### 10.4 Scrap economy

Scrap should be simple and meaningful.

Possible currencies:

1. **Scrap** — common currency.
2. **Energy Cells** — level/boss rewards for important unlocks.
3. **Slime Crystals** — rare challenge/boss reward.

Avoid too many currencies. Start with scrap only, then add one rare currency if needed.

### 10.5 Star/medal progression

Medals give players goals beyond completion.

Example medal criteria:

- Bronze: clear level.
- Silver: clear under target time.
- Gold: no damage + all scrap.
- Protocol: perfect chain objective.

Medals can unlock:

- challenge levels,
- cosmetics,
- hard mode,
- alternate robot colors,
- bonus lab lore.

### 10.6 Skill tree possibility

A small skill tree could work, but only later.

Possible branches:

- Containment Tech,
- Mobility Frame,
- Scrap Recovery,
- Safety Systems,
- Chain Resonance.

Keep it compact. A huge tree is not necessary for an arcade game.

---

## 11. Game Modes

### 11.1 Campaign Mode

Primary mode.

- sequential levels,
- boss every sector,
- progressive enemy introductions,
- upgrades every few levels,
- medals per level,
- saved progress.

### 11.2 Arcade Run Mode

A run-based mode:

- start at level 1,
- random upgrade choices,
- limited lives,
- score-focused,
- ends on death or final boss,
- leaderboard-friendly.

This could be the strongest long-session mode.

### 11.3 Daily Protocol

A daily challenge:

- fixed seed,
- fixed level sequence or modifier,
- same for all players,
- one leaderboard score,
- reward scrap/cosmetic.

Modifiers:

- one heart,
- tiny fields,
- fast slimes,
- chain bonus x2,
- low gravity,
- no upgrades,
- random enemies.

### 11.4 Endless Containment

Survive waves in one arena.

Loop:

```text
wave → collect scrap → choose upgrade → wave → mini-boss → repeat
```

Benefits:

- replayable,
- easy to extend,
- good for average playtime,
- good for leaderboards.

Risks:

- could overshadow handcrafted campaign,
- requires careful difficulty scaling.

### 11.5 Boss Rush

Unlock after campaign.

- fight bosses back-to-back,
- choose one upgrade between fights,
- track best time/damage taken.

### 11.6 Puzzle Labs

Puzzle-like levels focused on chain setup.

- no time pressure,
- fewer enemies,
- specific chain objectives,
- good for players who enjoy mastery.

### 11.7 Speedrun Mode

For skilled players.

- timer always visible,
- instant restart,
- no dialogue,
- split times by sector,
- ghost comparison optional.

### 11.8 Co-op Mode

A future major feature.

Local two-player co-op could be extremely charming:

- two robots,
- shared or separate health,
- players can pop each other’s fields,
- chain combo bonuses for teamwork,
- revive mechanic,
- special co-op levels.

Input challenge:

- keyboard + gamepad,
- two gamepads,
- touch co-op is likely too hard.

Do not add co-op until single-player feel is excellent.

### 11.9 Versus Mode

Optional late feature.

Ideas:

- two players compete to clear their side first,
- popping chains sends slime hazards to opponent,
- local only,
- party-game style.

Could be fun but not core.

---

## 12. Retention and Live-Ops Systems

### 12.1 Daily login reward

Simple, non-intrusive:

- day 1: scrap,
- day 2: battery boost,
- day 3: cosmetic color,
- day 4: challenge ticket,
- day 5: rare module part.

No aggressive monetization. Keep it friendly.

### 12.2 Daily missions

Examples:

- Pop 20 trapped slimes.
- Achieve a chain of 4.
- Clear 3 levels.
- Defeat 5 chargers.
- Collect 100 scrap.
- Complete a level without taking damage.
- Clear one Daily Protocol.

Rewards:

- scrap,
- cosmetics,
- small permanent progression.

### 12.3 Weekly lab events

Events can refresh content without changing core code.

Examples:

- Electric Week: more electric slimes.
- Swarm Week: tiny slimes everywhere.
- Gold Scrap Rush: more scrap drops.
- Boss Instability: bosses gain modifiers.
- Low Gravity Lab: altered physics.

### 12.4 Achievement system

Achievement examples:

- First Containment.
- First Chain Pop.
- Triple Cascade.
- No Escape.
- Scrap Collector.
- Charger Catcher.
- Shield Breaker.
- Reactor Shutdown.
- Perfect Calibration.
- Daily Protocol Complete.
- Boss Rush Clear.

Achievements should support both casual and skill players.

### 12.5 Leaderboards

Potential leaderboard types:

- best Arcade Run score,
- fastest campaign sector clear,
- Daily Protocol score,
- Endless Containment wave,
- Boss Rush time,
- highest chain.

If using CrazyGames leaderboards, keep integration optional and safe.

### 12.6 Return screen

When the player returns:

- show progress summary,
- show new daily mission,
- show latest unlock,
- offer Continue button,
- avoid overwhelming popups.

---

## 13. UI/UX Roadmap

### 13.1 Main menu

The main menu should be minimal and attractive.

Recommended primary actions:

- Play,
- Level Select,
- Daily Protocol,
- Upgrades/Lab,
- Options.

Early version can show only:

- Play,
- How To Play,
- Options.

After progression exists, reveal more.

### 13.2 HUD improvements

HUD should show only what matters:

- hearts,
- score,
- scrap,
- combo,
- current level,
- active upgrades,
- boss HP when relevant,
- field cooldown if useful.

Avoid large panels during action.

### 13.3 In-game objective prompts

Small contextual prompts:

- “Trap the slime!”
- “Pop the field!”
- “Chain nearby fields!”
- “Portal open!”
- “Warning: slime escaping!”

Prompts should disappear quickly and never block gameplay.

### 13.4 Upgrade screen

The upgrade screen should be highly satisfying.

Recommended design:

- three cards,
- strong icons,
- readable title,
- one-line effect,
- stack count,
- rarity color,
- preview of current stats if possible.

Avoid paragraphs.

### 13.5 Level complete screen

Show:

- level name,
- score,
- best score,
- chain bonus,
- scrap collected,
- medal earned,
- next level button,
- replay button.

Keep it fast. The player should be able to continue instantly.

### 13.6 Game over screen

Should encourage one more try.

Show:

- cause of failure,
- best level,
- score,
- scrap earned,
- one tip,
- restart button,
- upgrades/lab button.

Avoid making death feel punishing or slow.

### 13.7 Options/accessibility menu

Current options are a good start. Expand with:

- master volume,
- SFX volume,
- music volume,
- screen shake,
- particle quality,
- reduced motion,
- high contrast mode,
- colorblind-friendly slime palette,
- touch controls toggle/customization,
- input remapping,
- reset save,
- language selection if localized.

### 13.8 World/lab map screen

Future level map:

- lab sectors as connected nodes,
- boss nodes,
- locked doors,
- medals visible,
- daily challenge node,
- upgrade lab node.

Keep it readable and not too large.

---

## 14. Visual Roadmap

### 14.1 Robot polish

The robot is the game’s mascot. It should become highly recognizable.

Possible improvements:

- clearer silhouette,
- glowing eyes/sensor,
- small antenna,
- tiny thruster feet,
- emitter arm,
- squash/stretch on landing,
- recoil on shooting,
- hurt animation,
- victory pose,
- idle blink,
- low-health sparks,
- unlockable color variants.

### 14.2 Slime polish

Slimes should be cute but dangerous.

Improve:

- color-coded enemy types,
- unique silhouettes,
- facial expressions,
- squash/stretch,
- trap reaction faces,
- panic before escape,
- splash particles on pop,
- armor break animation,
- charger windup animation.

### 14.3 Containment field VFX

The field is the most important visual object.

Enhancements:

- translucent rim,
- inner swirl,
- refraction-like shimmer,
- lifetime ring,
- warning cracks,
- pop shockwave,
- chain lightning between fields,
- color change based on field type,
- contained slime wobble.

### 14.4 Background depth

Backgrounds should look premium but not distract.

Ideas:

- reactor tubes,
- slime tanks,
- warning lights,
- parallax lab walls,
- animated fluid in glass cylinders,
- occasional sparks,
- distant conveyor belts,
- silhouettes of lab machinery,
- color variation by sector.

Keep contrast low behind gameplay objects.

### 14.5 Platform readability

Platforms must always be readable.

Improve:

- consistent collision edges,
- glowing rim only on top edge,
- subtle underside shadow,
- different but compatible tiles by sector,
- hazard platforms with distinct warning colors.

### 14.6 Particle quality tiers

Maintain low/normal/high effect settings.

Low:

- fewer particles,
- no expensive trails,
- reduced glow.

Normal:

- current juicy baseline.

High:

- extra shockwave rings,
- field trails,
- background particles,
- more pop debris.

### 14.7 Thumbnail/cover art direction

A strong CrazyGames thumbnail should show:

- cute robot in action,
- large glowing containment field,
- trapped slime inside,
- chain explosion nearby,
- neon lab background,
- clear title/logo,
- very high contrast,
- not too many objects.

Avoid:

- tiny gameplay screenshot,
- cluttered UI,
- generic slime pile,
- looking like Bubble Bobble,
- unreadable text.

---

## 15. Audio Roadmap

### 15.1 Music

The README notes no music track yet. This is a major polish opportunity.

Options:

1. **Procedural synth loop**
   - fits current no-assets philosophy,
   - tiny payload,
   - dynamic intensity possible.

2. **Small compressed music loops**
   - more polished if produced well,
   - increases file size,
   - must loop seamlessly.

3. **Hybrid**
   - procedural ambience + small melodic stingers.

Recommended moods:

- menu: cute neon lab groove,
- early levels: light synth bounce,
- danger: faster arpeggios,
- boss: heavier reactor rhythm,
- victory: bright fanfare,
- game over: short glitchy sting.

### 15.2 Dynamic music

Music could react to:

- number of slimes remaining,
- combo chain,
- boss phase,
- low health,
- trapped fields about to escape,
- portal opened.

Keep transitions simple.

### 15.3 SFX improvements

Core SFX should be extremely satisfying:

- shoot field,
- successful trap,
- field floating hum,
- warning pulse,
- pop,
- chain pop,
- scrap pickup,
- portal open,
- robot hurt,
- shield absorb,
- boss hit,
- upgrade selected.

Chain pops should escalate pitch or intensity.

### 15.4 Voice/robot barks

Optional future feature.

Short synthesized robot voice lines:

- “Containment online!”
- “Slime secured!”
- “Cascade!”
- “Portal open!”
- “Warning: breach!”
- “Protocol restored!”

Use sparingly. Avoid annoying repetition.

### 15.5 Audio accessibility

- mute all,
- separate music/SFX,
- visual warnings for audio cues,
- no critical information conveyed by sound only.

---

## 16. Narrative and Worldbuilding

### 16.1 Story premise

Simple framing:

> A cheerful repair robot awakens after a containment failure in a neon slime research lab. The lab AI has corrupted the containment protocols. The robot must restore sectors, trap mutated slimes, recover scrap, and reboot the core system.

### 16.2 Light narrative delivery

Avoid long dialogue. Use:

- short sector intro lines,
- terminal logs,
- boss intro messages,
- level names,
- menu flavor text,
- environmental storytelling.

### 16.3 Characters

Possible supporting characters:

#### PATCH

The player robot.

- tiny,
- brave,
- expressive,
- repair-focused.

#### CORE-AI

Friendly but glitchy lab AI.

- gives short tips,
- unlocks sectors,
- occasionally corrupted.

#### DR. GLOOP NOTES

Optional log entries from a scientist.

- humorous,
- explains slime mutations,
- not required reading.

#### Mini Bots

Rescueable helpers.

- cosmetic/collection system,
- cheer in menu/lab.

### 16.4 Sector themes

- Calibration Wing,
- Culture Tanks,
- Reactor Bay,
- Sludge Processing,
- Cryo Containment,
- Electro Lab,
- Bio-Dome,
- Core Chamber.

Each sector can introduce one mechanic and one visual palette.

---

## 17. Cosmetics and Personalization

Cosmetics are good for retention if they do not affect readability.

### 17.1 Robot skins

Possible skins:

- Classic Repair Bot,
- Neon Cyan,
- Safety Yellow,
- Pink Prototype,
- Rusty Scrapper,
- Gold Protocol,
- Ghost Frame,
- Slimeproof Suit,
- Mini Drone Bot,
- Retro Pixel Shell.

### 17.2 Field skins

- standard cyan,
- plasma pink,
- gold ring,
- green bio-field,
- hex shield,
- star bubble,
- glitch field.

Maintain clear trapped/untrapped states.

### 17.3 Slime codex

Unlock enemy entries:

- silhouette,
- behavior description,
- tips,
- number trapped,
- rare variant encountered.

### 17.4 Lab base screen

A future hub could show:

- repaired lab machines,
- rescued mini bots,
- trophy tanks,
- unlocked skins,
- daily challenge terminal.

This should not delay core gameplay.

---

## 18. Monetization and Ads

### 18.1 CrazyGames Basic Launch mindset

During early testing, focus on retention and fun, not ads. Ads should not hurt the core metrics.

### 18.2 Safe ad moments

Ads, if enabled later, should only appear:

- after game over,
- after several levels,
- before optional continue,
- after completing a sector,
- from optional rewarded buttons.

Never during:

- active gameplay,
- boss fight,
- chain reaction,
- tutorial moment,
- critical input moment.

### 18.3 Rewarded ad ideas

Optional rewarded ads could offer:

- revive once after death,
- double scrap from completed level,
- extra upgrade choice reroll,
- temporary cosmetic trial,
- daily reward boost.

Important:

- no hard paywall,
- no required ad for progression,
- no ad spam,
- cooldowns,
- clear consent.

### 18.4 Monetization risk

This kind of game should feel arcade-pure. Over-monetization will damage trust and retention.

---

## 19. CrazyGames Readiness Checklist

### 19.1 Gameplay readiness

- First gameplay within one click.
- First level teaches without text overload.
- Clear win condition.
- Clear failure reason.
- No softlocks.
- Fast restart.
- Difficulty curve is fair.
- Content is readable at iframe sizes.
- No tiny UI.

### 19.2 Technical readiness

- `npm run typecheck` passes.
- `npm run build` passes.
- No console errors.
- No missing assets.
- No remote runtime dependencies.
- Game works if SDK is unavailable.
- Loading calls are correctly placed.
- Gameplay start/stop calls are correct.
- Pause behavior is safe.
- Audio unlocks after user gesture.
- Save load is robust.

### 19.3 Performance readiness

- Stable 60 FPS on mid/low devices.
- Particle quality setting works.
- No memory leaks between levels.
- No growing physics groups after restarts.
- No unbounded active fields.
- No excessive draw calls.
- No huge canvas scaling issues.
- No heavy shader/postprocessing dependency.

### 19.4 Mobile readiness

- Touch controls implemented.
- UI touch targets are large.
- Landscape orientation works.
- No keyboard-only tutorial prompts on mobile.
- No hover-only UI.
- Performance acceptable on mobile.
- Pause/menu safe on visibility change.

### 19.5 Content readiness

- At least 20–30 polished levels or strong replay modes.
- Boss encounter polished.
- Daily/challenge or replay system added if content is short.
- Upgrade system balanced.
- Save progression works.
- Settings reset works.

---

## 20. Technical Architecture Roadmap

### 20.1 Preserve current modularity

Keep the current structure:

- `entities/` for game objects,
- `systems/` for reusable logic,
- `scenes/` for Phaser scene flow,
- `data/` for levels/upgrades,
- `ui/` for HUD elements,
- `constants.ts` for tuning.

### 20.2 Avoid massive GameScene growth

The current `GameScene` will become the pressure point. As features grow, extract responsibilities.

Potential new systems:

- `FieldSystem` — manages active containment fields.
- `EnemySystem` — enemy spawning/update/state helpers.
- `HazardSystem` — level hazards.
- `PickupSystem` — scrap, batteries, rare drops.
- `ObjectiveSystem` — level objectives/medals.
- `TutorialSystem` — contextual prompts.
- `BossSystem` — boss phase helpers.
- `RunProgressSystem` — upgrades, score, run state.
- `AnalyticsSystem` — local event tracking/debug.

Do this gradually, not as a huge refactor.

### 20.3 Save migration

Current save fields are simple. As progression expands, save schema should include versioned migration.

Future save data may include:

- completed levels,
- best scores,
- medals,
- total scrap,
- purchased upgrades,
- unlocked skins,
- daily challenge history,
- settings,
- tutorial completion flags,
- achievements,
- equipped modules.

Use a schema version:

```ts
saveVersion: 2
```

Migrate older saves safely. Corrupt saves should reset gracefully, not crash.

### 20.4 Data-driven content

Future data files:

- `levels.ts`,
- `sectors.ts`,
- `enemies.ts`,
- `hazards.ts`,
- `bosses.ts`,
- `upgrades.ts`,
- `modules.ts`,
- `achievements.ts`,
- `dailyMissions.ts`,
- `skins.ts`.

This makes balancing easier.

### 20.5 Debug tools

Add a dev-only debug overlay:

- current FPS,
- active fields,
- enemies alive/trapped,
- level id,
- player velocity,
- collision debug toggle,
- spawn enemy buttons,
- complete level button,
- add scrap,
- unlock all levels.

Guard debug behind `?debug=1`.

### 20.6 Testing strategy

Minimum checks:

- TypeScript compile.
- Build succeeds.
- Fresh save starts.
- Level 1 clear works.
- Game over works.
- Pause/resume works.
- Upgrade screen works.
- Victory scene works.
- Save persists best score/scrap.
- Reset save works.
- SDK no-op local boot works.

Optional automated tests:

- save migration unit tests,
- upgrade modifier tests,
- level data validation,
- no invalid enemy kinds,
- platform bounds validation,
- achievement unlock tests.

### 20.7 Level validation script

Add a script that checks:

- player spawn inside bounds,
- portal inside bounds,
- enemies inside bounds,
- no platform outside world,
- no impossible empty level,
- no duplicate level ids,
- boss levels have boss data,
- hints are short.

### 20.8 Performance budget

Set budgets:

- initial playable load: as small as possible,
- no huge external assets,
- max active fields: already capped,
- max active particles by quality level,
- max enemies per level,
- max draw layers,
- no unbounded timers/events.

---

## 21. Accessibility Roadmap

### 21.1 Reduced motion

Add setting:

- reduce screen shake,
- reduce flashing,
- reduce particle count,
- reduce shockwave intensity.

### 21.2 Colorblind-friendly mode

Enemy types should not rely only on color.

Add:

- shape differences,
- icons/markings,
- outlines,
- different motion patterns,
- optional high-contrast palette.

### 21.3 Input remapping

Desktop players should be able to remap:

- left/right,
- jump,
- shoot/pop,
- pause.

Gamepad mapping should be forgiving.

### 21.4 Difficulty assists

Optional assist settings:

- extra heart,
- slower enemy speed,
- longer trap timer,
- larger field size,
- auto-pop nearest field button,
- reduced knockback,
- no score leaderboard eligibility if assists are active.

These can broaden audience without weakening the default game.

### 21.5 Text readability

- large fonts,
- high contrast,
- no tiny instructions,
- minimal text during action,
- readable on 821×462 iframe.

---

## 22. Difficulty and Balance

### 22.1 Difficulty curve

The difficulty should rise through:

1. More enemies.
2. More verticality.
3. New slime types.
4. Mixed enemy behavior.
5. Hazards.
6. Boss phases.
7. Optional objectives.

Not through:

- cheap hits,
- invisible projectiles,
- cramped unfair layouts,
- instant deaths,
- excessive enemy speed,
- random unavoidable spawns.

### 22.2 Beginner protection

Early levels should include:

- slow enemies,
- generous trap hitboxes,
- clear prompts,
- safe spawn area,
- no harsh punishment for missed fields,
- health pickups if needed.

### 22.3 Advanced mastery

Advanced players should chase:

- no damage clears,
- all scrap,
- speed medals,
- perfect chain clears,
- daily leaderboard,
- hard mode,
- boss rush.

### 22.4 Upgrade balance

Avoid upgrades that are always best.

Examples:

- Field size: easier trapping, but maybe lower score bonus.
- Rapid fire: more shots, but smaller chain bonus.
- Big chain radius: great combos, but longer cooldown.
- Shield: safety, but no score multiplier bonus.

Not every tradeoff must be explicit, but choices should feel meaningful.

---

## 23. Possible Advanced Systems

These are not immediate priorities, but could be explored later.

### 23.1 Protocol Meter

A meter fills when the player chain-pops.

When full, activate:

- temporary slow motion,
- all fields become stable,
- big screen-wide containment pulse,
- extra scrap drops,
- boss vulnerability.

Use carefully. It should not replace regular popping.

### 23.2 Lab Repair Meta

After clearing levels, the player repairs lab rooms.

Rooms:

- Upgrade Lab,
- Containment Archive,
- Drone Bay,
- Reactor Core,
- Cosmetic Workshop,
- Challenge Terminal.

This could be a light hub screen, not a full tycoon game.

### 23.3 Helper Drones

Small drones orbit the player.

Types:

- Collector Drone: pulls scrap.
- Stabilizer Drone: extends trap timer.
- Spark Drone: occasionally damages slimes.
- Medic Drone: restores heart after several clears.
- Chain Drone: boosts pop radius slightly.

Keep drones visually small and readable.

### 23.4 Crafting

Use scrap/crystals to craft modules.

Risk: crafting can become too menu-heavy. Use only if meta-progression needs more depth.

### 23.5 Procedural challenge generator

Generate daily/weekly arenas from templates.

Inputs:

- platform templates,
- enemy budget,
- hazard budget,
- modifier,
- medal targets.

Handcrafted campaign should remain primary.

### 23.6 Replay/Ghost system

For speedrun/score players:

- local ghost of best run,
- replay last clear,
- show chain route.

Probably lower priority for CrazyGames.

### 23.7 User-generated levels

A level editor and share codes could be powerful, but high scope.

Requirements:

- safe level validation,
- share code compression,
- moderation if public,
- UI for browsing.

This should be considered only after core success.

---

## 24. Content Expansion Ideas

### 24.1 New lab sectors

#### Calibration Wing

- clean blue visuals,
- basic mechanics.

#### Slime Culture Tanks

- green/pink tanks,
- bouncers and splitters.

#### Reactor Bay

- amber/red lighting,
- chargers and vents.

#### Cryo Storage

- icy surfaces,
- freeze fields,
- slow mechanics.

#### Electric Grid

- electric slimes,
- laser gates,
- timed arcs.

#### Waste Processing

- conveyors,
- slime puddles,
- sticky hazards.

#### Bio-Dome

- organic growth,
- spores,
- swarm enemies.

#### Core Protocol

- glitch effects,
- mixed hazards,
- final boss.

### 24.2 Rare slime variants

Occasionally spawn variants:

- Gold Slime: drops extra scrap.
- Crystal Slime: rare cosmetic currency.
- Glitch Slime: unusual movement.
- Tiny Crown Slime: buffs others.
- Sleepy Slime: harmless until startled.

Rare variants create excitement without major content cost.

### 24.3 Environmental interactions

- pop field near switch to open doors,
- pop near reactor to charge portal,
- trap slime in scanner for bonus,
- use bounce pads to move fields,
- use fans to redirect floating fields.

### 24.4 Collectibles

- lab log fragments,
- robot parts,
- slime samples,
- field cores,
- hidden batteries,
- rescued mini bots.

Collectibles can unlock cosmetics, not mandatory power.

---

## 25. Branding and Store Presentation

### 25.1 Title

Current title is strong:

**Slime Pop Protocol**

It communicates:

- slime,
- popping,
- science/tech protocol.

Potential subtitles:

- Slime Pop Protocol: Containment Arcade,
- Slime Pop Protocol: Lab Breach,
- Slime Pop Protocol: Reactor Rescue.

Keep the main title simple for CrazyGames.

### 25.2 Logo direction

Logo should be:

- rounded but techy,
- slime-green and neon-cyan accent,
- readable at thumbnail size,
- not too long visually,
- with a containment ring or field icon.

### 25.3 CrazyGames description

Possible short description:

> Slime Pop Protocol is a fast arcade platformer where you trap bouncing slime mutants in glowing containment fields and pop them for explosive chain reactions. Clear the lab, collect scrap, upgrade your repair robot, and stop the reactor blob before the whole facility melts down.

### 25.4 Thumbnail variants

#### Variant A: Hero action

Robot jumps toward a glowing trapped slime, field about to pop.

#### Variant B: Chain explosion

Three containment fields connected by energy arcs, slimes inside, huge pop effect.

#### Variant C: Boss threat

Reactor Blob looms behind, robot fires a field, minions around.

#### Variant D: Cute chaos

Several expressive slimes trapped/floating, robot smiling with emitter.

Best likely choice: **Hero action + chain explosion**.

---

## 26. Comparative Positioning

### 26.1 Compared to classic bubble-trap arcade games

Slime Pop Protocol should feel:

- more modern,
- more readable,
- more responsive,
- more juicy,
- more upgrade-driven,
- more legally distinct,
- more CrazyGames-native.

### 26.2 Compared to Bubble Trouble/Pang-like games

Slime Pop Protocol is not about splitting bouncing balls. It is about trapping active enemies and setting up chain pops. This is more character-driven and can be more strategic.

### 26.3 Compared to generic platformers

The unique mechanic is containment and chain reaction. Do not let the game become a generic jump-and-shoot platformer.

### 26.4 Compared to survivor/auto-shooter games

Slime Pop Protocol has direct platform skill and short handcrafted levels rather than endless auto-fire. This gives it arcade precision and charm.

---

## 27. Production Milestones

### 27.1 Milestone 1 — CrazyGames Readiness Pass

Goal: make current prototype submission-ready.

Tasks:

- implement touch controls,
- improve first-level tutorial prompts,
- add music or ambient loop,
- polish containment field states,
- add level-select screen,
- test build/typecheck,
- test iframe sizes,
- integrate SDK script only when appropriate,
- fix all console warnings/errors,
- add pause/visibility handling,
- add loading screen polish.

### 27.2 Milestone 2 — Content Expansion Pass

Goal: enough content for longer sessions.

Tasks:

- expand from 12 to 24 levels,
- add 1–2 new slime types,
- add 1 new hazard type,
- polish Reactor Blob boss,
- add second boss,
- add medals/stars,
- add level select,
- add more upgrade choices.

### 27.3 Milestone 3 — Retention Pass

Goal: improve Day 1 return reasons.

Tasks:

- daily mission system,
- daily challenge level,
- achievements,
- cosmetic unlocks,
- improved save progression,
- return screen,
- optional rewarded ad hooks.

### 27.4 Milestone 4 — Premium Polish Pass

Goal: make the game feel highly clickable and professional.

Tasks:

- better robot animations,
- better slime animations,
- improved backgrounds,
- sector visual identity,
- music system,
- stronger UI transitions,
- better thumbnail/logo,
- juice pass on all core actions.

### 27.5 Milestone 5 — Advanced Modes

Goal: extend lifespan.

Tasks:

- Arcade Run,
- Daily Protocol leaderboard,
- Endless Containment,
- Boss Rush,
- Hard Mode,
- module loadouts.

### 27.6 Milestone 6 — Long-Term Expansion

Only if game performs well.

Tasks:

- co-op,
- level editor,
- seasonal events,
- lab hub,
- more sectors,
- additional bosses,
- cloud save / CrazyGames data if appropriate.

---

## 28. Priority Matrix

### 28.1 Highest priority

- Touch/mobile controls.
- First-run tutorial inside gameplay.
- Field state readability.
- Pop/chain juice.
- Music/ambience.
- More levels or replay modes.
- Medals/stars.
- Save progression expansion.
- CrazyGames SDK final integration.

### 28.2 Medium priority

- More enemies.
- More hazards.
- Level select map.
- Daily missions.
- Achievements.
- Cosmetics.
- Boss expansion.
- Upgrade balance.
- Accessibility settings.

### 28.3 Lower priority

- Full lab hub.
- Co-op.
- Level editor.
- Procedural challenge generator.
- Large skill tree.
- Cloud save.
- Voice lines.
- Complex crafting.

### 28.4 Avoid for now

- Huge story campaign with dialogue.
- Too many currencies.
- Heavy external art pipeline.
- Large asset downloads.
- Complex multiplayer.
- Monetization-heavy design.
- A full idle/tycoon layer.
- Anything that makes level 1 slower to start.

---

## 29. Specific Feature Ideas Catalogue

This section lists many possible features. Not all should be built.

### 29.1 Pickups

- Heart repair.
- Temporary rapid fire.
- Magnet pulse.
- Field stabilizer.
- Chain amplifier.
- Slow-time battery.
- Shield recharge.
- Scrap burst.
- Rare crystal.
- Emergency pop bomb.

### 29.2 Temporary power-ups

- Overclock: faster movement and firing.
- Stabilize: trapped slimes cannot escape briefly.
- Cascade: next pop has massive radius.
- Vacuum: all scrap flies to player.
- Pulse Shield: absorb hit and pop nearby fields.
- Freeze Lab: slow enemies.
- Reactor Surge: double score for chains.

### 29.3 Challenge modifiers

- Tiny robot.
- Giant slimes.
- Low gravity.
- Reverse gravity fields.
- Faster escape timers.
- One heart.
- No upgrades.
- Double scrap, double danger.
- Slime swarm.
- Charger chaos.
- Shield overload.

### 29.4 Achievements

- Trap your first slime.
- Pop 100 slimes.
- Chain 5 fields.
- Clear Level 1 with no damage.
- Defeat Reactor Blob.
- Collect 10,000 scrap.
- Clear a daily challenge.
- Unlock all upgrades.
- Complete campaign.
- Perfect every level.

### 29.5 Cosmetics

- Robot color skins.
- Field ring skins.
- Scrap pickup skins.
- Portal skins.
- Victory pose animations.
- Slime hats for silly events.
- Seasonal lab themes.

### 29.6 Fun secrets

- hidden slime room,
- secret robot skin from perfect chain,
- tiny developer terminal,
- rare golden slime,
- secret level warp,
- Konami-style input for cosmetic only,
- hidden lab log fragments.

---

## 30. Anti-Roadmap: What Not To Do

### 30.1 Do not become a direct clone

Never add names, characters, layouts, or styles that make the game look like a direct copy of Bubble Bobble or any specific existing IP.

### 30.2 Do not bury the player in menus

The first session must remain immediate. Menus should support gameplay, not delay it.

### 30.3 Do not overbuild progression before feel is excellent

A mediocre-feeling arcade game with lots of upgrades will still fail.

### 30.4 Do not add too many currencies

Scrap is enough for the first version. Add rare currency only if necessary.

### 30.5 Do not let graphics reduce readability

Premium visuals must make the game clearer, not harder to read.

### 30.6 Do not add multiplayer too early

Co-op is attractive, but doubles design/testing complexity.

### 30.7 Do not make the game punishing early

The game can become challenging later, but the first few levels should create confidence.

### 30.8 Do not abandon the chain-pop identity

Every major feature should reinforce:

```text
trap → pop → chain → collect → clear
```

---

## 31. Recommended Near-Term Action Plan

### Step 1 — Touch controls and responsive pass

Implement mobile/touch controls and test landscape play. Replace keyboard-only prompts on touch devices.

### Step 2 — Tutorial-in-level pass

Turn Level 1 into a guided interactive tutorial with tiny prompts and safe pacing.

### Step 3 — Field/popup juice pass

Improve every state of containment fields: travel, trap, float, warning, escape, pop, chain.

### Step 4 — Music/ambience pass

Add at least one lightweight looping music/ambience layer and boss/victory stingers.

### Step 5 — Content extension

Expand to 20–24 levels, add at least one new slime and one new hazard.

### Step 6 — Medal/progression pass

Add level medals and a basic level-select screen.

### Step 7 — Daily/replay pass

Add one replayable mode: Daily Protocol or Arcade Run.

### Step 8 — CrazyGames release candidate

Finalize SDK, test builds, check save, no errors, make cover art, record short gameplay footage, and submit.

---

## 32. Final Strategic Recommendation

Slime Pop Protocol has strong CrazyGames potential because it is:

- immediately understandable,
- visually distinct,
- lightweight,
- built with a clean Phaser/TypeScript stack,
- already structured like a complete game,
- based on a satisfying arcade mechanic,
- more original than a straight retro remake,
- expandable through levels, bosses, upgrades, challenges, and cosmetics.

The best path forward is not to make it enormous. The best path is to make it **exceptionally polished** around its signature loop:

```text
TRAP → FLOAT → POP → CHAIN → COLLECT → CLEAR
```

If this loop feels amazing within the first minute, the game can support many future layers: campaign sectors, daily challenges, arcade runs, bosses, modules, cosmetics, achievements, and possibly co-op.

The correct ambition is:

> **Make Slime Pop Protocol the most satisfying modern browser containment arcade game: cute, clear, juicy, original, fast to start, and hard to put down.**
