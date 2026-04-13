import type { ObjectDef, BuiltinObjectType, ToolType } from "./types";

function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.fillStyle = "#1c0b24";
  ctx.fillRect(x, y, s, s);
  ctx.strokeStyle = "#d63384";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, s - 2, s - 2);
  ctx.strokeStyle = "rgba(214,51,132,0.3)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 4, y + 4, s - 8, s - 8);
  ctx.strokeStyle = "rgba(214,51,132,0.15)";
  ctx.beginPath();
  ctx.moveTo(x + 4, y + 4);
  ctx.lineTo(x + s - 4, y + s - 4);
  ctx.moveTo(x + s - 4, y + 4);
  ctx.lineTo(x + 4, y + s - 4);
  ctx.stroke();
}

function drawSpike(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const cx = x + s / 2;
  ctx.fillStyle = "#2d0a1e";
  ctx.beginPath();
  ctx.moveTo(cx, y + 3);
  ctx.lineTo(x + s - 3, y + s - 2);
  ctx.lineTo(x + 3, y + s - 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#e84393";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "rgba(232,67,147,0.2)";
  ctx.beginPath();
  ctx.moveTo(cx, y + s * 0.35);
  ctx.lineTo(x + s * 0.65, y + s - 4);
  ctx.lineTo(x + s * 0.35, y + s - 4);
  ctx.closePath();
  ctx.fill();
}

function drawSpikeDown(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const cx = x + s / 2;
  ctx.fillStyle = "#2d0a1e";
  ctx.beginPath();
  ctx.moveTo(cx, y + s - 3);
  ctx.lineTo(x + s - 3, y + 2);
  ctx.lineTo(x + 3, y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#e84393";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "rgba(232,67,147,0.2)";
  ctx.beginPath();
  ctx.moveTo(cx, y + s * 0.65);
  ctx.lineTo(x + s * 0.65, y + 4);
  ctx.lineTo(x + s * 0.35, y + 4);
  ctx.closePath();
  ctx.fill();
}

function drawSawblade(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  const r = s / 2 - 3;
  const teeth = 8;
  ctx.fillStyle = "#2d0a1e";
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a1 = (i / teeth) * Math.PI * 2;
    const a2 = ((i + 0.5) / teeth) * Math.PI * 2;
    const outerR = r;
    const innerR = r * 0.7;
    ctx.lineTo(cx + Math.cos(a1) * outerR, cy + Math.sin(a1) * outerR);
    ctx.lineTo(cx + Math.cos(a2) * innerR, cy + Math.sin(a2) * innerR);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#e84393";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#e84393";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1c0b24";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

function drawRing(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  const r = s / 2 - 4;
  ctx.strokeStyle = "#00e5ff";
  ctx.lineWidth = 4;
  ctx.shadowColor = "#00e5ff";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(0,229,255,0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
  ctx.stroke();
}

function drawOrb(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  const r = s / 2 - 4;
  const grad = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 1, cx, cy, r);
  grad.addColorStop(0, "#ffffcc");
  grad.addColorStop(0.4, "#ffd700");
  grad.addColorStop(1, "#b8860b");
  ctx.shadowColor = "#ffd700";
  ctx.shadowBlur = 10;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpeedChanger(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  color: string, borderColor: string,
  arrowCount: number, label: string
) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, y + 2);
  ctx.lineTo(x + s - 2, cy);
  ctx.lineTo(cx, y + s - 2);
  ctx.lineTo(x + 2, cy);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  const aSize = Math.max(4, s * 0.18);
  const totalW = arrowCount * aSize + (arrowCount - 1) * 1;
  const startX = cx - totalW / 2;
  for (let i = 0; i < arrowCount; i++) {
    const ax = startX + i * (aSize + 1);
    ctx.beginPath();
    ctx.moveTo(ax + aSize, cy);
    ctx.lineTo(ax, cy - aSize * 0.7);
    ctx.lineTo(ax, cy + aSize * 0.7);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = `bold ${Math.floor(s * 0.2)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(label, cx, y + s - 10);
}

function drawSpeedSlow(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawSpeedChanger(ctx, x, y, s, "#3b82f6", "#1d4ed8", 1, "0.5x");
}
function drawSpeedNormal(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawSpeedChanger(ctx, x, y, s, "#22c55e", "#15803d", 1, "1x");
}
function drawSpeedFast(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawSpeedChanger(ctx, x, y, s, "#f59e0b", "#b45309", 2, "2x");
}
function drawSpeedVFast(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawSpeedChanger(ctx, x, y, s, "#ef4444", "#b91c1c", 3, "3x");
}
function drawSpeedSFast(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawSpeedChanger(ctx, x, y, s, "#a855f7", "#7e22ce", 4, "4x");
}

function drawGamemodePortal(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  color: string, borderColor: string,
  icon: string, isMini: boolean
) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  const r = s / 2 - 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.55, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  if (isMini) {
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 0.35, r * 0.65, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.floor(s * (isMini ? 0.28 : 0.35))}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(icon, cx, cy - (isMini ? 2 : 0));
  if (isMini) {
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = `bold ${Math.floor(s * 0.18)}px monospace`;
    ctx.fillText("mini", cx, cy + r * 0.55);
  }
}

function drawCubeMode(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawGamemodePortal(ctx, x, y, s, "#22d3ee", "#0891b2", "\u25A0", false);
}
function drawWaveMode(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawGamemodePortal(ctx, x, y, s, "#facc15", "#a16207", "\u2215", false);
}
function drawWaveModeMini(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawGamemodePortal(ctx, x, y, s, "#facc15", "#a16207", "\u2215", true);
}

export const OBJECT_DEFS: Record<BuiltinObjectType, Omit<ObjectDef, "type">> = {
  block:        { label: "Block",      color: "#d63384", render: drawBlock },
  spike:        { label: "Spike \u25B2",  color: "#e84393", render: drawSpike },
  spike_down:   { label: "Spike \u25BC",  color: "#e84393", render: drawSpikeDown },
  sawblade:     { label: "Saw",        color: "#e84393", render: drawSawblade },
  ring:         { label: "Ring",       color: "#00e5ff", render: drawRing },
  orb:          { label: "Orb",        color: "#ffd700", render: drawOrb },
  speed_slow:   { label: "Slow",       color: "#3b82f6", render: drawSpeedSlow },
  speed_normal: { label: "Normal",     color: "#22c55e", render: drawSpeedNormal },
  speed_fast:   { label: "Fast",       color: "#f59e0b", render: drawSpeedFast },
  speed_vfast:  { label: "V.Fast",     color: "#ef4444", render: drawSpeedVFast },
  speed_sfast:  { label: "S.Fast",     color: "#a855f7", render: drawSpeedSFast },
  gm_cube:      { label: "Cube",       color: "#22d3ee", render: drawCubeMode },
  gm_wave:      { label: "Wave",       color: "#facc15", render: drawWaveMode },
  gm_wave_mini: { label: "Wave M",     color: "#facc15", render: drawWaveModeMini },
};

export const BUILTIN_TYPES: BuiltinObjectType[] = [
  "block", "spike", "spike_down", "sawblade", "ring", "orb",
  "speed_slow", "speed_normal", "speed_fast", "speed_vfast", "speed_sfast",
  "gm_cube", "gm_wave", "gm_wave_mini",
];

export const TOOLBAR_GROUPS: { label: string; items: ToolType[] }[] = [
  { label: "Build", items: ["block", "spike", "spike_down", "sawblade", "ring", "orb"] },
  { label: "Speed", items: ["speed_slow", "speed_normal", "speed_fast", "speed_vfast", "speed_sfast"] },
  { label: "Mode", items: ["gm_cube", "gm_wave", "gm_wave_mini"] },
  { label: "", items: ["eraser"] },
];

export const TOOLBAR_ITEMS: ToolType[] = TOOLBAR_GROUPS.flatMap((g) => g.items);

export function isBuiltinType(type: string): type is BuiltinObjectType {
  return type in OBJECT_DEFS;
}
