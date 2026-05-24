import Phaser from "phaser";
import {
  COLORS,
  DEPTH,
  FONT_FAMILY,
  GAME_HEIGHT,
  GAME_WIDTH,
  LOGICAL_SCALE,
  TEX,
} from "../constants";

type BackdropTone = "blue" | "purple" | "amber" | "danger" | "victory";

type ChromeButton = {
  bg: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  edge: Phaser.GameObjects.Rectangle;
};

function tonePalette(tone: BackdropTone): { far: number; mid: number; accent: number; accent2: number } {
  switch (tone) {
    case "purple":
      return { far: 0x0b0824, mid: 0x21174f, accent: COLORS.neonPink, accent2: COLORS.neonCyan };
    case "amber":
      return { far: 0x120c18, mid: 0x3a244b, accent: COLORS.neonOrange, accent2: COLORS.neonGold };
    case "danger":
      return { far: 0x150915, mid: 0x351433, accent: COLORS.warning, accent2: COLORS.neonPink };
    case "victory":
      return { far: 0x071618, mid: 0x113b3e, accent: COLORS.neonGold, accent2: COLORS.neonGreen };
    case "blue":
    default:
      return { far: COLORS.bgDeep, mid: COLORS.bgFar, accent: COLORS.neonCyan, accent2: COLORS.neonPink };
  }
}

export function addSceneBackdrop(scene: Phaser.Scene, tone: BackdropTone = "blue"): void {
  const palette = tonePalette(tone);

  const g = scene.add.graphics();
  g.fillStyle(palette.far, 1);
  g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  g.fillStyle(palette.mid, 0.7);
  g.fillCircle(GAME_WIDTH * 0.72, GAME_HEIGHT * 0.34, 340);
  g.fillStyle(palette.accent, 0.08);
  g.fillCircle(GAME_WIDTH * 0.22, GAME_HEIGHT * 0.72, 260);
  g.fillStyle(palette.accent2, 0.06);
  g.fillCircle(GAME_WIDTH * 0.86, GAME_HEIGHT * 0.84, 220);

  g.lineStyle(1, 0xffffff, 0.04);
  for (let x = 0; x <= GAME_WIDTH; x += 48) {
    g.lineBetween(x, 0, x - 80, GAME_HEIGHT);
  }
  for (let y = 30; y < GAME_HEIGHT; y += 48) {
    g.lineBetween(0, y, GAME_WIDTH, y + 22);
  }

  g.fillStyle(0x03040e, 0.45);
  for (let i = 0; i < 7; i++) {
    const x = 50 + i * 145;
    g.fillRoundedRect(x, 38 + (i % 2) * 22, 22, GAME_HEIGHT - 90, 4);
    g.fillRoundedRect(x - 14, 118 + (i % 3) * 48, 50, 10, 3);
  }

  g.fillStyle(0x0b1230, 0.85);
  g.fillRect(0, GAME_HEIGHT - 86, GAME_WIDTH, 86);
  g.fillStyle(palette.accent, 0.18);
  g.fillRect(0, GAME_HEIGHT - 88, GAME_WIDTH, 3);
  g.lineStyle(2, palette.accent2, 0.16);
  for (let x = -40; x < GAME_WIDTH; x += 72) {
    g.lineBetween(x, GAME_HEIGHT - 20, x + 42, GAME_HEIGHT - 66);
  }
  g.setDepth(DEPTH.bgFar - 20);

  if (!scene.textures.exists(TEX.particle)) return;
  for (let i = 0; i < 26; i++) {
    const spark = scene.add.image(
      Phaser.Math.Between(0, GAME_WIDTH),
      Phaser.Math.Between(20, GAME_HEIGHT - 110),
      TEX.particle
    );
    spark.setTint(i % 3 === 0 ? palette.accent2 : palette.accent);
    spark.setAlpha(0.18 + Math.random() * 0.28);
    spark.setScale((0.2 + Math.random() * 0.45) * LOGICAL_SCALE);
    spark.setBlendMode(Phaser.BlendModes.ADD);
    spark.setDepth(DEPTH.bgNear);
    scene.tweens.add({
      targets: spark,
      y: spark.y - 22 - Math.random() * 42,
      alpha: 0.05,
      duration: 1800 + Math.random() * 2600,
      yoyo: true,
      repeat: -1,
      delay: Math.random() * 1200,
      ease: "Sine.easeInOut",
    });
  }
}

export function addGlassPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  accent: number = COLORS.neonCyan,
  alpha: number = 0.9
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const left = x - w / 2;
  const top = y - h / 2;

  g.fillStyle(0x000000, 0.28);
  g.fillRoundedRect(left + 8, top + 10, w, h, 8);
  g.fillStyle(0x090d24, alpha);
  g.fillRoundedRect(left, top, w, h, 8);
  g.fillStyle(0xffffff, 0.035);
  g.fillRoundedRect(left + 4, top + 4, w - 8, Math.max(18, h * 0.38), 6);
  g.lineStyle(2, accent, 0.86);
  g.strokeRoundedRect(left, top, w, h, 8);
  g.lineStyle(1, 0xffffff, 0.18);
  g.strokeRoundedRect(left + 4, top + 4, w - 8, h - 8, 6);
  g.fillStyle(accent, 0.75);
  g.fillRect(left + 18, top, Math.min(140, w - 36), 3);
  g.fillStyle(accent, 0.24);
  g.fillRect(left + 18, top + h - 4, w - 36, 2);

  return g;
}

export function addChromeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  color: number,
  onClick: () => void
): ChromeButton {
  const bg = scene.add.rectangle(x, y, w, h, 0x10173a, 0.92);
  bg.setStrokeStyle(2, color, 0.85);
  bg.setInteractive({ useHandCursor: true });

  const edge = scene.add.rectangle(x, y + h / 2 - 3, w - 18, 3, color, 0.5);
  const text = scene.add.text(x, y, label, {
    fontFamily: FONT_FAMILY,
    fontStyle: "900",
    fontSize: "16px",
    color: "#e7f6ff",
  });
  text.setOrigin(0.5);

  bg.on("pointerover", () => {
    bg.setFillStyle(0x17204d, 0.98);
    bg.setStrokeStyle(3, COLORS.neonPink, 1);
    edge.setFillStyle(COLORS.neonPink, 0.85);
    text.setColor("#ffd166");
    scene.tweens.add({ targets: [bg, edge, text], scaleX: 1.035, scaleY: 1.035, duration: 130 });
  });
  bg.on("pointerout", () => {
    bg.setFillStyle(0x10173a, 0.92);
    bg.setStrokeStyle(2, color, 0.85);
    edge.setFillStyle(color, 0.5);
    text.setColor("#e7f6ff");
    scene.tweens.add({ targets: [bg, edge, text], scaleX: 1, scaleY: 1, duration: 130 });
  });
  bg.on("pointerdown", onClick);

  return { bg, label: text, edge };
}
