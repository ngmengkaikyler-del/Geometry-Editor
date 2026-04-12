import { useRef, useEffect, useCallback } from "react";
import type { LevelObject, CustomImage } from "../types";
import { OBJECT_DEFS, isBuiltinType } from "../objectDefs";
import type { GameState, PlayableMode } from "../lib/gameEngine";
import { TILE, COLS, ROWS, PLAYER_W, PLAYER_H, PLAYER_OFFSET, stepGame, createInitialState, VIEWPORT_W, VIEWPORT_H } from "../lib/gameEngine";

interface GameRendererProps {
  objects: LevelObject[];
  customImages: CustomImage[];
  startMode: PlayableMode;
  onStop: () => void;
}

const MODE_COLORS: Record<PlayableMode, string> = {
  cube: "#22d3ee",
  ship: "#a78bfa",
  spider: "#6b7280",
  wave: "#facc15",
};

const MODE_SHAPES: Record<PlayableMode, string> = {
  cube: "square",
  ship: "triangle",
  spider: "diamond",
  wave: "slash",
};

const GROUND_COLOR = "#1e3a5f";
const GROUND_LINE_COLOR = "#4a90d9";

export function GameRenderer({ objects, customImages, startMode, onStop }: GameRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState(startMode));
  const holdingRef = useRef(false);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const deathTimeRef = useRef<number>(0);
  const attemptsRef = useRef(1);

  const restart = useCallback(() => {
    stateRef.current = createInitialState(startMode);
    holdingRef.current = false;
    lastTimeRef.current = 0;
    deathTimeRef.current = 0;
    attemptsRef.current++;
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
  }, [startMode]);

  const drawPlayer = useCallback((ctx: CanvasRenderingContext2D, p: GameState["player"], camX: number) => {
    const screenX = p.worldX - camX;
    const sy = p.y;
    const color = MODE_COLORS[p.mode];
    const px = screenX + PLAYER_OFFSET;
    const py = sy + PLAYER_OFFSET;

    ctx.save();

    const rotation = (p.mode === "cube" && !p.grounded) ? (p.vy * 0.003) : 0;

    if (rotation !== 0) {
      const cx = px + PLAYER_W / 2;
      const cy = py + PLAYER_H / 2;
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.translate(-cx, -cy);
    }

    ctx.fillStyle = color;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;

    switch (MODE_SHAPES[p.mode]) {
      case "square":
        ctx.fillRect(px, py, PLAYER_W, PLAYER_H);
        ctx.strokeRect(px, py, PLAYER_W, PLAYER_H);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(px + PLAYER_W * 0.3, py + PLAYER_W * 0.25, PLAYER_W * 0.4, PLAYER_H * 0.35);
        break;
      case "triangle": {
        ctx.beginPath();
        ctx.moveTo(px + PLAYER_W, py + PLAYER_H * 0.5);
        ctx.lineTo(px, py + PLAYER_H);
        ctx.lineTo(px, py);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case "diamond": {
        const cx = px + PLAYER_W / 2;
        const cy = py + PLAYER_H / 2;
        ctx.beginPath();
        ctx.moveTo(cx, py);
        ctx.lineTo(px + PLAYER_W, cy);
        ctx.lineTo(cx, py + PLAYER_H);
        ctx.lineTo(px, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case "slash": {
        ctx.beginPath();
        ctx.moveTo(px, py + PLAYER_H);
        ctx.lineTo(px + PLAYER_W, py);
        ctx.lineWidth = 4;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillRect(px + PLAYER_W * 0.2, py + PLAYER_H * 0.2, PLAYER_W * 0.6, PLAYER_H * 0.6);
        ctx.strokeRect(px + PLAYER_W * 0.2, py + PLAYER_H * 0.2, PLAYER_W * 0.6, PLAYER_H * 0.6);
        break;
      }
    }

    ctx.restore();
  }, []);

  const drawLevel = useCallback((ctx: CanvasRenderingContext2D, camX: number) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const imgMap = imgMapRef.current;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#0a0a1a");
    grad.addColorStop(0.6, "#0d1025");
    grad.addColorStop(1, "#111833");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const startCol = Math.max(0, Math.floor(camX / TILE));
    const endCol = Math.min(COLS, Math.ceil((camX + w) / TILE) + 1);

    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 0.5;
    for (let c = startCol; c <= endCol; c++) {
      const sx = c * TILE - camX;
      ctx.beginPath();
      ctx.moveTo(sx + 0.5, 0);
      ctx.lineTo(sx + 0.5, h);
      ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * TILE + 0.5);
      ctx.lineTo(w, r * TILE + 0.5);
      ctx.stroke();
    }

    const groundY = (ROWS - 1) * TILE;
    ctx.fillStyle = GROUND_COLOR;
    ctx.fillRect(0, groundY, w, TILE);
    ctx.fillStyle = GROUND_LINE_COLOR;
    ctx.fillRect(0, groundY, w, 2);

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
        drawLevel(ctx, camX);
        drawPlayer(ctx, p, camX);

        const progress = Math.min(100, (camX / (COLS * TILE - VIEWPORT_W)) * 100);

        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, 180, 56);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        const modeLabel = p.mode.toUpperCase();
        const color = MODE_COLORS[p.mode];
        ctx.fillStyle = color;
        ctx.fillText(`${modeLabel}`, 8, 6);
        ctx.fillStyle = "#9ca3af";
        ctx.fillText(`${p.speedMultiplier.toFixed(1)}x  ${stateRef.current.elapsed.toFixed(1)}s`, 8, 20);
        ctx.fillText(`Att: ${attemptsRef.current}  ${progress.toFixed(0)}%`, 8, 34);

        const barY = 48;
        const barW = 164;
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(8, barY, barW, 4);
        ctx.fillStyle = "#4ade80";
        ctx.fillRect(8, barY, barW * (progress / 100), 4);

        if (p.dead) {
          if (deathTimeRef.current === 0) {
            deathTimeRef.current = time;
          }
          const deathElapsed = (time - deathTimeRef.current) / 1000;
          const flashAlpha = Math.min(0.7, deathElapsed * 3);

          ctx.fillStyle = `rgba(239,68,68,${flashAlpha})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          if (deathElapsed > 0.15) {
            ctx.fillStyle = "#fff";
            ctx.font = "bold 28px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("DEAD", canvas.width / 2, canvas.height / 2 - 14);
            ctx.font = "12px monospace";
            ctx.fillStyle = "#fca5a5";
            ctx.fillText(`Attempt ${attemptsRef.current}`, canvas.width / 2, canvas.height / 2 + 12);
          }

          if (deathElapsed > 0.6) {
            restart();
          }
        }

        if (p.won) {
          ctx.fillStyle = "rgba(34,197,94,0.7)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 32px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("LEVEL COMPLETE!", canvas.width / 2, canvas.height / 2 - 20);
          ctx.font = "14px monospace";
          ctx.fillStyle = "#bbf7d0";
          ctx.fillText(`Time: ${stateRef.current.elapsed.toFixed(2)}s  Attempts: ${attemptsRef.current}`, canvas.width / 2, canvas.height / 2 + 15);
          ctx.fillText("Esc to return to editor", canvas.width / 2, canvas.height / 2 + 35);
        }

        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.font = "9px monospace";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText("ESC=edit  R=restart  Space/Click=jump", canvas.width - 8, 6);
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
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
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
          background: "#0a0a1a",
          borderRadius: "4px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />
    </div>
  );
}
