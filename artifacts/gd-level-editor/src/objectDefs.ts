import type { ObjectDef, ObjectType } from "./types";

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

export const OBJECT_DEFS: Record<Exclude<ObjectType, "eraser">, Omit<ObjectDef, "type">> = {
  block:    { label: "Block",    color: "#4a90d9", render: drawBlock },
  spike:    { label: "Spike",    color: "#e74c3c", render: drawSpike },
  platform: { label: "Platform", color: "#27ae60", render: drawPlatform },
  portal:   { label: "Portal",   color: "#7c3aed", render: drawPortal },
  coin:     { label: "Coin",     color: "#f59e0b", render: drawCoin },
  ring:     { label: "Ring",     color: "#f97316", render: drawRing },
  orb:      { label: "Orb",      color: "#16a34a", render: drawOrb },
};

export const TOOLBAR_ITEMS: ObjectType[] = [
  "block", "spike", "platform", "portal", "coin", "ring", "orb", "eraser"
];
