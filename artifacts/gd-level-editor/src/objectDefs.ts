import type { ObjectDef, BuiltinObjectType, ToolType } from "./types";

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

function drawSpike(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const cx = x + s / 2;
  const tipY = y + 2;
  const baseY = y + s - 1;
  const baseL = x + 4;
  const baseR = x + s - 4;

  const grad = ctx.createLinearGradient(cx, tipY, cx, baseY);
  grad.addColorStop(0, "#ff69b4");
  grad.addColorStop(0.4, "#c2185b");
  grad.addColorStop(1, "#880e4f");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx, tipY);
  ctx.lineTo(baseR, baseY);
  ctx.lineTo(baseL, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#ff69b4";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,105,180,0.3)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx, tipY + s * 0.22);
  ctx.lineTo(x + s * 0.62, baseY - 2);
  ctx.lineTo(x + s * 0.38, baseY - 2);
  ctx.closePath();
  ctx.stroke();
}

function drawSpikeDown(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const cx = x + s / 2;
  const tipY = y + s - 2;
  const baseY = y + 1;
  const baseL = x + 4;
  const baseR = x + s - 4;

  const grad = ctx.createLinearGradient(cx, tipY, cx, baseY);
  grad.addColorStop(0, "#ff69b4");
  grad.addColorStop(0.4, "#c2185b");
  grad.addColorStop(1, "#880e4f");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx, tipY);
  ctx.lineTo(baseR, baseY);
  ctx.lineTo(baseL, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#ff69b4";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,105,180,0.3)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx, tipY - s * 0.22);
  ctx.lineTo(x + s * 0.62, baseY + 2);
  ctx.lineTo(x + s * 0.38, baseY + 2);
  ctx.closePath();
  ctx.stroke();
}

function drawSawblade(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  const r = s / 2 - 2;
  const teeth = 10;

  ctx.fillStyle = "#2a0a1e";
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a1 = (i / teeth) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 0.5) / teeth) * Math.PI * 2 - Math.PI / 2;
    const outerR = r;
    const innerR = r * 0.72;
    if (i === 0) {
      ctx.moveTo(cx + Math.cos(a1) * outerR, cy + Math.sin(a1) * outerR);
    } else {
      ctx.lineTo(cx + Math.cos(a1) * outerR, cy + Math.sin(a1) * outerR);
    }
    ctx.lineTo(cx + Math.cos(a2) * innerR, cy + Math.sin(a2) * innerR);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#e84393";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#e84393";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1a0612";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.09, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(232,67,147,0.2)";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
  ctx.stroke();
}

function drawRing(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  const r = s / 2 - 5;

  ctx.shadowColor = "#00e5ff";
  ctx.shadowBlur = 6;

  ctx.strokeStyle = "#00e5ff";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.shadowBlur = 0;

  ctx.strokeStyle = "rgba(0,229,255,0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(0,229,255,0.08)";
  ctx.beginPath();
  ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
  ctx.fill();
}

function drawOrb(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  const r = s / 2 - 5;

  const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 1, cx, cy, r);
  grad.addColorStop(0, "#fffde0");
  grad.addColorStop(0.3, "#ffd700");
  grad.addColorStop(0.7, "#daa520");
  grad.addColorStop(1, "#8b6914");

  ctx.shadowColor = "#ffd700";
  ctx.shadowBlur = 8;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.15, cy - r * 0.2, r * 0.3, r * 0.2, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpeedPortal(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  color: string, arrows: number, label: string
) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  const r = s / 2 - 2;

  ctx.fillStyle = color + "30";
  ctx.beginPath();
  ctx.moveTo(cx, y + 2);
  ctx.lineTo(x + s - 2, cy);
  ctx.lineTo(cx, y + s - 2);
  ctx.lineTo(x + 2, cy);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#fff";
  const aW = 5;
  const totalW = arrows * aW + (arrows - 1) * 1;
  const startX = cx - totalW / 2;
  for (let i = 0; i < arrows; i++) {
    const ax = startX + i * (aW + 1);
    ctx.beginPath();
    ctx.moveTo(ax + aW, cy);
    ctx.lineTo(ax, cy - 4);
    ctx.lineTo(ax, cy + 4);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `bold ${Math.floor(s * 0.18)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(label, cx, y + s - 11);
}

function drawSpeedSlow(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawSpeedPortal(ctx, x, y, s, "#3b82f6", 1, "0.5x");
}
function drawSpeedNormal(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawSpeedPortal(ctx, x, y, s, "#22c55e", 1, "1x");
}
function drawSpeedFast(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawSpeedPortal(ctx, x, y, s, "#f59e0b", 2, "2x");
}
function drawSpeedVFast(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawSpeedPortal(ctx, x, y, s, "#ef4444", 3, "3x");
}
function drawSpeedSFast(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawSpeedPortal(ctx, x, y, s, "#a855f7", 4, "4x");
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

function drawCubeMode(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawModePortal(ctx, x, y, s, "#22d3ee", "\u25A0", false);
}
function drawWaveMode(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawModePortal(ctx, x, y, s, "#facc15", "\u2215", false);
}
function drawWaveModeMini(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  drawModePortal(ctx, x, y, s, "#facc15", "\u2215", true);
}

export const OBJECT_DEFS: Record<BuiltinObjectType, Omit<ObjectDef, "type">> = {
  block:        { label: "Block",      color: "#d63384", render: drawBlock },
  spike:        { label: "Spike \u25B2",  color: "#ff69b4", render: drawSpike },
  spike_down:   { label: "Spike \u25BC",  color: "#ff69b4", render: drawSpikeDown },
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
  { label: "Walls", items: ["block"] },
  { label: "Hazards", items: ["spike", "spike_down", "sawblade"] },
  { label: "Triggers", items: ["ring", "orb"] },
  { label: "Speed", items: ["speed_slow", "speed_normal", "speed_fast", "speed_vfast", "speed_sfast"] },
  { label: "Mode", items: ["gm_cube", "gm_wave", "gm_wave_mini"] },
  { label: "", items: ["eraser"] },
];

export const TOOLBAR_ITEMS: ToolType[] = TOOLBAR_GROUPS.flatMap((g) => g.items);

export function isBuiltinType(type: string): type is BuiltinObjectType {
  return type in OBJECT_DEFS;
}
