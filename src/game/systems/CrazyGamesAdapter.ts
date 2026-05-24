/**
 * Safe wrapper around the CrazyGames SDK.  All methods become no-ops when the
 * SDK is unavailable (local dev, hosting outside of CrazyGames, etc.) so the
 * game NEVER blocks on a missing global.
 *
 * TODO (CrazyGames): include the SDK script tag in index.html before shipping:
 *   <script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>
 * and call CrazyGamesAdapter.init() once during boot.
 */

type SDKAny = any; // SDK has an open shape; we wrap so the rest of the code stays clean.

export class CrazyGamesAdapter {
  private static sdk: SDKAny | null = null;
  private static ready = false;

  static get available(): boolean {
    return CrazyGamesAdapter.ready && CrazyGamesAdapter.sdk !== null;
  }

  static async init(): Promise<void> {
    if (CrazyGamesAdapter.ready) return;
    const global = window as unknown as { CrazyGames?: SDKAny };
    if (!global.CrazyGames || !global.CrazyGames.SDK) {
      CrazyGamesAdapter.ready = true; // mark as "checked"; remain no-op
      return;
    }
    try {
      CrazyGamesAdapter.sdk = global.CrazyGames.SDK;
      if (typeof CrazyGamesAdapter.sdk.init === "function") {
        await CrazyGamesAdapter.sdk.init();
      }
      CrazyGamesAdapter.ready = true;
    } catch (err) {
      console.warn("[CrazyGamesAdapter] init failed, running in no-op mode", err);
      CrazyGamesAdapter.sdk = null;
      CrazyGamesAdapter.ready = true;
    }
  }

  static loadingStart(): void {
    CrazyGamesAdapter.safeCall(() =>
      CrazyGamesAdapter.sdk?.game?.loadingStart?.()
    );
  }

  static loadingStop(): void {
    CrazyGamesAdapter.safeCall(() =>
      CrazyGamesAdapter.sdk?.game?.loadingStop?.()
    );
  }

  static gameplayStart(): void {
    CrazyGamesAdapter.safeCall(() =>
      CrazyGamesAdapter.sdk?.game?.gameplayStart?.()
    );
  }

  static gameplayStop(): void {
    CrazyGamesAdapter.safeCall(() =>
      CrazyGamesAdapter.sdk?.game?.gameplayStop?.()
    );
  }

  static happyTime(): void {
    CrazyGamesAdapter.safeCall(() =>
      CrazyGamesAdapter.sdk?.game?.happytime?.()
    );
  }

  /**
   * Request a midgame ad.  Callers should ONLY invoke this at safe moments
   * (between levels, after game-over, never during action).  We additionally
   * guard with a basic rate limit to avoid hammering the SDK.
   */
  private static lastAdAt = 0;
  private static AD_COOLDOWN_MS = 120_000;
  static requestMidgameAd(): void {
    const now = Date.now();
    if (now - CrazyGamesAdapter.lastAdAt < CrazyGamesAdapter.AD_COOLDOWN_MS) return;
    CrazyGamesAdapter.lastAdAt = now;
    CrazyGamesAdapter.safeCall(() =>
      CrazyGamesAdapter.sdk?.ad?.requestAd?.("midgame", {})
    );
  }

  private static safeCall(fn: () => void): void {
    if (!CrazyGamesAdapter.available) return;
    try {
      fn();
    } catch (err) {
      console.warn("[CrazyGamesAdapter] call failed", err);
    }
  }
}
