import type { ObjectDef, BuiltinObjectType, ToolType } from "./types";

function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = "#1a0a1e";
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  ctx.strokeStyle = "#d63384";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
  ctx.fillStyle = "rgba(214,51,132,0.12)";
  ctx.fillRect(x + 3, y + 3, size - 6, 4);
}

function drawSpike(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = "#2d0a1e";
  ctx.strokeStyle = "#e84393";
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

function drawGamemodePortal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  borderColor: string,
  icon: string,
  isMini: boolean
) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2 - 2;

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
  ctx.font = `bold ${Math.floor(size * (isMini ? 0.28 : 0.35))}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(icon, cx, cy - (isMini ? 2 : 0));

  if (isMini) {
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = `bold ${Math.floor(size * 0.18)}px monospace`;
    ctx.fillText("mini", cx, cy + r * 0.55);
  }
}

function drawCubeMode(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawGamemodePortal(ctx, x, y, size, "#22d3ee", "#0891b2", "\u25A0", false);
}
function drawCubeModeMini(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawGamemodePortal(ctx, x, y, size, "#22d3ee", "#0891b2", "\u25A0", true);
}
function drawBallMode(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawGamemodePortal(ctx, x, y, size, "#f97316", "#c2410c", "\u25CF", false);
}
function drawBallModeMini(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawGamemodePortal(ctx, x, y, size, "#f97316", "#c2410c", "\u25CF", true);
}
function drawUfoMode(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawGamemodePortal(ctx, x, y, size, "#a78bfa", "#7c3aed", "\u2666", false);
}
function drawUfoModeMini(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawGamemodePortal(ctx, x, y, size, "#a78bfa", "#7c3aed", "\u2666", true);
}
function drawRobotMode(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawGamemodePortal(ctx, x, y, size, "#6ee7b7", "#059669", "\u2699", false);
}
function drawRobotModeMini(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawGamemodePortal(ctx, x, y, size, "#6ee7b7", "#059669", "\u2699", true);
}

function drawWaveMode(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawGamemodePortal(ctx, x, y, size, "#facc15", "#a16207", "\u2215", false);
}
function drawWaveModeMini(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  drawGamemodePortal(ctx, x, y, size, "#facc15", "#a16207", "\u2215", true);
}

function drawOrbDashGreen(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2 - 3;
  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
  grad.addColorStop(0, "#bbf7d0");
  grad.addColorStop(0.5, "#4ade80");
  grad.addColorStop(1, "#166534");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#15803d";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.floor(size * 0.32)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("\u2192", cx, cy);
}

function drawOrbDashPink(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2 - 3;
  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
  grad.addColorStop(0, "#fce7f3");
  grad.addColorStop(0.5, "#f472b6");
  grad.addColorStop(1, "#9d174d");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#be185d";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.floor(size * 0.32)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("\u2192", cx, cy);
  ctx.font = `bold ${Math.floor(size * 0.18)}px sans-serif`;
  ctx.fillText("\u21C5", cx + r * 0.55, cy - r * 0.45);
}

function drawOrbSpider(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2 - 3;
  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
  grad.addColorStop(0, "#e5e7eb");
  grad.addColorStop(0.5, "#6b7280");
  grad.addColorStop(1, "#1f2937");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${Math.floor(size * 0.28)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("\u2195", cx, cy);
}

export interface GamemodeInfo {
  jumpForce: number;
  gravity: number;
  maxHold?: number;
  angle?: number;
  vyRatio?: number;
  smoothingDelay?: number;
  inputLatency?: number;
  vyScalesWithSpeed?: boolean;
}

export interface WaveSpeedProfile {
  speed: string;
  vx: number;
  vy: number;
  vyMini: number;
}

export const WAVE_SPEED_PROFILES: WaveSpeedProfile[] = [
  { speed: "Slow (0.5x)",   vx: 251.25, vy: 251.25, vyMini: 502.50 },
  { speed: "Normal (1x)",   vx: 311.58, vy: 311.58, vyMini: 623.16 },
  { speed: "Fast (2x)",     vx: 387.42, vy: 387.42, vyMini: 774.84 },
  { speed: "V.Fast (3x)",   vx: 468.00, vy: 468.00, vyMini: 936.00 },
  { speed: "S.Fast (4x)",   vx: 576.00, vy: 576.00, vyMini: 1152.00 },
];

export const GAMEMODE_DATA: Record<string, GamemodeInfo> = {
  gm_cube:       { jumpForce: 94.0408, gravity: 20.3755 },
  gm_cube_mini:  { jumpForce: 94.0408, gravity: 16.2612 },
  gm_ball:       { jumpForce: 54.4423, gravity: 5.8265 },
  gm_ball_mini:  { jumpForce: 54.4423, gravity: 4.9866 },
  gm_ufo:        { jumpForce: 35.4571, gravity: 6.5743 },
  gm_ufo_mini:   { jumpForce: 44.2907, gravity: 6.6436 },
  gm_robot:      { jumpForce: 84.1490, gravity: 10.3433, maxHold: 0.273 },
  gm_robot_mini: { jumpForce: 84.1490, gravity: 8.2396, maxHold: 0.278 },
  gm_wave:       { jumpForce: 0, gravity: 0, angle: 45, vyRatio: 1 },
  gm_wave_mini:  { jumpForce: 0, gravity: 0, angle: 63.43, vyRatio: 2 },
};

export interface SpeedInfo {
  multiplier: string;
  unitsPerSec: number;
  blocksPerSec: number;
}

export const SPEED_DATA: Record<string, SpeedInfo> = {
  speed_slow:   { multiplier: "0.8x", unitsPerSec: 251.25, blocksPerSec: 6.8 },
  speed_normal: { multiplier: "1x",   unitsPerSec: 311.58, blocksPerSec: 8.5 },
  speed_fast:   { multiplier: "1.25x", unitsPerSec: 387.42, blocksPerSec: 10.6 },
  speed_vfast:  { multiplier: "1.6x", unitsPerSec: 468.00, blocksPerSec: 13.6 },
  speed_sfast:  { multiplier: "2x",   unitsPerSec: 576.00, blocksPerSec: 17 },
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
  gm_cube:       { label: "Cube",      color: "#22d3ee", render: drawCubeMode },
  gm_cube_mini:  { label: "Cube M",    color: "#22d3ee", render: drawCubeModeMini },
  gm_ball:       { label: "Ball",      color: "#f97316", render: drawBallMode },
  gm_ball_mini:  { label: "Ball M",    color: "#f97316", render: drawBallModeMini },
  gm_ufo:        { label: "UFO",       color: "#a78bfa", render: drawUfoMode },
  gm_ufo_mini:   { label: "UFO M",     color: "#a78bfa", render: drawUfoModeMini },
  gm_robot:      { label: "Robot",     color: "#6ee7b7", render: drawRobotMode },
  gm_robot_mini: { label: "Robot M",   color: "#6ee7b7", render: drawRobotModeMini },
  gm_wave:       { label: "Wave",      color: "#facc15", render: drawWaveMode },
  gm_wave_mini:  { label: "Wave M",    color: "#facc15", render: drawWaveModeMini },
  orb_dash_green: { label: "Dash G",   color: "#4ade80", render: drawOrbDashGreen },
  orb_dash_pink:  { label: "Dash P",   color: "#f472b6", render: drawOrbDashPink },
  orb_spider:     { label: "Spider",   color: "#6b7280", render: drawOrbSpider },
};

export const BUILTIN_TYPES: BuiltinObjectType[] = [
  "block", "spike", "platform", "portal", "coin", "ring", "orb",
  "speed_slow", "speed_normal", "speed_fast", "speed_vfast", "speed_sfast",
  "gm_cube", "gm_cube_mini", "gm_ball", "gm_ball_mini",
  "gm_ufo", "gm_ufo_mini", "gm_robot", "gm_robot_mini",
  "gm_wave", "gm_wave_mini",
  "orb_dash_green", "orb_dash_pink", "orb_spider",
];

export const TOOLBAR_GROUPS: { label: string; items: ToolType[] }[] = [
  { label: "Objects", items: ["block", "spike", "platform", "portal", "coin", "ring"] },
  { label: "Orbs", items: ["orb", "orb_dash_green", "orb_dash_pink", "orb_spider"] },
  { label: "Speed", items: ["speed_slow", "speed_normal", "speed_fast", "speed_vfast", "speed_sfast"] },
  { label: "Gamemode", items: ["gm_cube", "gm_cube_mini", "gm_ball", "gm_ball_mini", "gm_ufo", "gm_ufo_mini", "gm_robot", "gm_robot_mini", "gm_wave", "gm_wave_mini"] },
  { label: "", items: ["eraser"] },
];

export const TOOLBAR_ITEMS: ToolType[] = TOOLBAR_GROUPS.flatMap((g) => g.items);

export function isBuiltinType(type: string): type is BuiltinObjectType {
  return type in OBJECT_DEFS;
}
