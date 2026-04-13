import { useRef, useEffect, useCallback } from "react";
import type { LevelObject, CustomImage } from "../types";
import { OBJECT_DEFS, isBuiltinType } from "../objectDefs";
import type { GameState, PlayableMode } from "../lib/gameEngine";
import { TILE, ROWS, PLAYER_W, PLAYER_H, PLAYER_OFFSET, stepGame, createInitialState, computeLevelWidth, VIEWPORT_W, VIEWPORT_H } from "../lib/gameEngine";

interface GameRendererProps {
  objects: LevelObject[];
  customImages: CustomImage[];
  startMode: PlayableMode;
  onStop: () => void;
}

const MODE_COLORS: Record<PlayableMode, string> = {
  cube: "#40e0d0",
  ship: "#a78bfa",
  spider: "#9ca3af",
  wave: "#facc15",
};

const MODE_SHAPES: Record<PlayableMode, string> = {
  cube: "square",
  ship: "triangle",
  spider: "diamond",
  wave: "slash",
};

const BG_COLOR_TOP = "#2d0a1e";
const BG_COLOR_MID = "#4a0e2e";
const BG_COLOR_BOT = "#6b1040";
const GROUND_DARK = "#1a0612";
const GROUND_LIGHT = "#2a0c1e";
const GROUND_TOP_LINE = "#e84393";

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  speed: number;
}

function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * 3000,
      y: Math.random() * VIEWPORT_H * 0.85,
      size: Math.random() * 1.5 + 0.5,
      brightness: Math.random() * 0.4 + 0.1,
      speed: Math.random() * 0.3 + 0.1,
    });
  }
  return stars;
}

export function GameRenderer({ objects, customImages, startMode, onStop }: GameRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState(startMode));
  const holdingRef = useRef(false);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const deathTimeRef = useRef<number>(0);
  const attemptsRef = useRef(1);
  const starsRef = useRef<Star[]>(generateStars(80));
  const trailRef = useRef<{x: number; y: number}[]>([]);
  const attemptFlashRef = useRef<number>(0);
  const levelWidthRef = useRef<number>(computeLevelWidth(objects));

  useEffect(() => {
    levelWidthRef.current = computeLevelWidth(objects);
  }, [objects]);

  const restart = useCallback(() => {
    stateRef.current = createInitialState(startMode);
    holdingRef.current = false;
    lastTimeRef.current = 0;
    deathTimeRef.current = 0;
    attemptsRef.current++;
    trailRef.current = [];
    attemptFlashRef.current = performance.now();
  }, [startMode]);

  const imgMapRef = useRef<Map<string, CustomImage>>(new Map());
  useEffect(() => {
    const map = new Map<string, CustomImage>();
    for (const img of customImages) map.set(img.id, img);
    imgMapRef.current = map;
  }, [customImages]);

  useEffect(() => {
    stateRef.current = createInitialState(startMode);
    holdingRef.current = false;
    lastTimeRef.current = 0;
    attemptFlashRef.current = performance.now();
    trailRef.current = [];
  }, [startMode]);

  const drawPlayer = useCallback((ctx: CanvasRenderingContext2D, p: GameState["player"], camX: number) => {
    const screenX = p.worldX - camX;
    const sy = p.y;
    const color = MODE_COLORS[p.mode];
    const px = screenX + PLAYER_OFFSET;
    const py = sy + PLAYER_OFFSET;
    const cx = px + PLAYER_W / 2;
    const cy = py + PLAYER_H / 2;

    const trail = trailRef.current;
    const worldCx = p.worldX + PLAYER_OFFSET + PLAYER_W / 2;
    trail.push({ x: worldCx, y: cy });
    const maxTrailLen = p.mode === "wave" ? 120 : 12;
    while (trail.length > maxTrailLen) trail.shift();

    if (p.mode === "wave" && trail.length >= 2) {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        const t0 = trail[0];
        ctx.moveTo(t0.x - camX, t0.y);
        for (let i = 1; i < trail.length; i++) {
          const t = trail[i];
          ctx.lineTo(t.x - camX, t.y);
        }

        if (pass === 0) {
          ctx.strokeStyle = color + "30";
          ctx.lineWidth = 8;
          ctx.shadowColor = color;
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }
      ctx.restore();
    } else if (trail.length >= 2) {
      for (let i = 0; i < trail.length - 1; i++) {
        const t = trail[i];
        const alpha = (i / trail.length) * 0.3;
        ctx.fillStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, "0")}`;
        const sz = PLAYER_W * 0.4 * (i / trail.length);
        const sx = t.x - camX;
        ctx.fillRect(sx - sz / 2, t.y - sz / 2, sz, sz);
      }
    }

    ctx.save();

    const rotation = p.rotation;
    if (rotation !== 0) {
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.translate(-cx, -cy);
    }

    switch (MODE_SHAPES[p.mode]) {
      case "square": {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = color;
        ctx.fillRect(px, py, PLAYER_W, PLAYER_H);
        ctx.shadowBlur = 0;

        const darker = shadeColor(color, -30);
        ctx.fillStyle = darker;
        ctx.fillRect(px + 2, py + 2, PLAYER_W - 4, PLAYER_H - 4);
        ctx.fillStyle = color;
        ctx.fillRect(px + 3, py + 3, PLAYER_W - 6, PLAYER_H - 6);

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 1, py + 1, PLAYER_W - 2, PLAYER_H - 2);

        ctx.fillStyle = "rgba(255,255,255,0.85)";
        const iconSize = PLAYER_W * 0.35;
        const iconX = cx - iconSize / 2;
        const iconY = cy - iconSize / 2;
        ctx.fillRect(iconX, iconY, iconSize, iconSize);
        ctx.fillStyle = color;
        const innerSize = iconSize * 0.5;
        ctx.fillRect(cx - innerSize / 2, cy - innerSize / 2, innerSize, innerSize);
        break;
      }
      case "triangle": {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(px + PLAYER_W, cy);
        ctx.lineTo(px, py + PLAYER_H);
        ctx.lineTo(px, py);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
      }
      case "diamond": {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(cx, py);
        ctx.lineTo(px + PLAYER_W, cy);
        ctx.lineTo(cx, py + PLAYER_H);
        ctx.lineTo(px, cy);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
      }
      case "slash": {
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(px, py + PLAYER_H);
        ctx.lineTo(px + PLAYER_W * 0.3, py + PLAYER_H);
        ctx.lineTo(px + PLAYER_W, py);
        ctx.lineTo(px + PLAYER_W * 0.7, py);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
      }
    }

    ctx.restore();
  }, []);

  const drawLevel = useCallback((ctx: CanvasRenderingContext2D, camX: number, time: number) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const imgMap = imgMapRef.current;
    const groundY = (ROWS - 1) * TILE;

    const grad = ctx.createLinearGradient(0, 0, 0, groundY);
    grad.addColorStop(0, BG_COLOR_TOP);
    grad.addColorStop(0.5, BG_COLOR_MID);
    grad.addColorStop(1, BG_COLOR_BOT);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, groundY);

    const stars = starsRef.current;
    for (const star of stars) {
      const sx = ((star.x - camX * star.speed) % (w + 20) + w + 20) % (w + 20);
      const twinkle = 0.5 + 0.5 * Math.sin(time * 0.001 * star.speed + star.x);
      const alpha = star.brightness * twinkle;
      ctx.fillStyle = `rgba(255,182,216,${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    const levelW = levelWidthRef.current;
    const maxCol = Math.ceil(levelW / TILE) + 1;
    const startCol = Math.max(0, Math.floor(camX / TILE));
    const endCol = Math.min(maxCol, Math.ceil((camX + w) / TILE) + 1);

    for (let c = startCol; c <= endCol; c++) {
      const gx = c * TILE - camX;
      const isEven = c % 2 === 0;
      ctx.fillStyle = isEven ? GROUND_DARK : GROUND_LIGHT;
      ctx.fillRect(gx, groundY, TILE, TILE);

      ctx.strokeStyle = "rgba(255,105,180,0.06)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(gx, groundY, TILE, TILE);
    }

    ctx.fillStyle = GROUND_TOP_LINE;
    ctx.fillRect(0, groundY, w, 2);
    ctx.fillStyle = "rgba(232,67,147,0.3)";
    ctx.fillRect(0, groundY + 2, w, 1);

    ctx.fillStyle = GROUND_DARK;
    ctx.fillRect(0, groundY + TILE, w, h - groundY - TILE);

    ctx.strokeStyle = "rgba(255,105,180,0.03)";
    ctx.lineWidth = 0.5;
    for (let c = startCol; c <= endCol; c++) {
      const sx = c * TILE - camX;
      ctx.beginPath();
      ctx.moveTo(sx + 0.5, 0);
      ctx.lineTo(sx + 0.5, groundY);
      ctx.stroke();
    }
    for (let r = 0; r < ROWS - 1; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * TILE + 0.5);
      ctx.lineTo(w, r * TILE + 0.5);
      ctx.stroke();
    }

    for (const obj of objects) {
      const screenObjX = obj.x * TILE - camX;
      const py = obj.y * TILE;
      if (screenObjX < -TILE || screenObjX > w + TILE) continue;

      if (isBuiltinType(obj.type)) {
        OBJECT_DEFS[obj.type].render(ctx, screenObjX, py, TILE);
      } else {
        const custom = imgMap.get(obj.type);
        if (custom) {
          ctx.drawImage(custom.image, screenObjX, py, TILE, TILE);
        }
      }
    }
  }, [objects]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    attemptFlashRef.current = performance.now();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onStop();
        return;
      }
      if (e.key === "r" || e.key === "R") {
        restart();
        return;
      }
      if (e.repeat) return;
      if (e.key === " " || e.key === "ArrowUp" || e.code === "Space") {
        e.preventDefault();
        holdingRef.current = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp" || e.code === "Space") {
        holdingRef.current = false;
      }
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) holdingRef.current = true;
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) holdingRef.current = false;
    };
    const handleTouchStart = () => { holdingRef.current = true; };
    const handleTouchEnd = () => { holdingRef.current = false; };

    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    const loop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      stateRef.current.holding = holdingRef.current;
      stateRef.current = stepGame(stateRef.current, dt, objects);

      const p = stateRef.current.player;
      const camX = stateRef.current.cameraX;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawLevel(ctx, camX, time);
        drawPlayer(ctx, p, camX);

        const lw = levelWidthRef.current;
        const progress = Math.min(100, (camX / Math.max(1, lw - VIEWPORT_W)) * 100);

        const barW = 240;
        const barH = 6;
        const barX = (canvas.width - barW) / 2;
        const barY = 12;

        ctx.fillStyle = "rgba(255,255,255,0.08)";
        roundRect(ctx, barX, barY, barW, barH, 3);
        ctx.fill();

        ctx.fillStyle = "#f472b6";
        if (progress > 0) {
          roundRect(ctx, barX, barY, barW * (progress / 100), barH, 3);
          ctx.fill();
        }

        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(`${progress.toFixed(0)}%`, canvas.width / 2, barY + barH + 4);

        const attemptAge = (time - attemptFlashRef.current) / 1000;
        if (attemptAge < 1.5 && !p.dead) {
          const fadeAlpha = attemptAge < 0.3 ? attemptAge / 0.3 : attemptAge > 1.0 ? 1 - (attemptAge - 1.0) / 0.5 : 1;
          ctx.fillStyle = `rgba(255,255,255,${fadeAlpha * 0.7})`;
          ctx.font = "bold 18px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`Attempt ${attemptsRef.current}`, canvas.width / 2, canvas.height * 0.4);
        }

        if (p.dead) {
          if (deathTimeRef.current === 0) {
            deathTimeRef.current = time;
          }
          const deathElapsed = (time - deathTimeRef.current) / 1000;

          if (deathElapsed < 0.15) {
            ctx.fillStyle = `rgba(255,255,255,${(1 - deathElapsed / 0.15) * 0.8})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          const flashAlpha = Math.min(0.6, deathElapsed * 2);
          ctx.fillStyle = `rgba(180,30,80,${flashAlpha})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          if (deathElapsed > 0.6) {
            restart();
          }
        }

        if (p.won) {
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = "#fff";
          ctx.font = "bold 36px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("Level Complete!", canvas.width / 2, canvas.height / 2 - 30);

          ctx.font = "16px sans-serif";
          ctx.fillStyle = "#f9a8d4";
          ctx.fillText(`${stateRef.current.elapsed.toFixed(2)}s  |  ${attemptsRef.current} attempt${attemptsRef.current > 1 ? "s" : ""}`, canvas.width / 2, canvas.height / 2 + 10);

          ctx.font = "12px sans-serif";
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.fillText("Press Esc to return to editor", canvas.width / 2, canvas.height / 2 + 40);
        }
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [objects, onStop, drawLevel, drawPlayer, startMode, restart]);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", alignItems: "center", justifyContent: "center", background: "#1a0612" }}>
      <canvas
        ref={canvasRef}
        width={VIEWPORT_W}
        height={VIEWPORT_H}
        tabIndex={0}
        style={{
          display: "block",
          width: "100%",
          maxWidth: `${VIEWPORT_W}px`,
          aspectRatio: `${VIEWPORT_W} / ${VIEWPORT_H}`,
          cursor: "pointer",
          outline: "none",
          background: "#2d0a1e",
        }}
      />
    </div>
  );
}

function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
