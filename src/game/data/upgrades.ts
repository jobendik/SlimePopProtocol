/**
 * Data-driven upgrade catalogue.  Effects are stored as small numeric deltas
 * that the systems consume via `UpgradeSystem.modifiers()`.
 */

export type UpgradeId =
  | "field-size"
  | "fast-recharge"
  | "trap-duration"
  | "chain-radius"
  | "double-jump"
  | "magnet"
  | "shield"
  | "shockwave-damage"
  | "pierce"
  | "swift-boots"
  | "lucky-scrap";

export type UpgradeDef = {
  id: UpgradeId;
  title: string;
  description: string;
  icon: string; // single-char symbol drawn in the card
  color: number;
  maxStacks: number;
};

export const UPGRADES: readonly UpgradeDef[] = [
  {
    id: "field-size",
    title: "Wider Field",
    description: "Containment fields are 25% larger.",
    icon: "◯",
    color: 0x6ffcff,
    maxStacks: 3,
  },
  {
    id: "fast-recharge",
    title: "Rapid Emitter",
    description: "Field cooldown reduced by 20%.",
    icon: "»",
    color: 0xff6cf2,
    maxStacks: 3,
  },
  {
    id: "trap-duration",
    title: "Stable Containment",
    description: "Trapped slimes stay locked 1.2s longer.",
    icon: "⏲",
    color: 0xffd166,
    maxStacks: 3,
  },
  {
    id: "chain-radius",
    title: "Resonance Cascade",
    description: "Pop shockwaves reach 30% further.",
    icon: "⌬",
    color: 0x9efc7a,
    maxStacks: 3,
  },
  {
    id: "double-jump",
    title: "Boost Servos",
    description: "Adds one mid-air jump.",
    icon: "↟",
    color: 0x6ffcff,
    maxStacks: 1,
  },
  {
    id: "magnet",
    title: "Scrap Magnet",
    description: "Pulls scrap and batteries from across the arena.",
    icon: "✦",
    color: 0xffd166,
    maxStacks: 1,
  },
  {
    id: "shield",
    title: "Backup Plate",
    description: "Absorb one hit per run.",
    icon: "◈",
    color: 0xcfe9ff,
    maxStacks: 1,
  },
  {
    id: "shockwave-damage",
    title: "Overcharge Pop",
    description: "Empty-field pops damage enemies caught in radius.",
    icon: "✸",
    color: 0xffa45a,
    maxStacks: 1,
  },
  {
    id: "pierce",
    title: "Phase Field",
    description: "Containment fields pass through one slime before locking.",
    icon: "➤",
    color: 0x6ffcff,
    maxStacks: 1,
  },
  {
    id: "swift-boots",
    title: "Swift Boots",
    description: "Move 12% faster.",
    icon: "→",
    color: 0x9efc7a,
    maxStacks: 2,
  },
  {
    id: "lucky-scrap",
    title: "Lucky Scrap",
    description: "Chain pops drop extra scrap.",
    icon: "★",
    color: 0xffd166,
    maxStacks: 2,
  },
];

export function findUpgrade(id: UpgradeId): UpgradeDef {
  return UPGRADES.find((u) => u.id === id)!;
}
