import { useState, useCallback, useEffect, useRef } from "react";
import type { LevelObject, ToolType, CustomImage, MusicTrack } from "../types";
import { isBuiltinType } from "../objectDefs";
import { LevelEditor } from "../components/LevelEditor";
import { Toolbar } from "../components/Toolbar";
import { StatusBar } from "../components/StatusBar";
import { CustomImageSidebar } from "../components/CustomImageSidebar";
import { MusicPlayer } from "../components/MusicPlayer";
import { GameRenderer } from "../components/GameRenderer";
import { saveAsset, deleteAsset, loadAllAssets } from "../lib/assetStore";
import { saveMusicTrack, deleteMusicTrack, loadMusicTrack } from "../lib/musicStore";
import { exportLevelZip, exportLevelJsonOnly } from "../lib/exportLevel";
import { processImageFile } from "../lib/processImageFile";
import type { PlayableMode } from "../lib/gameEngine";
import { generateWaveTrialsLevel } from "../lib/demoLevels";

const BUILTIN_HINTS: Record<string, string> = {
  block: "Left-click to place blocks | Right-click to delete",
  spike: "Spike (up) \u2014 triangle hazard, kills on touch",
  spike_down: "Spike (down) \u2014 inverted triangle hazard, kills on touch",
  sawblade: "Sawblade \u2014 circular spinning hazard, kills on touch",
  ring: "Ring \u2014 cyan jump trigger",
  orb: "Orb \u2014 yellow jump trigger",
  speed_slow: "Slow (0.8x) \u2014 reduces scroll speed",
  speed_normal: "Normal (1x) \u2014 default scroll speed",
  speed_fast: "Fast (1.25x) \u2014 increased scroll speed",
  speed_vfast: "V.Fast (1.6x) \u2014 very fast scroll speed",
  speed_sfast: "S.Fast (2x) \u2014 super fast scroll speed",
  gm_cube: "Cube mode \u2014 tap to jump, gravity pulls down",
  gm_wave: "Wave mode \u2014 hold=up, release=down, 45\u00B0 angle",
  gm_wave_mini: "Wave (Mini) \u2014 steeper angle, 2x sensitivity",
  eraser: "Click or drag to erase objects | Right-click also deletes",
};

const AUDIO_EXTENSIONS = ["mp3", "wav"];
const START_MODES: PlayableMode[] = ["cube", "ship", "spider", "wave"];

function isAudioFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return AUDIO_EXTENSIONS.includes(ext) || file.type.startsWith("audio/");
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function EditorPage() {
  const [selectedTool, setSelectedTool] = useState<ToolType>("block");
  const [objects, setObjects] = useState<LevelObject[]>([]);
  const [customImages, setCustomImages] = useState<CustomImage[]>([]);
  const [musicTrack, setMusicTrack] = useState<MusicTrack | null>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [levelName, setLevelName] = useState("Untitled Level");
  const [isDragOver, setIsDragOver] = useState(false);
  const [syncTime, setSyncTime] = useState(false);
  const [currentMusicTime, setCurrentMusicTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startMode, setStartMode] = useState<PlayableMode>("cube");
  const dragCounterRef = useRef(0);

  useEffect(() => {
    Promise.all([loadAllAssets(), loadMusicTrack()])
      .then(([images, track]) => {
        setCustomImages(images);
        if (track) setMusicTrack(track);
        setAssetsLoaded(true);
      })
      .catch(() => {
        setAssetsLoaded(true);
      });
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentMusicTime(time);
  }, []);

  const handleSyncTimeToggle = useCallback(() => {
    setSyncTime((prev) => !prev);
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

      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((f) => f.type === "image/png");
      const audioFiles = files.filter((f) => isAudioFile(f));

      for (const file of imageFiles) {
        try {
          const img = await processImageFile(file);
          setCustomImages((prev) => [...prev, img]);
          saveAsset(img).catch(() => {});
        } catch {}
      }

      if (audioFiles.length > 0) {
        const file = audioFiles[0];
        try {
          const dataUrl = await readFileAsDataUrl(file);
          const ext = file.name.split(".").pop()?.toLowerCase() ?? "mp3";
          const track: MusicTrack = {
            id: `music_${Date.now()}`,
            name: file.name.replace(/\.(mp3|wav)$/i, ""),
            dataUrl,
            fileExtension: ext,
          };
          setMusicTrack(track);
          saveMusicTrack(track).catch(() => {});
        } catch {}
      }
    },
    []
  );

  const handleExportJson = useCallback(() => {
    exportLevelJsonOnly(levelName, objects, customImages, musicTrack);
  }, [levelName, objects, customImages, musicTrack]);

  const handleExportZip = useCallback(() => {
    exportLevelZip(levelName, objects, customImages, musicTrack);
  }, [levelName, objects, customImages, musicTrack]);

  const handleLoadDemo = useCallback(() => {
    if (objects.length > 0 && !window.confirm("This will replace the current level. Continue?")) return;
    const demo = generateWaveTrialsLevel();
    setObjects(demo.objects);
    setLevelName(demo.name);
    setStartMode(demo.startMode);
  }, [objects.length]);

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

  const handleUploadMusic = useCallback((track: MusicTrack) => {
    setMusicTrack(track);
    saveMusicTrack(track).catch(() => {});
  }, []);

  const handleRemoveMusic = useCallback(() => {
    if (musicTrack) {
      deleteMusicTrack(musicTrack.id).catch(() => {});
    }
    setMusicTrack(null);
    setCurrentMusicTime(0);
    setSyncTime(false);
  }, [musicTrack]);

  const getHint = (): string => {
    if (BUILTIN_HINTS[selectedTool]) {
      const base = BUILTIN_HINTS[selectedTool];
      if (syncTime) return `${base} | SYNC: objects stamped at ${currentMusicTime.toFixed(1)}s`;
      return base;
    }
    const custom = customImages.find((img) => img.id === selectedTool);
    if (custom) {
      const base = `Left-click to place "${custom.name}" | Right-click to delete`;
      if (syncTime) return `${base} | SYNC: ${currentMusicTime.toFixed(1)}s`;
      return base;
    }
    return "Select a tool";
  };

  const toolLabel = (): string => {
    if (isBuiltinType(selectedTool) || selectedTool === "eraser") return selectedTool;
    const custom = customImages.find((img) => img.id === selectedTool);
    return custom ? custom.name : selectedTool;
  };

  if (isPlaying) {
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 16px",
            background: "rgba(15,15,35,0.95)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span
            style={{
              color: "#4ade80",
              fontWeight: 700,
              fontSize: "14px",
              fontFamily: "monospace",
              letterSpacing: "0.05em",
            }}
          >
            PLAY MODE
          </span>
          <span style={{ color: "#6b7280", fontSize: "11px", fontFamily: "monospace" }}>
            Start: {startMode.toUpperCase()}
          </span>
          <span style={{ color: "#6b7280", fontSize: "11px", fontFamily: "monospace" }}>
            Space/Click = action | R = restart | Esc = back to editor
          </span>
          <button
            onClick={() => setIsPlaying(false)}
            style={{
              marginLeft: "auto",
              padding: "5px 14px",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: "5px",
              color: "#f87171",
              cursor: "pointer",
              fontSize: "11px",
              fontFamily: "monospace",
              fontWeight: 700,
            }}
          >
            STOP
          </button>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <GameRenderer
            objects={objects}
            customImages={customImages}
            startMode={startMode}
            onStop={() => setIsPlaying(false)}
          />
        </div>
      </div>
    );
  }

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
              Drop files here
            </div>
            <div
              style={{
                color: "#6b7280",
                fontSize: "12px",
                fontFamily: "monospace",
                marginTop: "4px",
              }}
            >
              PNG images or MP3/WAV audio
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
        startMode={startMode}
        onStartModeChange={setStartMode}
        onPlay={() => setIsPlaying(true)}
        onLoadDemo={handleLoadDemo}
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
            LEVEL CANVAS - 600 x 10 tiles
          </div>
          <LevelEditor
            selectedTool={selectedTool}
            objects={objects}
            onObjectsChange={setObjects}
            customImages={customImages}
            syncTime={syncTime}
            currentMusicTime={currentMusicTime}
          />
        </div>
      </div>
      <MusicPlayer
        track={musicTrack}
        onUpload={handleUploadMusic}
        onRemove={handleRemoveMusic}
        onTimeUpdate={handleTimeUpdate}
        syncTime={syncTime}
        onSyncTimeToggle={handleSyncTimeToggle}
      />
      <StatusBar selectedTool={toolLabel()} hintText={getHint()} />
    </div>
  );
}
