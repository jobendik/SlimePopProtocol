import {
  DEFAULT_SETTINGS,
  type GameSettings,
  SAVE_KEY,
  type SaveData,
} from "../constants";

/**
 * Tiny localStorage-backed save layer.  Tolerant of corrupted or missing data:
 * always returns a valid SaveData snapshot.
 */
export class SaveSystem {
  private cache: SaveData;

  constructor() {
    this.cache = SaveSystem.load();
  }

  static load(): SaveData {
    const fallback: SaveData = {
      bestLevel: 0,
      bestScore: 0,
      totalScrap: 0,
      settings: { ...DEFAULT_SETTINGS },
    };
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      return {
        bestLevel: typeof parsed.bestLevel === "number" ? parsed.bestLevel : 0,
        bestScore: typeof parsed.bestScore === "number" ? parsed.bestScore : 0,
        totalScrap: typeof parsed.totalScrap === "number" ? parsed.totalScrap : 0,
        settings: {
          ...DEFAULT_SETTINGS,
          ...(parsed.settings ?? {}),
        },
      };
    } catch {
      return fallback;
    }
  }

  get data(): SaveData {
    return this.cache;
  }

  get settings(): GameSettings {
    return this.cache.settings;
  }

  flush(): void {
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(this.cache));
    } catch {
      /* private mode etc. — silently ignored */
    }
  }

  updateSettings(partial: Partial<GameSettings>): void {
    this.cache.settings = { ...this.cache.settings, ...partial };
    this.flush();
  }

  recordRun(opts: { level: number; score: number; scrap: number }): void {
    if (opts.level > this.cache.bestLevel) this.cache.bestLevel = opts.level;
    if (opts.score > this.cache.bestScore) this.cache.bestScore = opts.score;
    this.cache.totalScrap += opts.scrap;
    this.flush();
  }

  reset(): void {
    this.cache = {
      bestLevel: 0,
      bestScore: 0,
      totalScrap: 0,
      settings: { ...DEFAULT_SETTINGS },
    };
    this.flush();
  }
}
