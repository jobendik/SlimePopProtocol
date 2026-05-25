import Phaser from "phaser";
import { DEPTH, GAME_HEIGHT, GAME_WIDTH } from "../constants";
import { CssVisual } from "../systems/CssVisual";

export type SceneTone = "blue" | "purple" | "amber" | "danger" | "victory";

export type ChromeButton = {
  visual: CssVisual;
  setSelected: (selected: boolean) => void;
  setLabel: (text: string) => void;
  destroy: () => void;
};

export type ChromeSlider = {
  visual: CssVisual;
  refresh: () => void;
  destroy: () => void;
};

export type ChromeToggle = {
  visual: CssVisual;
  refresh: () => void;
  destroy: () => void;
};

/**
 * Add the full CSS scene backdrop (palette by tone) — replaces the old
 * Phaser-graphics backdrop with a much richer DOM/CSS rendering.
 */
export function addSceneBackdrop(scene: Phaser.Scene, tone: SceneTone = "blue"): CssVisual {
  const visual = new CssVisual(scene, "cv-scene-bg", {
    depth: DEPTH.bgFar - 20,
    pixelWidth: GAME_WIDTH,
    pixelHeight: GAME_HEIGHT,
  });
  visual.node.setAttribute("data-tone", tone);

  const motes = Array.from({ length: 24 }, () => {
    const left = Math.random() * 100;
    const top = 6 + Math.random() * 70;
    const delay = (Math.random() * 7).toFixed(2);
    const scale = (0.6 + Math.random() * 1.6).toFixed(2);
    return `<span style="left:${left}%;top:${top}%;animation-delay:${delay}s;transform:scale(${scale})"></span>`;
  }).join("");

  visual.setHtml(`
    <div class="scene-motes">${motes}</div>
    <div class="scene-floor"></div>
  `);
  visual.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);

  return visual;
}

/**
 * Add a glass panel centred at (x, y).  Returns the CssVisual so callers can
 * destroy it if they need to.  Most callers just leave it for the scene
 * shutdown to clean up.
 */
export function addGlassPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  accentHex = "#6ffcff"
): CssVisual {
  const visual = new CssVisual(scene, "cv-panel", {
    depth: DEPTH.hud - 1,
    pixelWidth: w,
    pixelHeight: h,
  });
  visual.node.style.setProperty("--panel-accent", accentHex);
  visual.setHtml(`<div class="panel-frame"></div>`);
  visual.setPosition(x, y);
  return visual;
}

/**
 * Big stylised title (with optional subtitle).  Wrapper element is
 * centred at (x, y).
 */
export function addSceneTitle(
  scene: Phaser.Scene,
  x: number,
  y: number,
  title: string,
  subtitle?: string
): CssVisual {
  const visual = new CssVisual(scene, "cv-title", {
    depth: DEPTH.hud,
    pixelWidth: 720,
    pixelHeight: subtitle ? 92 : 64,
  });
  const sub = subtitle ? `<div class="title-sub">${subtitle}</div>` : "";
  visual.setHtml(`<div class="title-main">${title}</div>${sub}`);
  visual.setPosition(x, y);
  return visual;
}

/**
 * Add a CSS-rendered button.  onClick fires on either the DOM click event
 * (mouse / touch) or via `setSelected(true)` + scene-level Enter/Space.
 */
export function addChromeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  accentHex: string,
  onClick: () => void,
  variant: "default" | "danger" = "default"
): ChromeButton {
  const visual = new CssVisual(scene, "cv-button", {
    depth: DEPTH.hud,
    pixelWidth: w,
    pixelHeight: h,
  });
  visual.node.style.setProperty("--btn-color", accentHex);
  // Build an rgba glow from the hex
  const m = /^#?([0-9a-f]{6})$/i.exec(accentHex);
  if (m) {
    const r = parseInt(m[1].slice(0, 2), 16);
    const g = parseInt(m[1].slice(2, 4), 16);
    const b = parseInt(m[1].slice(4, 6), 16);
    visual.node.style.setProperty("--btn-glow", `rgba(${r}, ${g}, ${b}, 0.35)`);
  }
  if (variant === "danger") visual.node.setAttribute("data-variant", "danger");
  visual.setHtml(`
    <div class="btn-shell">
      <span class="btn-label">${label}</span>
    </div>
  `);
  visual.setPosition(x, y);

  const labelEl = visual.node.querySelector(".btn-label") as HTMLElement;

  const clickHandler = (ev: Event) => {
    ev.preventDefault();
    onClick();
  };
  visual.node.addEventListener("click", clickHandler);
  visual.node.addEventListener("touchend", clickHandler);

  const setSelected = (selected: boolean) => {
    if (selected) visual.node.setAttribute("data-selected", "1");
    else visual.node.removeAttribute("data-selected");
  };

  const setLabel = (text: string) => {
    labelEl.textContent = text;
  };

  const destroy = () => {
    visual.node.removeEventListener("click", clickHandler);
    visual.node.removeEventListener("touchend", clickHandler);
    visual.destroy();
  };

  return { visual, setSelected, setLabel, destroy };
}

/**
 * Simple centred label row.
 */
export function addCssText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  opts: {
    size?: number;
    color?: string;
    weight?: number | "bold" | "normal";
    letterSpacing?: number;
    align?: "center" | "left" | "right";
    width?: number;
  } = {}
): CssVisual {
  const visual = new CssVisual(scene, "cv-text", {
    depth: DEPTH.hud,
    pixelWidth: opts.width ?? 600,
    pixelHeight: (opts.size ?? 14) + 6,
  });
  const el = document.createElement("div");
  el.textContent = text;
  el.style.fontSize = `${opts.size ?? 14}px`;
  el.style.color = opts.color ?? "#e7f6ff";
  el.style.fontWeight = String(opts.weight ?? 700);
  el.style.letterSpacing = `${opts.letterSpacing ?? 2}px`;
  el.style.textAlign = opts.align ?? "center";
  el.style.whiteSpace = "nowrap";
  el.style.width = "100%";
  visual.node.querySelector(".cv-flip")!.appendChild(el);
  visual.setPosition(x, y);
  return visual;
}

/**
 * Pulsing "Press X to continue" prompt.
 */
export function addCssHint(scene: Phaser.Scene, x: number, y: number, text: string): CssVisual {
  const visual = new CssVisual(scene, "cv-hint-text", {
    depth: DEPTH.hud,
    pixelWidth: 600,
    pixelHeight: 24,
  });
  const el = document.createElement("div");
  el.textContent = text;
  el.style.width = "100%";
  visual.node.querySelector(".cv-flip")!.appendChild(el);
  visual.setPosition(x, y);
  return visual;
}

/**
 * Bottom-of-screen footer (BEST LEVEL / BEST SCORE etc.)
 */
export function addCssFooter(scene: Phaser.Scene, html: string): CssVisual {
  const visual = new CssVisual(scene, "cv-footer", {
    depth: DEPTH.hud,
    pixelWidth: GAME_WIDTH,
    pixelHeight: 18,
  });
  const el = document.createElement("div");
  el.innerHTML = html;
  el.style.width = "100%";
  visual.node.querySelector(".cv-flip")!.appendChild(el);
  visual.setPosition(GAME_WIDTH / 2, GAME_HEIGHT - 24);
  return visual;
}

/**
 * Slider row centred at (x, y).  `get` / `set` are the value accessors —
 * the slider just renders the percentage and forwards drag events.
 */
export function addCssSlider(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  label: string,
  get: () => number,
  set: (v: number) => void
): ChromeSlider {
  const visual = new CssVisual(scene, "cv-slider", {
    depth: DEPTH.hud,
    pixelWidth: width,
    pixelHeight: 30,
  });
  visual.setHtml(`
    <div class="sl-label">${label}</div>
    <div class="sl-track"><div class="sl-fill"></div></div>
    <div class="sl-value">0</div>
  `);
  visual.setPosition(x, y);

  const trackEl = visual.node.querySelector(".sl-track") as HTMLElement;
  const fillEl = visual.node.querySelector(".sl-fill") as HTMLElement;
  const valEl = visual.node.querySelector(".sl-value") as HTMLElement;

  const refresh = () => {
    const v = Phaser.Math.Clamp(get(), 0, 1);
    fillEl.style.width = `${v * 100}%`;
    valEl.textContent = `${Math.round(v * 100)}`;
  };
  refresh();

  let dragging = false;
  const apply = (clientX: number) => {
    const rect = trackEl.getBoundingClientRect();
    const v = Phaser.Math.Clamp((clientX - rect.left) / rect.width, 0, 1);
    set(v);
    refresh();
  };
  const onDown = (ev: PointerEvent) => {
    dragging = true;
    apply(ev.clientX);
    trackEl.setPointerCapture(ev.pointerId);
  };
  const onMove = (ev: PointerEvent) => {
    if (!dragging) return;
    apply(ev.clientX);
  };
  const onUp = (ev: PointerEvent) => {
    dragging = false;
    if (trackEl.hasPointerCapture(ev.pointerId)) {
      trackEl.releasePointerCapture(ev.pointerId);
    }
  };
  trackEl.addEventListener("pointerdown", onDown);
  trackEl.addEventListener("pointermove", onMove);
  trackEl.addEventListener("pointerup", onUp);
  trackEl.addEventListener("pointercancel", onUp);

  const destroy = () => {
    trackEl.removeEventListener("pointerdown", onDown);
    trackEl.removeEventListener("pointermove", onMove);
    trackEl.removeEventListener("pointerup", onUp);
    trackEl.removeEventListener("pointercancel", onUp);
    visual.destroy();
  };

  return { visual, refresh, destroy };
}

/**
 * On/Off toggle row.
 */
export function addCssToggle(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  label: string,
  get: () => boolean,
  set: (v: boolean) => void,
  labels: { onLabel?: string; offLabel?: string } = {}
): ChromeToggle {
  const onLbl = labels.onLabel ?? "ON";
  const offLbl = labels.offLabel ?? "OFF";

  const visual = new CssVisual(scene, "cv-toggle", {
    depth: DEPTH.hud,
    pixelWidth: width,
    pixelHeight: 30,
  });
  visual.setHtml(`
    <div class="tg-label">${label}</div>
    <div class="tg-pill">${get() ? onLbl : offLbl}</div>
  `);
  visual.setPosition(x, y);

  const pillEl = visual.node.querySelector(".tg-pill") as HTMLElement;
  const refresh = () => {
    const v = get();
    pillEl.textContent = v ? onLbl : offLbl;
    if (v) visual.node.setAttribute("data-on", "1");
    else visual.node.removeAttribute("data-on");
  };
  refresh();

  const clickHandler = () => {
    set(!get());
    refresh();
  };
  pillEl.addEventListener("click", clickHandler);

  const destroy = () => {
    pillEl.removeEventListener("click", clickHandler);
    visual.destroy();
  };

  return { visual, refresh, destroy };
}
