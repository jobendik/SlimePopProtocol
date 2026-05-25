import Phaser from "phaser";
import { DEPTH } from "../constants";

/**
 * Bridge between a Phaser physics body / sprite and a CSS-rendered
 * DOM element.  The DOM element is added via Phaser's DOM container
 * so it inherits the same scale/pan transforms as the canvas, and is
 * positioned by Phaser each frame.
 *
 * The host sprite handles physics, collision, state and lifecycle —
 * the visual just mirrors position / scale / facing / state class.
 *
 * Usage:
 *   this.visual = new CssVisual(scene, "cv-player", { facing: 1 });
 *   this.visual.attachInnerHtml(`<div class="bot-helmet"></div>...`);
 *   ...
 *   // each frame:
 *   this.visual.follow(this);   // sprite-like host
 */
export class CssVisual {
  readonly dom: Phaser.GameObjects.DOMElement;
  readonly node: HTMLDivElement;
  private flipNode: HTMLDivElement;
  private currentFacing: 1 | -1 = 1;
  private destroyed = false;

  constructor(
    scene: Phaser.Scene,
    classes: string,
    opts: { depth?: number; pixelWidth?: number; pixelHeight?: number } = {}
  ) {
    const root = document.createElement("div");
    root.className = `cv ${classes}`;
    if (opts.pixelWidth)  root.style.width  = `${opts.pixelWidth}px`;
    if (opts.pixelHeight) root.style.height = `${opts.pixelHeight}px`;

    const flip = document.createElement("div");
    flip.className = "cv-flip";
    root.appendChild(flip);
    this.flipNode = flip;
    this.node = root;

    this.dom = scene.add.dom(0, 0, root);
    // The DOMElement uses translate(-50%, -50%) internally so its anchor
    // matches Phaser's centered sprites.  No manual origin needed.
    this.dom.setDepth(opts.depth ?? DEPTH.player);
  }

  /** Append additional markup *inside* the flip wrapper. */
  setHtml(html: string): void {
    this.flipNode.innerHTML = html;
  }

  /** Mirror the host sprite's world position, scale and facing. */
  follow(host: Phaser.GameObjects.Components.Transform & {
    flipX?: boolean;
    alpha?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
  }, baseScale = 1): void {
    if (this.destroyed) return;
    this.dom.x = host.x;
    this.dom.y = host.y;
    // The Phaser sprite scale is its visual scale (which baked includes
    // LOGICAL_SCALE for the supersampled texture).  DOM size is in world
    // pixels already, so the caller passes the divisor — typically the
    // sprite's `scaleX / LOGICAL_SCALE` for entities that wobble.
    const sX = (host.scaleX ?? 1) / baseScale;
    const sY = (host.scaleY ?? 1) / baseScale;
    this.dom.setScale(sX, sY);
    this.dom.setRotation(host.rotation ?? 0);
    if (host.alpha !== undefined) this.dom.setAlpha(host.alpha);

    const facing: 1 | -1 = host.flipX ? -1 : 1;
    if (facing !== this.currentFacing) {
      this.currentFacing = facing;
      this.node.setAttribute("data-facing", String(facing));
    }
  }

  /** Set or remove a `data-*` attribute on the root element. */
  setState(name: string, value: string | number | boolean | null): void {
    if (this.destroyed) return;
    if (value === null || value === false) {
      this.node.removeAttribute(`data-${name}`);
    } else {
      this.node.setAttribute(`data-${name}`, String(value));
    }
  }

  /** Direct positioning (used by HUD / overlay elements). */
  setPosition(x: number, y: number): void {
    if (this.destroyed) return;
    this.dom.x = x;
    this.dom.y = y;
  }

  setVisible(visible: boolean): void {
    if (this.destroyed) return;
    this.dom.setVisible(visible);
  }

  setDepth(depth: number): void {
    if (this.destroyed) return;
    this.dom.setDepth(depth);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.dom.destroy();
  }
}
