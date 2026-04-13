import type { ObjectDef, BuiltinObjectType, ToolType } from "./types";

const spriteCache = new Map<string, HTMLImageElement>();

function loadSprite(path: string): HTMLImageElement {
  if (spriteCache.has(path)) return spriteCache.get(path)!;
  const img = new Image();
  img.src = path;
  spriteCache.set(path, img);
  return img;
}

function makeSpriteRenderer(path: string) {
  const img = loadSprite(path);
  return (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
    if (img.complete && img.naturalWidth > 0) {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const ratio = Math.min(s / iw, s / ih);
      const dw = iw * ratio;
      const dh = ih * ratio;
      const dx = x + (s - dw) / 2;
      const dy = y + (s - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      ctx.fillStyle = "rgba(255,0,255,0.3)";
      ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      ctx.fillStyle = "#fff";
      ctx.font = "8px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("...", x + s / 2, y + s / 2);
    }
  };
}

function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const m = 1;
  ctx.fillStyle = "#2a0a20";
  ctx.fillRect(x + m, y + m, s - m * 2, s - m * 2);
  ctx.fillStyle = "#3d1030";
  ctx.fillRect(x + m, y + m, s - m * 2, 3);
  ctx.fillRect(x + m, y + m, 3, s - m * 2);
  ctx.fillStyle = "#1a0614";
  ctx.fillRect(x + m, y + s - m - 3, s - m * 2, 3);
  ctx.fillRect(x + s - m - 3, y + m, 3, s - m * 2);
  ctx.strokeStyle = "#d63384";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + m + 0.5, y + m + 0.5, s - m * 2 - 1, s - m * 2 - 1);
  ctx.strokeStyle = "rgba(214,51,132,0.25)";
  ctx.lineWidth = 0.8;
  const inner = 5;
  ctx.strokeRect(x + inner, y + inner, s - inner * 2, s - inner * 2);
  ctx.strokeStyle = "rgba(214,51,132,0.12)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(x + inner, y + inner);
  ctx.lineTo(x + s - inner, y + s - inner);
  ctx.moveTo(x + s - inner, y + inner);
  ctx.lineTo(x + inner, y + s - inner);
  ctx.stroke();
}

function drawModePortal(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  color: string, icon: string, isMini: boolean
) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  const r = s / 2 - 2;
  ctx.fillStyle = color + "25";
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.55, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  if (isMini) {
    ctx.strokeStyle = color + "50";
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.35, r * 0.65, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.floor(s * (isMini ? 0.26 : 0.32))}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(icon, cx, cy - (isMini ? 3 : 0));
  if (isMini) {
    ctx.fillStyle = color + "bb";
    ctx.font = `bold ${Math.floor(s * 0.17)}px monospace`;
    ctx.fillText("mini", cx, cy + r * 0.55);
  }
}

function drawRamp(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const m = 1;
  ctx.fillStyle = "#2a0a20";
  ctx.beginPath();
  ctx.moveTo(x + m, y + s - m);
  ctx.lineTo(x + s - m, y + s - m);
  ctx.lineTo(x + s - m, y + m);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#d63384";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + m, y + s - m);
  ctx.lineTo(x + s - m, y + s - m);
  ctx.lineTo(x + s - m, y + m);
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = "rgba(214,51,132,0.2)";
  ctx.lineWidth = 0.5;
  const steps = 4;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const lx = x + m + t * (s - m * 2);
    const ly = y + s - m - t * (s - m * 2);
    ctx.beginPath();
    ctx.moveTo(lx, y + s - m);
    ctx.lineTo(lx, ly);
    ctx.stroke();
  }
}

const BASE = import.meta.env.BASE_URL ?? "/";
const spritePath = (name: string) => `${BASE}sprites/${name}`;

export const OBJECT_DEFS: Record<BuiltinObjectType, Omit<ObjectDef, "type">> = {
  spike_purple:      { label: "Spike \u25B2",  color: "#b844e0", render: makeSpriteRenderer(spritePath("spike_purple.png")) },
  spike_purple_down: { label: "Spike \u25BC",  color: "#b844e0", render: makeSpriteRenderer(spritePath("spike_purple_down.png")) },
  spike_green:       { label: "Spike \u25B2",  color: "#44e060", render: makeSpriteRenderer(spritePath("spike_green.png")) },
  spike_green_down:  { label: "Spike \u25BC",  color: "#44e060", render: makeSpriteRenderer(spritePath("spike_green_down.png")) },
  spike_blue:        { label: "Spike \u25B2",  color: "#44b0e0", render: makeSpriteRenderer(spritePath("spike_blue.png")) },
  spike_blue_down:   { label: "Spike \u25BC",  color: "#44b0e0", render: makeSpriteRenderer(spritePath("spike_blue_down.png")) },
  block:             { label: "Block",         color: "#d63384", render: drawBlock },
  ramp:              { label: "Ramp",          color: "#d63384", render: drawRamp },
  sawblade:          { label: "Cog",           color: "#ff2020", render: makeSpriteRenderer(spritePath("sawblade.png")) },
  dash_green:        { label: "Dash G",        color: "#00ff40", render: makeSpriteRenderer(spritePath("dash_green.png")) },
  dash_pink:         { label: "Dash P",        color: "#ff40a0", render: makeSpriteRenderer(spritePath("dash_pink.png")) },
  gm_wave:           { label: "Wave",          color: "#facc15", render: (c, x, y, s) => drawModePortal(c, x, y, s, "#facc15", "\u2215", false) },
  gm_wave_mini:      { label: "Wave M",        color: "#facc15", render: (c, x, y, s) => drawModePortal(c, x, y, s, "#facc15", "\u2215", true) },
  speed_slow:        { label: "Slow",          color: "#ff8c00", render: makeSpriteRenderer(spritePath("portal_slow.png")) },
  speed_normal:      { label: "Normal",        color: "#00d4ff", render: makeSpriteRenderer(spritePath("portal_normal.png")) },
  speed_fast:        { label: "Fast",          color: "#00ff40", render: makeSpriteRenderer(spritePath("portal_fast.png")) },
  speed_vfast:       { label: "V.Fast",        color: "#e040ff", render: makeSpriteRenderer(spritePath("portal_vfast.png")) },
  speed_sfast:       { label: "S.Fast",        color: "#ff2020", render: makeSpriteRenderer(spritePath("portal_sfast.png")) },
};

export const BUILTIN_TYPES: BuiltinObjectType[] = Object.keys(OBJECT_DEFS) as BuiltinObjectType[];

export const TOOLBAR_GROUPS: { label: string; items: ToolType[] }[] = [
  { label: "Walls", items: ["block", "ramp", "sawblade"] },
  { label: "Purple", items: ["spike_purple", "spike_purple_down"] },
  { label: "Green", items: ["spike_green", "spike_green_down"] },
  { label: "Blue", items: ["spike_blue", "spike_blue_down"] },
  { label: "Dash Orbs", items: ["dash_green", "dash_pink"] },
  { label: "Mode", items: ["gm_wave", "gm_wave_mini"] },
  { label: "Speed", items: ["speed_slow", "speed_normal", "speed_fast", "speed_vfast", "speed_sfast"] },
  { label: "", items: ["eraser"] },
];

export const TOOLBAR_ITEMS: ToolType[] = TOOLBAR_GROUPS.flatMap((g) => g.items);

export function isBuiltinType(type: string): type is BuiltinObjectType {
  return type in OBJECT_DEFS;
}
