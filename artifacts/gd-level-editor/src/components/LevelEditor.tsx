import { useRef, useEffect, useCallback, useState } from "react";
import type { LevelObject, ToolType, CustomImage } from "../types";
import { OBJECT_DEFS, isBuiltinType } from "../objectDefs";

const TILE_SIZE = 32;
const GRID_COLS = 60;
const GRID_ROWS = 20;

interface LevelEditorProps {
  selectedTool: ToolType;
  objects: LevelObject[];
  onObjectsChange: (objects: LevelObject[]) => void;
  customImages: CustomImage[];
}

export function LevelEditor({ selectedTool, objects, onObjectsChange, customImages }: LevelEditorProps) {
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
      const h = GRID_ROWS * TILE_SIZE;
      const imgMap = customImageMap();

      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 0.5;
      for (let c = 0; c <= GRID_COLS; c++) {
        const isMajor = c % 5 === 0;
        ctx.strokeStyle = isMajor ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)";
        ctx.lineWidth = isMajor ? 1 : 0.5;
        ctx.beginPath();
        ctx.moveTo(c * TILE_SIZE + 0.5, 0);
        ctx.lineTo(c * TILE_SIZE + 0.5, h);
        ctx.stroke();
      }
      for (let r = 0; r <= GRID_ROWS; r++) {
        const isMajor = r % 5 === 0;
        ctx.strokeStyle = isMajor ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)";
        ctx.lineWidth = isMajor ? 1 : 0.5;
        ctx.beginPath();
        ctx.moveTo(0, r * TILE_SIZE + 0.5);
        ctx.lineTo(w, r * TILE_SIZE + 0.5);
        ctx.stroke();
      }

      for (const obj of objects) {
        const px = obj.x * TILE_SIZE;
        const py = obj.y * TILE_SIZE;

        if (isBuiltinType(obj.type)) {
          const def = OBJECT_DEFS[obj.type];
          def.render(ctx, px, py, TILE_SIZE);
        } else {
          const custom = imgMap.get(obj.type);
          if (custom) {
            ctx.drawImage(custom.image, px, py, TILE_SIZE, TILE_SIZE);
          } else {
            ctx.fillStyle = "rgba(255,0,255,0.3)";
            ctx.fillRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            ctx.fillStyle = "#fff";
            ctx.font = "8px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("?", px + TILE_SIZE / 2, py + TILE_SIZE / 2);
          }
        }
      }

      if (hoverCell) {
        const { col, row } = hoverCell;
        const hx = col * TILE_SIZE;
        const hy = row * TILE_SIZE;

        if (selectedTool === "eraser") {
          ctx.fillStyle = "rgba(239,68,68,0.25)";
          ctx.fillRect(hx, hy, TILE_SIZE, TILE_SIZE);
        } else if (isBuiltinType(selectedTool)) {
          const def = OBJECT_DEFS[selectedTool];
          ctx.fillStyle = `${def.color}44`;
          ctx.fillRect(hx, hy, TILE_SIZE, TILE_SIZE);
          ctx.globalAlpha = 0.5;
          def.render(ctx, hx, hy, TILE_SIZE);
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
    [objects, hoverCell, selectedTool, customImageMap]
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
    const col = Math.floor(px / TILE_SIZE);
    const row = Math.floor(py / TILE_SIZE);
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
        onObjectsChange([
          ...objects,
          { x: col, y: row, type: selectedTool },
        ]);
      }
    },
    [selectedTool, objects, onObjectsChange]
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
        height={GRID_ROWS * TILE_SIZE}
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
