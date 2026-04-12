import { useState, useCallback, useEffect } from "react";
import type { LevelObject, ToolType, CustomImage } from "../types";
import { isBuiltinType } from "../objectDefs";
import { LevelEditor } from "../components/LevelEditor";
import { Toolbar } from "../components/Toolbar";
import { StatusBar } from "../components/StatusBar";
import { CustomImageSidebar } from "../components/CustomImageSidebar";
import { saveAsset, deleteAsset, loadAllAssets } from "../lib/assetStore";
import { exportLevelZip, exportLevelJsonOnly } from "../lib/exportLevel";

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
