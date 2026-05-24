import { COMBO } from "../constants";

/**
 * Tracks the current pop chain.  Each pop calls `register()`; the chain
 * resets if no pop happens within the combo window.
 */
export class ComboSystem {
  private chainCount = 0;
  private lastPopAt = 0;

  reset(): void {
    this.chainCount = 0;
    this.lastPopAt = 0;
  }

  /** Returns the new chain index (1-based). */
  register(now: number): number {
    if (now - this.lastPopAt > COMBO.windowMs) {
      this.chainCount = 0;
    }
    this.chainCount += 1;
    this.lastPopAt = now;
    return this.chainCount;
  }

  get current(): number {
    return this.chainCount;
  }

  /** Score multiplier for the current chain length. */
  multiplier(): number {
    return 1 + Math.max(0, this.chainCount - 1) * COMBO.bonusPerChain;
  }

  /** Called every frame to age out an idle chain. */
  tick(now: number): void {
    if (this.chainCount > 0 && now - this.lastPopAt > COMBO.windowMs) {
      this.chainCount = 0;
    }
  }
}
