import Phaser from "phaser";
import {
  COLORS,
  COMBO,
  DEPTH,
  FIELD,
  GAME_HEIGHT,
  GAME_WIDTH,
  SCENES,
  SCORE,
  TEX,
} from "../constants";
import { LEVEL_COUNT } from "../data/levels";
import type { UpgradeDef } from "../data/upgrades";
import { BossSlime } from "../entities/BossSlime";
import { ContainmentField } from "../entities/ContainmentField";
import { Player } from "../entities/Player";
import { Portal } from "../entities/Portal";
import { ScrapPickup } from "../entities/ScrapPickup";
import {
  createSlime,
  type SlimeEnemy,
  type SlimeKind,
} from "../entities/SlimeEnemy";
import { audio } from "../systems/AudioSystem";
import { ComboSystem } from "../systems/ComboSystem";
import { CrazyGamesAdapter } from "../systems/CrazyGamesAdapter";
import { EffectsSystem } from "../systems/EffectsSystem";
import { InputSystem } from "../systems/InputSystem";
import { LevelManager, type LevelBuild } from "../systems/LevelManager";
import type { SaveSystem } from "../systems/SaveSystem";
import { Tutorial } from "../systems/Tutorial";
import { UpgradeSystem } from "../systems/UpgradeSystem";
import { distSq } from "../utils/math";

export type GameSceneData = {
  level: number;
  freshRun: boolean;
};

/**
 * Main playable scene.  Holds level entities, physics groups, player run
 * state (score/scrap/combo), and coordinates between systems.
 */
export class GameScene extends Phaser.Scene {
  private inputSys!: InputSystem;
  private player!: Player;
  private build!: LevelBuild;
  private slimes: SlimeEnemy[] = [];
  private fields!: Phaser.Physics.Arcade.Group;
  private pickups!: Phaser.Physics.Arcade.Group;
  private slimeGroup!: Phaser.Physics.Arcade.Group;
  private combo = new ComboSystem();
  private upgrades = new UpgradeSystem();
  private effects!: EffectsSystem;
  private save!: SaveSystem;

  private score = 0;
  private scrap = 0;
  private bestComboThisLevel = 1;
  private levelIndex = 0;
  private levelCleared = false;
  private firedFieldThisLevel = false;
  private trappedFirstSlime = false;
  private allClearedShown = false;
  private boss: BossSlime | null = null;
  private transitioning = false;
  private lastIntensityTarget = -1;
  private nextIntensityCheckAt = 0;
  private tutorial: Tutorial | null = null;
  /** True once the player has taken their first non-absorbed hit this run.
   *  Used to grant a one-time extra invulnerability window so a fluky early
   *  hit doesn't snowball into a 4-second death. Persists across levels. */
  private firstHitForgivenessUsed = false;

  constructor() {
    super(SCENES.Game);
  }

  init(data: GameSceneData): void {
    this.levelIndex = data.level ?? 0;
    this.levelCleared = false;
    this.firedFieldThisLevel = false;
    this.trappedFirstSlime = false;
    this.allClearedShown = false;
    this.transitioning = false;
    this.boss = null;

    if (data.freshRun) {
      this.score = 0;
      this.scrap = 0;
      this.combo.reset();
      this.upgrades.reset();
      this.firstHitForgivenessUsed = false;
    } else {
      // Keep accumulated values; combo always resets between levels though
      this.combo.reset();
    }
  }

  create(): void {
    this.save = this.registry.get("save") as SaveSystem;
    audio.attach(this);
    audio.setSettings(this.save.settings);

    this.effects = new EffectsSystem(this);
    this.effects.setQuality(this.save.settings.particleQuality);
    this.effects.setShakeEnabled(this.save.settings.screenShake);

    this.inputSys = new InputSystem(this);

    // Build level + entities
    this.build = LevelManager.build(this, this.levelIndex);
    this.slimes = this.build.slimes;

    const mods = this.upgrades.modifiers();
    this.player = new Player(this, this.build.playerSpawn.x, this.build.playerSpawn.y, mods);

    this.fields = this.physics.add.group({ runChildUpdate: false });
    this.pickups = this.physics.add.group({ runChildUpdate: false });
    this.slimeGroup = this.physics.add.group({ runChildUpdate: false });
    this.slimes.forEach((s) => this.slimeGroup.add(s));

    if (this.build.boss) {
      this.boss = this.build.boss;
    }

    this.setupColliders();
    this.setupHud();
    this.bindEvents();

    if (this.build.level.id === 1) {
      // Level 1 runs the action-anchored tutorial instead of the static HUD
      // hint so prompts follow the player and disappear as actions complete.
      this.tutorial = new Tutorial(this, this.player);
    } else if (this.build.level.hint) {
      this.events.emit("hud:update", { hintText: this.build.level.hint });
    }

    CrazyGamesAdapter.gameplayStart();
    audio.startMusic();
    audio.setMusicIntensity(0);
    this.lastIntensityTarget = 0;
    this.nextIntensityCheckAt = 0;
    this.cameras.main.fadeIn(220);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Setup helpers
  // ──────────────────────────────────────────────────────────────────────────

  private setupColliders(): void {
    const platforms = this.build.platforms;

    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.slimeGroup, platforms);
    this.physics.add.collider(this.pickups, platforms);

    // Player vs slime — only "alive" slimes deal damage
    this.physics.add.overlap(this.player, this.slimeGroup, (_p, s) => {
      const slime = s as SlimeEnemy;
      if (slime.state !== "alive") return;
      this.handlePlayerHit();
    });

    // Field vs slime — capture
    this.physics.add.overlap(this.fields, this.slimeGroup, (f, s) => {
      this.onFieldCaptureSlime(f as ContainmentField, s as SlimeEnemy);
    });

    // Player vs field — pop on contact (trapped) or absorb (empty)
    this.physics.add.overlap(this.player, this.fields, (_p, f) => {
      this.onPlayerTouchField(f as ContainmentField);
    });

    // Player vs pickup — collect
    this.physics.add.overlap(this.player, this.pickups, (_p, pick) => {
      this.collectPickup(pick as ScrapPickup);
    });

    if (this.boss) {
      // Boss collisions: player overlap = damage, fields can damage on pop
      this.physics.add.overlap(this.player, this.boss, () => {
        this.handlePlayerHit();
      });
      // Boss does not collide with the floor (it floats)
    }
  }

  private setupHud(): void {
    if (!this.scene.isActive(SCENES.Hud)) {
      this.scene.launch(SCENES.Hud, {
        hearts: this.player.hearts,
        level: this.build.level.id,
        totalLevels: LEVEL_COUNT,
        score: this.score,
        scrap: this.scrap,
      });
    } else {
      this.events.emit("hud:update", {
        hearts: this.player.hearts,
        level: this.build.level.id,
        totalLevels: LEVEL_COUNT,
        score: this.score,
        scrap: this.scrap,
        upgrades: this.upgradesAsStacks(),
        shield: this.player.shieldCharges > 0,
        clearHint: true,
      });
    }
  }

  private upgradesAsStacks(): Record<string, number> {
    const result: Record<string, number> = {};
    (["field-size", "fast-recharge", "trap-duration", "chain-radius",
      "double-jump", "magnet", "shield", "shockwave-damage", "pierce",
      "swift-boots", "lucky-scrap"] as const).forEach((id) => {
      const c = this.upgrades.stackCount(id);
      if (c > 0) result[id] = c;
    });
    return result;
  }

  private bindEvents(): void {
    // Field fizzle (timed out empty)
    this.events.on("field:fizzle", (field: ContainmentField) => {
      this.effects.shockwave(field.x, field.y, { radius: 32, color: COLORS.fieldRim, duration: 220 });
      field.destroyWithFade();
    });

    // Boss spawning minions
    this.events.on("boss:spawnMinion", (x: number, y: number) => {
      if (!this.boss?.alive) return;
      const minion = createSlime(this, "basic" as SlimeKind, x, y + 20);
      minion.setPlatformGroup(this.build.platforms);
      this.slimes.push(minion);
      this.slimeGroup.add(minion);
      this.physics.add.collider(minion, this.build.platforms);
      this.effects.burst(x, y, { color: COLORS.neonPink, count: 8, spread: 60, lifespan: 320 });
    });

    // Slime escaped (alert + flash)
    this.events.on("slime:escaped", (slime: SlimeEnemy) => {
      audio.escape();
      this.effects.burst(slime.x, slime.y, { color: COLORS.warning, count: 6 });
      this.effects.shockwave(slime.x, slime.y, { radius: 40, color: COLORS.warning });
    });

    this.events.on("player:jump", () => audio.jump());
    this.events.on("player:doubleJump", (x: number, y: number) => {
      this.effects.burst(x, y + 12, { color: COLORS.neonCyan, count: 8, spread: 80, lifespan: 260 });
      audio.jump();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.shutdownScene());
  }

  private shutdownScene(): void {
    this.tutorial?.destroy();
    this.tutorial = null;
    this.tweens.killAll();
    this.time.removeAllEvents();
    // Only strip our own custom events — calling removeAllListeners() here
    // would wipe Phaser's internal scene-lifecycle listeners and break the
    // next scene.start of GameScene.
    [
      "field:fizzle",
      "boss:spawnMinion",
      "slime:escaped",
      "player:jump",
      "player:doubleJump",
      "hud:update",
    ].forEach((name) => this.events.removeAllListeners(name));
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Per-frame update
  // ──────────────────────────────────────────────────────────────────────────

  override update(time: number, delta: number): void {
    const input = this.inputSys.pollFrame();

    if (input.pausePressed && !this.transitioning) {
      this.scene.pause();
      this.scene.launch(SCENES.Pause);
      return;
    }

    if (this.player.alive) {
      const intent = this.player.update(time, delta, input);
      if (intent.wantShoot) this.fireField();
    }

    this.tutorial?.update(time, {
      left: input.left,
      right: input.right,
      jumpPressed: input.jumpPressed,
      shootPressed: input.shootPressed,
    });

    for (const slime of this.slimes) {
      if (slime.active) slime.update(time, delta);
    }

    this.fields.getChildren().forEach((obj) => {
      const f = obj as ContainmentField;
      if (f.active) f.update(time, delta);
    });

    this.pickups.getChildren().forEach((obj) => {
      const p = obj as ScrapPickup;
      if (p.active) {
        const mods = this.upgrades.modifiers();
        if (mods.magnet) {
          p.update(time, delta, this.player.x, this.player.y);
        } else {
          p.update(time, delta);
        }
      }
    });

    this.boss?.update(time, delta);
    this.build.portal.update(time);

    this.combo.tick(time);
    this.events.emit("hud:update", { combo: this.combo.current });

    if (time >= this.nextIntensityCheckAt) {
      this.nextIntensityCheckAt = time + 350;
      const aliveSlimes = this.slimes.filter((s) => s.active && s.state === "alive").length;
      const bossAlive = !!this.boss?.alive;
      const target = bossAlive ? 1 : aliveSlimes <= 2 && aliveSlimes > 0 ? 0.6 : 0;
      if (target !== this.lastIntensityTarget) {
        this.lastIntensityTarget = target;
        audio.setMusicIntensity(target);
      }
    }

    // Has level been cleared?
    if (!this.allClearedShown && this.areAllSlimesCleared() && (!this.boss || !this.boss.alive)) {
      this.allClearedShown = true;
      this.build.portal.activate();
      this.events.emit("hud:update", { hintText: "ENTER THE PORTAL" });
    }

    if (this.build.portal.active && !this.transitioning) {
      const dx = this.player.x - this.build.portal.x;
      const dy = this.player.y - this.build.portal.y;
      if (dx * dx + dy * dy < 32 * 32) {
        this.completeLevel();
      }
    }

    // Failsafe — if player falls below floor (shouldn't happen, but...)
    if (this.player.y > GAME_HEIGHT + 60 && this.player.alive) {
      this.player.hearts = 0;
      this.handlePlayerDeath();
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Game actions
  // ──────────────────────────────────────────────────────────────────────────

  private fireField(): void {
    if (this.fields.countActive() >= FIELD.maxActive) return;
    const mods = this.upgrades.modifiers();
    const facing = this.player.facing;
    const muzzleDistance = this.player.displayWidth / 2 + mods.fieldRadius + 2;
    const sx = this.player.x + facing * muzzleDistance;
    const sy = this.player.body.bottom - mods.fieldRadius - 1;
    const field = new ContainmentField(this, sx, sy, mods.fieldRadius, mods.pierce);
    field.launch(FIELD.speed * facing, 0);
    this.fields.add(field);
    audio.shoot();
    this.effects.burst(sx, sy, { color: COLORS.neonCyan, count: 4, spread: 60, lifespan: 220 });
    this.firedFieldThisLevel = true;
  }

  private onFieldCaptureSlime(field: ContainmentField, slime: SlimeEnemy): void {
    if (field.state !== "flying" || slime.state !== "alive") return;
    if (field.consumePierce()) {
      // Phase field: damage slime but continue
      const killed = slime.takeDamage(1);
      if (killed) {
        this.popKillSlime(slime, this.time.now);
      }
      return;
    }
    const mods = this.upgrades.modifiers();
    field.capture(slime, this.time.now, mods.trapLifetimeMs);
    audio.trap();
    this.effects.burst(field.x, field.y, { color: COLORS.neonPink, count: 6, spread: 80, lifespan: 280 });
    if (!this.trappedFirstSlime) {
      this.trappedFirstSlime = true;
      this.tutorial?.onFirstTrap(field);
    }
  }

  private onPlayerTouchField(field: ContainmentField): void {
    if (!field.active || !field.isPoppable()) return;
    // Only trapped fields pop on touch.  Empty fields fizzle naturally or
    // get caught up in a chain reaction — otherwise the field would always
    // pop right on top of the player who spawned it.
    if (field.state === "trapped") {
      this.popField(field);
    }
  }

  private collectPickup(pickup: ScrapPickup): void {
    if (!pickup.active) return;
    audio.pickup();
    this.scrap += pickup.scrapValue;
    this.score += SCORE.scrap;
    this.events.emit("hud:update", { scrap: this.scrap, score: this.score });
    this.effects.burst(pickup.x, pickup.y, { color: COLORS.scrap, count: 4, spread: 70, lifespan: 240 });
    pickup.destroy();
  }

  /** Initiate a chain — pops `field` then any nearby fields in radius. */
  private popField(field: ContainmentField): void {
    if (!field.active || !field.isPoppable()) return;
    const time = this.time.now;
    const chainIndex = this.combo.register(time);
    this.bestComboThisLevel = Math.max(this.bestComboThisLevel, chainIndex);

    const isTrapped = field.state === "trapped";
    const slime = field.trapped;
    const mods = this.upgrades.modifiers();
    const popRadius = mods.popRadius;

    // Visuals + audio
    audio.pop(chainIndex - 1);
    if (chainIndex > 1) audio.chainPop(chainIndex);
    this.effects.shockwave(field.x, field.y, {
      radius: popRadius,
      color: isTrapped ? COLORS.neonPink : COLORS.neonCyan,
      duration: 320,
    });
    this.effects.burst(field.x, field.y, {
      color: isTrapped ? COLORS.neonPink : COLORS.neonCyan,
      count: 14,
      spread: 220,
      lifespan: 520,
    });
    this.effects.shake(0.005 + Math.min(0.02, chainIndex * 0.002), 100);

    field.markPopping();

    if (isTrapped && slime) {
      this.popKillSlime(slime, time, chainIndex);
    } else if (mods.shockwaveDamage) {
      // Empty-field pop with the Overcharge upgrade damages slimes in range
      for (const s of this.slimes) {
        if (s.active && s.state === "alive") {
          if (distSq(field.x, field.y, s.x, s.y) < popRadius * popRadius) {
            const killed = s.takeDamage(1);
            if (killed) this.popKillSlime(s, time, chainIndex);
          }
        }
      }
    }

    // Combo score
    const mult = this.combo.multiplier();
    const points = Math.floor(SCORE.basePop * mult);
    this.score += points;
    this.effects.floatingText(field.x, field.y - 8, `+${points}`, {
      color: chainIndex > 1 ? "#ff6cf2" : "#6ffcff",
      size: 18 + Math.min(12, chainIndex * 2),
    });
    if (chainIndex > 1) {
      this.effects.floatingText(field.x, field.y - 32, `CHAIN x${chainIndex}`, {
        color: "#ffd166",
        size: 16,
      });
    }
    this.events.emit("hud:update", {
      score: this.score,
      combo: chainIndex,
    });

    // Bonus scrap every N chain
    if (chainIndex % COMBO.scrapBonusEvery === 0 && chainIndex > 1) {
      this.spawnScrap(field.x, field.y - 12, "battery", 2);
    }

    // Boss damage if popped within range
    if (this.boss && this.boss.alive) {
      const reach = popRadius + 40;
      if (distSq(field.x, field.y, this.boss.x, this.boss.y) < reach * reach) {
        const dead = this.boss.takeDamage(1);
        if (dead) {
          this.killBoss();
        }
      }
    }

    // Chain reaction — pop nearby fields after a short delay
    this.time.delayedCall(COMBO.chainDelayMs, () => {
      const radius = popRadius;
      this.fields.getChildren().forEach((obj) => {
        const other = obj as ContainmentField;
        if (!other.active || other === field) return;
        if (!other.isPoppable()) return;
        if (distSq(field.x, field.y, other.x, other.y) < radius * radius) {
          this.popField(other);
        }
      });
      field.destroyWithFade();
    });
  }

  private popKillSlime(slime: SlimeEnemy, _time: number, chainIndex = 1): void {
    if (!slime.active) return;
    slime.state = "dead";
    const x = slime.x;
    const y = slime.y;
    this.effects.burst(x, y, {
      color: this.slimeColor(slime.kind),
      count: 12,
      spread: 180,
      lifespan: 520,
    });
    this.effects.shockwave(x, y, { radius: 50, color: this.slimeColor(slime.kind), duration: 260 });

    // Drop scrap
    const mods = this.upgrades.modifiers();
    const baseDrop = 1;
    const lucky = chainIndex > 1 ? Math.floor(chainIndex * 0.5 * mods.scrapBonusFactor) : 0;
    for (let i = 0; i < baseDrop + lucky; i++) {
      this.spawnScrap(x, y, "scrap", 1);
    }

    // Cleanup
    this.slimes = this.slimes.filter((s) => s !== slime);
    slime.destroy();
  }

  private spawnScrap(x: number, y: number, kind: "scrap" | "battery", value: number): void {
    const p = new ScrapPickup(this, x, y, kind, value);
    this.pickups.add(p);
    // light auto-pickup so floor pickups don't pile up forever
    this.time.delayedCall(8000, () => {
      if (p.active) {
        const mods = this.upgrades.modifiers();
        if (mods.magnet) return; // magnet eventually grabs it
        p.setMagnetTarget(this.player.x, this.player.y);
      }
    });
  }

  private slimeColor(kind: SlimeKind): number {
    switch (kind) {
      case "basic":
        return COLORS.neonGreen;
      case "bouncer":
        return COLORS.neonPink;
      case "charger":
        return COLORS.neonOrange;
      case "shield":
        return 0xcfe9ff;
    }
  }

  private handlePlayerHit(): void {
    const time = this.time.now;
    const result = this.player.takeHit(time);
    if (result.absorbed) {
      this.effects.burst(this.player.x, this.player.y, {
        color: 0xcfe9ff,
        count: 14,
        spread: 200,
        lifespan: 420,
      });
      audio.pickup();
      this.events.emit("hud:update", { shield: false });
      return;
    }
    audio.hurt();
    this.effects.flash(0xff5577, 90, 0.35);
    this.effects.shake(0.012, 140);
    this.events.emit("hud:update", { hearts: this.player.hearts });

    if (!result.died && !this.firstHitForgivenessUsed) {
      // Extend the player's invuln by 2s and flash a "STAY CLEAR" prompt.
      // One-time per run — stops a fluky first hit from snowballing.
      this.firstHitForgivenessUsed = true;
      this.player.invulnerableUntil = Math.max(
        this.player.invulnerableUntil,
        time + 2000
      );
      this.events.emit("hud:update", { hintText: "STAY CLEAR — SHIELD BOOSTED" });
      this.time.delayedCall(1800, () => {
        this.events.emit("hud:update", { clearHint: true });
      });
    }

    if (result.died) this.handlePlayerDeath();
  }

  private handlePlayerDeath(): void {
    if (this.transitioning) return;
    this.transitioning = true;
    audio.hurt();
    this.effects.burst(this.player.x, this.player.y, {
      color: COLORS.warning,
      count: 24,
      spread: 260,
      lifespan: 700,
    });
    this.player.destroyAll();
    this.cameras.main.fade(700, 6, 6, 18, true);
    this.time.delayedCall(720, () => {
      this.scene.stop(SCENES.Hud);
      this.scene.start(SCENES.GameOver, {
        score: this.score,
        scrap: this.scrap,
        levelReached: this.build.level.id,
      });
    });
  }

  private killBoss(): void {
    if (!this.boss) return;
    audio.victory();
    this.effects.flash(0xffd166, 200, 0.5);
    this.effects.shake(0.025, 400);
    this.effects.shockwave(this.boss.x, this.boss.y, { radius: 200, color: COLORS.neonGold, duration: 600 });
    this.effects.burst(this.boss.x, this.boss.y, { color: COLORS.neonGold, count: 30, spread: 320, lifespan: 800 });
    this.score += SCORE.bossDefeated;
    this.events.emit("hud:update", { score: this.score });
    this.boss.destroyAll();
    this.boss = null;
  }

  private areAllSlimesCleared(): boolean {
    return this.slimes.every((s) => s.state === "dead" || !s.active);
  }

  private completeLevel(): void {
    if (this.transitioning) return;
    this.transitioning = true;
    this.levelCleared = true;
    this.score += SCORE.levelClear;
    audio.levelClear();
    this.events.emit("hud:update", {
      score: this.score,
      clearHint: true,
    });
    this.cameras.main.flash(220, 110, 200, 220);

    const isVictoryLevel = this.levelIndex >= LEVEL_COUNT - 1;
    const nextLevel = this.levelIndex + 1;

    this.scene.pause();
    this.scene.launch(SCENES.LevelComplete, {
      levelNumber: this.build.level.id,
      totalLevels: LEVEL_COUNT,
      score: this.score,
      scrap: this.scrap,
      bestCombo: this.bestComboThisLevel,
      onContinue: () => this.afterLevelComplete(isVictoryLevel, nextLevel),
    });
  }

  private afterLevelComplete(isVictoryLevel: boolean, nextLevel: number): void {
    if (isVictoryLevel) {
      this.scene.stop(SCENES.Hud);
      this.scene.stop();
      this.scene.start(SCENES.Victory, { score: this.score, scrap: this.scrap });
      return;
    }

    const shouldOfferUpgrade = nextLevel % 3 === 0; // after levels 3, 6, 9 (index 2,5,8 just finished)
    // Note: "after every 3 levels" — after levels 3, 6, 9 player just cleared
    // index 2, 5, 8.  i.e. nextLevel === 3, 6, 9.

    if (shouldOfferUpgrade) {
      const choices = this.upgrades.offerChoices();
      if (choices.length > 0) {
        this.scene.launch(SCENES.Upgrade, {
          choices,
          onChosen: (id: UpgradeDef["id"]) => {
            this.upgrades.add(id);
            this.events.emit("hud:update", {
              upgrades: this.upgradesAsStacks(),
              shield: this.upgrades.has("shield"),
            });
            this.goToLevel(nextLevel);
          },
        });
        return;
      }
    }

    this.goToLevel(nextLevel);
  }

  private goToLevel(nextLevel: number): void {
    this.scene.stop(SCENES.Hud);
    this.scene.start(SCENES.Game, { level: nextLevel, freshRun: false });
  }
}
