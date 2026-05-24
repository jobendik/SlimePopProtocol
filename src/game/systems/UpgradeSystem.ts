import { FIELD, PLAYER } from "../constants";
import { findUpgrade, UPGRADES, type UpgradeDef, type UpgradeId } from "../data/upgrades";

export type UpgradeStacks = Partial<Record<UpgradeId, number>>;

export type RunModifiers = {
  fieldRadius: number;
  fireCooldownMs: number;
  trapLifetimeMs: number;
  popRadius: number;
  doubleJump: boolean;
  magnet: boolean;
  shieldCharges: number;
  shockwaveDamage: boolean;
  pierce: boolean;
  moveSpeed: number;
  scrapBonusFactor: number;
};

/**
 * Tracks which upgrades the current run owns and turns them into concrete
 * tuning modifiers consumed by the player/field systems.
 */
export class UpgradeSystem {
  private stacks: UpgradeStacks = {};

  reset(): void {
    this.stacks = {};
  }

  has(id: UpgradeId): boolean {
    return (this.stacks[id] ?? 0) > 0;
  }

  stackCount(id: UpgradeId): number {
    return this.stacks[id] ?? 0;
  }

  add(id: UpgradeId): void {
    const def = findUpgrade(id);
    const current = this.stacks[id] ?? 0;
    if (current >= def.maxStacks) return;
    this.stacks[id] = current + 1;
  }

  /** Three offers — never duplicates that are already maxed out. */
  offerChoices(): UpgradeDef[] {
    const pool = UPGRADES.filter((u) => (this.stacks[u.id] ?? 0) < u.maxStacks);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(3, shuffled.length));
  }

  modifiers(): RunModifiers {
    const s = this.stacks;
    const fieldStack = s["field-size"] ?? 0;
    const rechargeStack = s["fast-recharge"] ?? 0;
    const trapStack = s["trap-duration"] ?? 0;
    const radiusStack = s["chain-radius"] ?? 0;
    const swiftStack = s["swift-boots"] ?? 0;
    const luckyStack = s["lucky-scrap"] ?? 0;

    const cooldown = FIELD.fireCooldownMs * Math.pow(0.8, rechargeStack);

    return {
      fieldRadius: FIELD.radius * (1 + 0.25 * fieldStack),
      fireCooldownMs: Math.max(FIELD.fireCooldownMin, cooldown),
      trapLifetimeMs: FIELD.trapLifetimeMs + 1200 * trapStack,
      popRadius: Math.min(
        FIELD.popRadiusMax,
        FIELD.popRadius * (1 + 0.3 * radiusStack)
      ),
      doubleJump: this.has("double-jump"),
      magnet: this.has("magnet"),
      shieldCharges: this.has("shield") ? 1 : 0,
      shockwaveDamage: this.has("shockwave-damage"),
      pierce: this.has("pierce"),
      moveSpeed: PLAYER.moveSpeed * (1 + 0.12 * swiftStack),
      scrapBonusFactor: 1 + 0.5 * luckyStack,
    };
  }
}
