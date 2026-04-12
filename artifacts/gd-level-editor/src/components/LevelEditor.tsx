import { useRef, useEffect, useCallback, useState } from "react";
import type { LevelObject, ObjectType } from "../types";
import { OBJECT_DEFS } from "../objectDefs";

const TILE_SIZE = 32;
const GRID_COLS = 60;
const GRID_ROWS = 20;

interface LevelEditorProps {
  selectedTool: ObjectType;
  objects: LevelObject[];
  onObjectsChange: (objects: LevelObject[]) => void;
}

export function LevelEditor({ selectedTool, objects, onObjectsChange }: LevelEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const [hoverCell, setHoverCell] = useState<{ col: number; row: number } | null>(null);

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const w = GRID_COLS * TILE_SIZE;
      const h = GRID_ROWS * TILE_SIZE;

      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 0.5;
      for (let c = 0; c <= GRID_COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * TILE_SIZE, 0);
        ctx.lineTo(c * TILE_SIZE, h);
        ctx.stroke();
      }
      for (let r = 0; r <= GRID_ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * TILE_SIZE);
        ctx.lineTo(w, r * TILE_SIZE);
        ctx.stroke();
      }

      for (const obj of objects) {
        const def = OBJECT_DEFS[obj.type];
        def.render(ctx, obj.x * TILE_SIZE, obj.y * TILE_SIZE, TILE_SIZE);
      }

      if (hoverCell) {
        const { col, row } = hoverCell;
        if (selectedTool === "eraser") {
          ctx.fillStyle = "rgba(239,68,68,0.25)";
        } else {
          const def = OBJECT_DEFS[selectedTool as Exclude<ObjectType, "eraser">];
          ctx.fillStyle = `${def.color}44`;
        }
        ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        if (selectedTool !== "eraser") {
          const def = OBJECT_DEFS[selectedTool as Exclude<ObjectType, "eraser">];
          ctx.globalAlpha = 0.5;
          def.render(ctx, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE);
          ctx.globalAlpha = 1;
        }
      }
    },
    [objects, hoverCell, selectedTool]
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
          { x: col, y: row, type: selectedTool as Exclude<ObjectType, "eraser"> },
        ]);
      }
    },
    [selectedTool, objects, onObjectsChange]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    isDrawing.current = true;
    const cell = cellFromEvent(e);
    if (cell) applyTool(cell.col, cell.row);
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
        style={{ display: "block", cursor: selectedTool === "eraser" ? "crosshair" : "cell" }}
      />
    </div>
  );
}
