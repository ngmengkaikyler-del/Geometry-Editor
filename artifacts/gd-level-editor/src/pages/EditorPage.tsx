import { useState, useCallback, useEffect, useRef } from "react";
import type { LevelObject, ToolType, CustomImage } from "../types";
import { isBuiltinType } from "../objectDefs";
import { LevelEditor } from "../components/LevelEditor";
import { Toolbar } from "../components/Toolbar";
import { StatusBar } from "../components/StatusBar";
import { CustomImageSidebar } from "../components/CustomImageSidebar";
import { saveAsset, deleteAsset, loadAllAssets } from "../lib/assetStore";
import { exportLevelZip, exportLevelJsonOnly } from "../lib/exportLevel";
import { processImageFile } from "../lib/processImageFile";

const BUILTIN_HINTS: Record<string, string> = {
  block: "Left-click to place blocks | Right-click to delete",
  spike: "Left-click to place spikes | Right-click to delete",
  platform: "Left-click to place platforms | Right-click to delete",
  portal: "Left-click to place portals | Right-click to delete",
  coin: "Left-click to place coins | Right-click to delete",
  ring: "Left-click to place rings | Right-click to delete",
  orb: "Left-click to place orbs | Right-click to delete",
  eraser: "Click or drag to erase objects | Right-click also deletes",
};

export default function EditorPage() {
  const [selectedTool, setSelectedTool] = useState<ToolType>("block");
  const [objects, setObjects] = useState<LevelObject[]>([]);
  const [customImages, setCustomImages] = useState<CustomImage[]>([]);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [levelName, setLevelName] = useState("Untitled Level");
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  useEffect(() => {
    loadAllAssets()
      .then((images) => {
        setCustomImages(images);
        setAssetsLoaded(true);
      })
      .catch(() => {
        setAssetsLoaded(true);
      });
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      dragCounterRef.current = 0;

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type === "image/png"
      );
      if (files.length === 0) return;

      const results: CustomImage[] = [];
      for (const file of files) {
        try {
          const img = await processImageFile(file);
          results.push(img);
        } catch {}
      }
      for (const img of results) {
        setCustomImages((prev) => [...prev, img]);
        saveAsset(img).catch(() => {});
      }
    },
    []
  );

  const handleExportJson = useCallback(() => {
    exportLevelJsonOnly(levelName, objects, customImages);
  }, [levelName, objects, customImages]);

  const handleExportZip = useCallback(() => {
    exportLevelZip(levelName, objects, customImages);
  }, [levelName, objects, customImages]);

  const handleClear = useCallback(() => {
    if (objects.length === 0) return;
    if (window.confirm("Clear all objects from the level?")) {
      setObjects([]);
    }
  }, [objects.length]);

  const handleAddImage = useCallback((image: CustomImage) => {
    setCustomImages((prev) => [...prev, image]);
    saveAsset(image).catch(() => {});
  }, []);

  const handleRemoveImage = useCallback(
    (id: string) => {
      setCustomImages((prev) => prev.filter((img) => img.id !== id));
      setObjects((prev) => prev.filter((obj) => obj.type !== id));
      deleteAsset(id).catch(() => {});
      if (selectedTool === id) {
        setSelectedTool("block");
      }
    },
    [selectedTool]
  );

  const getHint = (): string => {
    if (BUILTIN_HINTS[selectedTool]) return BUILTIN_HINTS[selectedTool];
    const custom = customImages.find((img) => img.id === selectedTool);
    if (custom) return `Left-click to place "${custom.name}" | Right-click to delete`;
    return "Select a tool";
  };

  const toolLabel = (): string => {
    if (isBuiltinType(selectedTool) || selectedTool === "eraser") return selectedTool;
    const custom = customImages.find((img) => img.id === selectedTool);
    return custom ? custom.name : selectedTool;
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#0f0f23",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {isDragOver && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 9999,
            background: "rgba(124,58,237,0.15)",
            border: "3px dashed #7c3aed",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "rgba(15,15,35,0.9)",
              padding: "24px 48px",
              borderRadius: "12px",
              border: "1px solid rgba(124,58,237,0.5)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>
              {"\uD83D\uDCC2"}
            </div>
            <div
              style={{
                color: "#c4b5fd",
                fontSize: "16px",
                fontWeight: 700,
                fontFamily: "monospace",
              }}
            >
              Drop PNG files here
            </div>
            <div
              style={{
                color: "#6b7280",
                fontSize: "12px",
                fontFamily: "monospace",
                marginTop: "4px",
              }}
            >
              They'll be added as custom assets
            </div>
          </div>
        </div>
      )}
      <Toolbar
        selected={selectedTool}
        onSelect={setSelectedTool}
        objectCount={objects.length}
        levelName={levelName}
        onLevelNameChange={setLevelName}
        onClear={handleClear}
        onExportJson={handleExportJson}
        onExportZip={handleExportZip}
      />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <CustomImageSidebar
          images={customImages}
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          onAddImage={handleAddImage}
          onRemoveImage={handleRemoveImage}
          loading={!assetsLoaded}
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
            LEVEL CANVAS - 60 x 20 tiles
          </div>
          <LevelEditor
            selectedTool={selectedTool}
            objects={objects}
            onObjectsChange={setObjects}
            customImages={customImages}
          />
        </div>
      </div>
      <StatusBar selectedTool={toolLabel()} hintText={getHint()} />
    </div>
  );
}
