import type { ObjectDef, BuiltinObjectType, ToolType } from "./types";

function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = "#4a90d9";
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  ctx.strokeStyle = "#2b6cb0";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillRect(x + 3, y + 3, size - 6, 4);
}

function drawSpike(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = "#e74c3c";
  ctx.strokeStyle = "#c0392b";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + size / 2, y + 2);
  ctx.lineTo(x + size - 2, y + size - 2);
  ctx.lineTo(x + 2, y + size - 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawPlatform(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = "#27ae60";
  ctx.fillRect(x + 1, y + size / 2, size - 2, size / 2 - 1);
  ctx.strokeStyle = "#1e8449";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 1, y + size / 2, size - 2, size / 2 - 1);
  ctx.fillStyle = "#2ecc71";
  ctx.fillRect(x + 1, y + size / 2, size - 2, 5);
}

function drawPortal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2 - 3;
  const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  grad.addColorStop(0, "#a855f7");
  grad.addColorStop(1, "#7c3aed");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.5, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c4b5fd";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2 - 4;
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#fbbf24";
  ctx.font = `bold ${Math.floor(size * 0.4)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("$", cx, cy);
}

function drawRing(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const outer = size / 2 - 3;
  const inner = size / 4;
  ctx.strokeStyle = "#f97316";
  ctx.lineWidth = outer - inner;
  ctx.beginPath();
  ctx.arc(cx, cy, (outer + inner) / 2, 0, Math.PI * 2);
  ctx.stroke();
}

function drawOrb(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2 - 4;
  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
  grad.addColorStop(0, "#f0fdf4");
  grad.addColorStop(0.5, "#86efac");
  grad.addColorStop(1, "#16a34a");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#15803d";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawSpeedChanger(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  borderColor: string,
  arrowCount: number,
  label: string
) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2 - 2;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, y + 2);
  ctx.lineTo(x + size - 2, cy);
  ctx.lineTo(cx, y + size - 2);
  ctx.lineTo(x + 2, cy);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#fff";
  const arrowSize = Math.max(4, size * 0.18);
  const totalW = arrowCount * arrowSize + (arrowCount - 1) * 1;
  const startX = cx - totalW / 2;
  for (let i = 0; i < arrowCount; i++) {
    const ax = startX + i * (arrowSize + 1);
    ctx.beginPath();
    ctx.moveTo(ax + arrowSize, cy);
    ctx.lineTo(ax, cy - arrowSize * 0.7);
    ctx.lineTo(ax, cy + arrowSize * 0.7);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = `bold ${Math.floor(size * 0.2)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(label, cx, y + size - 10);
}

function drawSpeedSlow(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawSpeedChanger(ctx, x, y, size, "#3b82f6", "#1d4ed8", 1, "0.5x");
}

function drawSpeedNormal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawSpeedChanger(ctx, x, y, size, "#22c55e", "#15803d", 1, "1x");
}

function drawSpeedFast(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawSpeedChanger(ctx, x, y, size, "#f59e0b", "#b45309", 2, "2x");
}

function drawSpeedVFast(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawSpeedChanger(ctx, x, y, size, "#ef4444", "#b91c1c", 3, "3x");
}

function drawSpeedSFast(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawSpeedChanger(ctx, x, y, size, "#a855f7", "#7e22ce", 4, "4x");
}

export interface SpeedInfo {
  multiplier: string;
  unitsPerSec: number;
  blocksPerSec: number;
}

export const SPEED_DATA: Record<string, SpeedInfo> = {
  speed_slow:   { multiplier: "0.5x", unitsPerSec: 251.25, blocksPerSec: 8.375 },
  speed_normal: { multiplier: "1x",  unitsPerSec: 311.58, blocksPerSec: 10.386 },
  speed_fast:   { multiplier: "2x",  unitsPerSec: 387.42, blocksPerSec: 12.914 },
  speed_vfast:  { multiplier: "3x",  unitsPerSec: 468.00, blocksPerSec: 15.6 },
  speed_sfast:  { multiplier: "4x",  unitsPerSec: 576.00, blocksPerSec: 19.2 },
};

export const OBJECT_DEFS: Record<BuiltinObjectType, Omit<ObjectDef, "type">> = {
  block:        { label: "Block",      color: "#4a90d9", render: drawBlock },
  spike:        { label: "Spike",      color: "#e74c3c", render: drawSpike },
  platform:     { label: "Platform",   color: "#27ae60", render: drawPlatform },
  portal:       { label: "Portal",     color: "#7c3aed", render: drawPortal },
  coin:         { label: "Coin",       color: "#f59e0b", render: drawCoin },
  ring:         { label: "Ring",       color: "#f97316", render: drawRing },
  orb:          { label: "Orb",        color: "#16a34a", render: drawOrb },
  speed_slow:   { label: "Slow",       color: "#3b82f6", render: drawSpeedSlow },
  speed_normal: { label: "Normal",     color: "#22c55e", render: drawSpeedNormal },
  speed_fast:   { label: "Fast",       color: "#f59e0b", render: drawSpeedFast },
  speed_vfast:  { label: "V.Fast",     color: "#ef4444", render: drawSpeedVFast },
  speed_sfast:  { label: "S.Fast",     color: "#a855f7", render: drawSpeedSFast },
};

export const BUILTIN_TYPES: BuiltinObjectType[] = [
  "block", "spike", "platform", "portal", "coin", "ring", "orb",
  "speed_slow", "speed_normal", "speed_fast", "speed_vfast", "speed_sfast",
];

export const TOOLBAR_ITEMS: ToolType[] = [
  "block", "spike", "platform", "portal", "coin", "ring", "orb",
  "speed_slow", "speed_normal", "speed_fast", "speed_vfast", "speed_sfast",
  "eraser",
];

export function isBuiltinType(type: string): type is BuiltinObjectType {
  return type in OBJECT_DEFS;
}
