import { useState, useCallback } from "react";
import type { LevelObject, ObjectType } from "../types";
import { LevelEditor } from "../components/LevelEditor";
import { Toolbar } from "../components/Toolbar";
import { StatusBar } from "../components/StatusBar";

const HINTS: Record<ObjectType, string> = {
  block: "Click or drag to place blocks",
  spike: "Click or drag to place spikes — they kill the player",
  platform: "Click or drag to place half-height platforms",
  portal: "Click or drag to place mode-swap portals",
  coin: "Click or drag to place collectible coins",
  ring: "Click or drag to place jump rings",
  orb: "Click or drag to place dash orbs",
  eraser: "Click or drag to erase objects",
};

export default function EditorPage() {
  const [selectedTool, setSelectedTool] = useState<ObjectType>("block");
  const [objects, setObjects] = useState<LevelObject[]>([]);

  const handleExport = useCallback(() => {
    const data = {
      version: "1.0",
      gridSize: 32,
      cols: 60,
      rows: 20,
      objects,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "level.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [objects]);

  const handleClear = useCallback(() => {
    if (objects.length === 0) return;
    if (window.confirm("Clear all objects from the level?")) {
      setObjects([]);
    }
  }, [objects.length]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#0f0f23",
        overflow: "hidden",
      }}
    >
      <Toolbar
        selected={selectedTool}
        onSelect={setSelectedTool}
        objectCount={objects.length}
        onClear={handleClear}
        onExport={handleExport}
      />
      <div
        style={{
          flex: 1,
          padding: "16px",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.25)",
            fontSize: "11px",
            fontFamily: "monospace",
            letterSpacing: "0.05em",
          }}
        >
          LEVEL CANVAS — {60} x {20} tiles
        </div>
        <LevelEditor
          selectedTool={selectedTool}
          objects={objects}
          onObjectsChange={setObjects}
        />
      </div>
      <StatusBar selectedTool={selectedTool} hintText={HINTS[selectedTool]} />
    </div>
  );
}
