import { useRef, useEffect, useCallback, useState } from "react";
import type { LevelObject, ToolType, CustomImage } from "../types";
import { OBJECT_DEFS, isBuiltinType } from "../objectDefs";

const TILE_SIZE = 40;
const GRID_COLS = 600;
const GRID_ROWS = 10;
const HEADER_HEIGHT = 24;

const GAMEMODE_TYPES = new Set<string>([
  "gm_cube", "gm_wave", "gm_wave_mini",
]);

const SPEED_TYPES = new Set<string>([
  "speed_slow", "speed_normal", "speed_fast", "speed_vfast", "speed_sfast",
]);

type GamemodeKind = "cube" | "wave";

const GAMEMODE_KIND_MAP: Record<string, GamemodeKind> = {
  gm_cube: "cube",
  gm_wave: "wave",
  gm_wave_mini: "wave",
};

const GAMEMODE_COLORS: Record<GamemodeKind, string> = {
  cube: "#22d3ee",
  wave: "#facc15",
};

const GAMEMODE_ICONS: Record<GamemodeKind, string> = {
  cube: "\u25A0",
  wave: "\u2215",
};

const SPEED_COLOR_MAP: Record<string, string> = {
  speed_slow: "#3b82f6",
  speed_normal: "#22c55e",
  speed_fast: "#f59e0b",
  speed_vfast: "#ef4444",
  speed_sfast: "#a855f7",
};

const SPEED_LABEL_MAP: Record<string, string> = {
  speed_slow: "0.8x",
  speed_normal: "1x",
  speed_fast: "1.25x",
  speed_vfast: "1.6x",
  speed_sfast: "2x",
};

interface LevelEditorProps {
  selectedTool: ToolType;
  objects: LevelObject[];
  onObjectsChange: (objects: LevelObject[]) => void;
  customImages: CustomImage[];
  syncTime: boolean;
  currentMusicTime: number;
  currentRotation: number;
  currentScale: number;
}

function formatTimeBadge(t: number): string {
  const s = Math.floor(t);
  const ms = Math.floor((t % 1) * 10);
  return `${s}.${ms}s`;
}

interface ZoneInfo {
  gamemode: GamemodeKind;
  isMini: boolean;
  speed: string;
}

function computeZones(objects: LevelObject[]): ZoneInfo[] {
  const zones: ZoneInfo[] = Array.from({ length: GRID_COLS }, () => ({
    gamemode: "cube" as GamemodeKind,
    isMini: false,
    speed: "speed_normal",
  }));

  const portalsByCol: { col: number; type: string }[] = [];
  for (const obj of objects) {
    if (GAMEMODE_TYPES.has(obj.type) || SPEED_TYPES.has(obj.type)) {
      portalsByCol.push({ col: obj.x, type: obj.type });
    }
  }
  portalsByCol.sort((a, b) => a.col - b.col);

  let currentGamemode: GamemodeKind = "cube";
  let currentMini = false;
  let currentSpeed = "speed_normal";

  let portalIdx = 0;

  for (let col = 0; col < GRID_COLS; col++) {
    while (portalIdx < portalsByCol.length && portalsByCol[portalIdx].col === col) {
      const p = portalsByCol[portalIdx];
      if (GAMEMODE_TYPES.has(p.type)) {
        currentGamemode = GAMEMODE_KIND_MAP[p.type];
        currentMini = p.type.endsWith("_mini");
      } else if (SPEED_TYPES.has(p.type)) {
        currentSpeed = p.type;
      }
      portalIdx++;
    }
    zones[col] = { gamemode: currentGamemode, isMini: currentMini, speed: currentSpeed };
  }

  return zones;
}

function renderWithRotation(
  ctx: CanvasRenderingContext2D,
  px: number, py: number, size: number,
  rotation: number,
  renderFn: (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => void
) {
  if (!rotation) {
    renderFn(ctx, px, py, size);
    return;
  }
  const cx = px + size / 2;
  const cy = py + size / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-cx, -cy);
  renderFn(ctx, px, py, size);
  ctx.restore();
}

export function LevelEditor({
  selectedTool,
  objects,
  onObjectsChange,
  customImages,
  syncTime,
  currentMusicTime,
  currentRotation,
  currentScale,
}: LevelEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const [hoverCell, setHoverCell] = useState<{ col: number; row: number } | null>(null);

  const customImageMap = useCallback(() => {
    const map = new Map<string, CustomImage>();
    for (const img of customImages) {
      map.set(img.id, img);
    }
    return map;
  }, [customImages]);

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const w = GRID_COLS * TILE_SIZE;
      const totalH = HEADER_HEIGHT + GRID_ROWS * TILE_SIZE;
      const imgMap = customImageMap();

      ctx.clearRect(0, 0, w, totalH);

      const zones = computeZones(objects);

      ctx.fillStyle = "#0d0d1a";
      ctx.fillRect(0, 0, w, HEADER_HEIGHT);

      const gmStripH = 14;
      const speedStripH = HEADER_HEIGHT - gmStripH;

      let prevGM: GamemodeKind | null = null;
      let prevMini: boolean | null = null;
      let zoneStartCol = 0;

      const drawGmZone = (startCol: number, endCol: number, gm: GamemodeKind, mini: boolean) => {
        const x1 = startCol * TILE_SIZE;
        const x2 = endCol * TILE_SIZE;
        const color = GAMEMODE_COLORS[gm];
        ctx.fillStyle = color + "25";
        ctx.fillRect(x1, 0, x2 - x1, gmStripH);
        ctx.fillStyle = color + "60";
        ctx.fillRect(x1, gmStripH - 1, x2 - x1, 1);

        const zoneMidX = (x1 + x2) / 2;
        const zoneW = x2 - x1;
        if (zoneW > 30) {
          ctx.font = "bold 8px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = color;
          const label = GAMEMODE_ICONS[gm] + " " + gm.toUpperCase() + (mini ? " m" : "");
          ctx.fillText(label, zoneMidX, gmStripH / 2);
        }

        if (startCol > 0) {
          ctx.strokeStyle = color + "80";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x1 + 0.5, 0);
          ctx.lineTo(x1 + 0.5, gmStripH);
          ctx.stroke();
        }
      };

      for (let col = 0; col < GRID_COLS; col++) {
        const z = zones[col];
        if (prevGM === null) {
          prevGM = z.gamemode;
          prevMini = z.isMini;
          zoneStartCol = col;
        } else if (z.gamemode !== prevGM || z.isMini !== prevMini) {
          drawGmZone(zoneStartCol, col, prevGM, prevMini!);
          prevGM = z.gamemode;
          prevMini = z.isMini;
          zoneStartCol = col;
        }
      }
      if (prevGM !== null) {
        drawGmZone(zoneStartCol, GRID_COLS, prevGM, prevMini!);
      }

      let prevSpeed: string | null = null;
      let speedStartCol = 0;

      const drawSpeedZone = (startCol: number, endCol: number, speed: string) => {
        const x1 = startCol * TILE_SIZE;
        const x2 = endCol * TILE_SIZE;
        const color = SPEED_COLOR_MAP[speed] ?? "#22c55e";
        ctx.fillStyle = color + "20";
        ctx.fillRect(x1, gmStripH, x2 - x1, speedStripH);

        const zoneMidX = (x1 + x2) / 2;
        const zoneW = x2 - x1;
        if (zoneW > 24) {
          ctx.font = "bold 7px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = color + "cc";
          ctx.fillText(SPEED_LABEL_MAP[speed] ?? "1x", zoneMidX, gmStripH + speedStripH / 2);
        }

        if (startCol > 0) {
          ctx.strokeStyle = color + "60";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x1 + 0.5, gmStripH);
          ctx.lineTo(x1 + 0.5, HEADER_HEIGHT);
          ctx.stroke();
        }
      };

      for (let col = 0; col < GRID_COLS; col++) {
        const z = zones[col];
        if (prevSpeed === null) {
          prevSpeed = z.speed;
          speedStartCol = col;
        } else if (z.speed !== prevSpeed) {
          drawSpeedZone(speedStartCol, col, prevSpeed);
          prevSpeed = z.speed;
          speedStartCol = col;
        }
      }
      if (prevSpeed !== null) {
        drawSpeedZone(speedStartCol, GRID_COLS, prevSpeed);
      }

      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, HEADER_HEIGHT + 0.5);
      ctx.lineTo(w, HEADER_HEIGHT + 0.5);
      ctx.stroke();

      const oY = HEADER_HEIGHT;

      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, oY, w, GRID_ROWS * TILE_SIZE);

      for (let col = 0; col < GRID_COLS; col++) {
        const z = zones[col];
        const color = GAMEMODE_COLORS[z.gamemode];
        ctx.fillStyle = color + "08";
        ctx.fillRect(col * TILE_SIZE, oY, TILE_SIZE, GRID_ROWS * TILE_SIZE);
      }

      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 0.5;
      for (let c = 0; c <= GRID_COLS; c++) {
        const isMajor = c % 5 === 0;
        ctx.strokeStyle = isMajor ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)";
        ctx.lineWidth = isMajor ? 1 : 0.5;
        ctx.beginPath();
        ctx.moveTo(c * TILE_SIZE + 0.5, oY);
        ctx.lineTo(c * TILE_SIZE + 0.5, oY + GRID_ROWS * TILE_SIZE);
        ctx.stroke();
      }
      for (let r = 0; r <= GRID_ROWS; r++) {
        const isMajor = r % 5 === 0;
        ctx.strokeStyle = isMajor ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)";
        ctx.lineWidth = isMajor ? 1 : 0.5;
        ctx.beginPath();
        ctx.moveTo(0, oY + r * TILE_SIZE + 0.5);
        ctx.lineTo(w, oY + r * TILE_SIZE + 0.5);
        ctx.stroke();
      }

      for (const obj of objects) {
        const sc = obj.scale ?? 1;
        const cx = obj.x * TILE_SIZE + TILE_SIZE / 2;
        const cy = oY + obj.y * TILE_SIZE + TILE_SIZE / 2;
        const rot = obj.rotation ?? 0;

        ctx.save();
        ctx.translate(cx, cy);
        if (rot) ctx.rotate((rot * Math.PI) / 180);
        if (sc !== 1) ctx.scale(sc, sc);
        ctx.translate(-TILE_SIZE / 2, -TILE_SIZE / 2);

        if (isBuiltinType(obj.type)) {
          const def = OBJECT_DEFS[obj.type];
          def.render(ctx, 0, 0, TILE_SIZE);
        } else {
          const custom = imgMap.get(obj.type);
          if (custom) {
            ctx.drawImage(custom.image, 0, 0, TILE_SIZE, TILE_SIZE);
          } else {
            ctx.fillStyle = "rgba(255,0,255,0.3)";
            ctx.fillRect(1, 1, TILE_SIZE - 2, TILE_SIZE - 2);
            ctx.fillStyle = "#fff";
            ctx.font = "8px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("?", TILE_SIZE / 2, TILE_SIZE / 2);
          }
        }
        ctx.restore();

        if (obj.time !== undefined) {
          const label = formatTimeBadge(obj.time);
          ctx.font = "bold 7px monospace";
          const tw = ctx.measureText(label).width + 4;
          const badgePx = obj.x * TILE_SIZE;
          const badgePy = oY + obj.y * TILE_SIZE;
          const bx = badgePx + TILE_SIZE - tw - 1;
          const by = badgePy + 1;
          ctx.fillStyle = "rgba(124,58,237,0.85)";
          ctx.beginPath();
          ctx.roundRect(bx, by, tw, 10, 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, bx + tw / 2, by + 5);
        }
      }

      if (hoverCell) {
        const { col, row } = hoverCell;
        const hx = col * TILE_SIZE;
        const hy = oY + row * TILE_SIZE;

        if (selectedTool === "eraser") {
          ctx.fillStyle = "rgba(239,68,68,0.25)";
          ctx.fillRect(hx, hy, TILE_SIZE, TILE_SIZE);
        } else if (isBuiltinType(selectedTool)) {
          const def = OBJECT_DEFS[selectedTool];
          ctx.fillStyle = `${def.color}44`;
          ctx.fillRect(hx, hy, TILE_SIZE, TILE_SIZE);
          ctx.globalAlpha = 0.5;
          renderWithRotation(ctx, hx, hy, TILE_SIZE, currentRotation, def.render);
          ctx.globalAlpha = 1;
        } else {
          const custom = imgMap.get(selectedTool);
          if (custom) {
            ctx.fillStyle = "rgba(167,139,250,0.2)";
            ctx.fillRect(hx, hy, TILE_SIZE, TILE_SIZE);
            ctx.globalAlpha = 0.5;
            ctx.drawImage(custom.image, hx, hy, TILE_SIZE, TILE_SIZE);
            ctx.globalAlpha = 1;
          }
        }
      }
    },
    [objects, hoverCell, selectedTool, customImageMap, currentRotation]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawGrid(ctx);
  }, [drawGrid]);

  const cellFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const row = Math.floor((py - HEADER_HEIGHT) / TILE_SIZE);
    const col = Math.floor(px / TILE_SIZE);
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return null;
    return { col, row };
  };

  const applyTool = useCallback(
    (col: number, row: number) => {
      if (selectedTool === "eraser") {
        onObjectsChange(objects.filter((o) => !(o.x === col && o.y === row)));
        return;
      }
      const exists = objects.some((o) => o.x === col && o.y === row);
      if (!exists) {
        const newObj: LevelObject = { x: col, y: row, type: selectedTool };
        if (currentRotation) {
          newObj.rotation = currentRotation;
        }
        if (currentScale !== 1) {
          newObj.scale = currentScale;
        }
        if (syncTime) {
          newObj.time = Math.round(currentMusicTime * 100) / 100;
        }
        onObjectsChange([...objects, newObj]);
      }
    },
    [selectedTool, objects, onObjectsChange, syncTime, currentMusicTime, currentRotation, currentScale]
  );

  const deleteAt = useCallback(
    (col: number, row: number) => {
      onObjectsChange(objects.filter((o) => !(o.x === col && o.y === row)));
    },
    [objects, onObjectsChange]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2) {
      const cell = cellFromEvent(e);
      if (cell) deleteAt(cell.col, cell.row);
      return;
    }
    if (e.button !== 0) return;
    isDrawing.current = true;
    const cell = cellFromEvent(e);
    if (cell) applyTool(cell.col, cell.row);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = cellFromEvent(e);
    setHoverCell(cell);
    if (isDrawing.current && cell) {
      applyTool(cell.col, cell.row);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleMouseLeave = () => {
    isDrawing.current = false;
    setHoverCell(null);
  };

  return (
    <div
      ref={containerRef}
      className="overflow-auto rounded-lg border border-white/10 shadow-2xl"
      style={{ maxWidth: "100%", maxHeight: "calc(100vh - 180px)" }}
    >
      <canvas
        ref={canvasRef}
        width={GRID_COLS * TILE_SIZE}
        height={HEADER_HEIGHT + GRID_ROWS * TILE_SIZE}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        style={{ display: "block", cursor: selectedTool === "eraser" ? "crosshair" : "cell" }}
      />
    </div>
  );
}
