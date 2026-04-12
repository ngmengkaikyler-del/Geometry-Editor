import { useState, useCallback, useEffect, useRef } from "react";
import type { LevelObject, ToolType, CustomImage, MusicTrack } from "../types";
import { isBuiltinType, SPEED_DATA, GAMEMODE_DATA } from "../objectDefs";
import { LevelEditor } from "../components/LevelEditor";
import { Toolbar } from "../components/Toolbar";
import { StatusBar } from "../components/StatusBar";
import { CustomImageSidebar } from "../components/CustomImageSidebar";
import { MusicPlayer } from "../components/MusicPlayer";
import { saveAsset, deleteAsset, loadAllAssets } from "../lib/assetStore";
import { saveMusicTrack, deleteMusicTrack, loadMusicTrack } from "../lib/musicStore";
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
  speed_slow: `Slow (${SPEED_DATA.speed_slow.multiplier}) \u2014 ${SPEED_DATA.speed_slow.unitsPerSec} u/s \u2248 ${SPEED_DATA.speed_slow.blocksPerSec} blocks/s`,
  speed_normal: `Normal (${SPEED_DATA.speed_normal.multiplier}) \u2014 ${SPEED_DATA.speed_normal.unitsPerSec} u/s \u2248 ${SPEED_DATA.speed_normal.blocksPerSec} blocks/s`,
  speed_fast: `Fast (${SPEED_DATA.speed_fast.multiplier}) \u2014 ${SPEED_DATA.speed_fast.unitsPerSec} u/s \u2248 ${SPEED_DATA.speed_fast.blocksPerSec} blocks/s`,
  speed_vfast: `V.Fast (${SPEED_DATA.speed_vfast.multiplier}) \u2014 ${SPEED_DATA.speed_vfast.unitsPerSec} u/s \u2248 ${SPEED_DATA.speed_vfast.blocksPerSec} blocks/s`,
  speed_sfast: `S.Fast (${SPEED_DATA.speed_sfast.multiplier}) \u2014 ${SPEED_DATA.speed_sfast.unitsPerSec} u/s \u2248 ${SPEED_DATA.speed_sfast.blocksPerSec} blocks/s`,
  gm_cube: `Cube (Big) \u2014 Jump: ${GAMEMODE_DATA.gm_cube.jumpForce} | Gravity: ${GAMEMODE_DATA.gm_cube.gravity}`,
  gm_cube_mini: `Cube (Mini) \u2014 Jump: ${GAMEMODE_DATA.gm_cube_mini.jumpForce} | Gravity: ${GAMEMODE_DATA.gm_cube_mini.gravity}`,
  gm_ball: `Ball (Big) \u2014 Jump: ${GAMEMODE_DATA.gm_ball.jumpForce} | Gravity: ${GAMEMODE_DATA.gm_ball.gravity}`,
  gm_ball_mini: `Ball (Mini) \u2014 Jump: ${GAMEMODE_DATA.gm_ball_mini.jumpForce} | Gravity: ${GAMEMODE_DATA.gm_ball_mini.gravity}`,
  gm_ufo: `UFO (Big) \u2014 Jump: ${GAMEMODE_DATA.gm_ufo.jumpForce} | Gravity: ${GAMEMODE_DATA.gm_ufo.gravity}`,
  gm_ufo_mini: `UFO (Mini) \u2014 Jump: ${GAMEMODE_DATA.gm_ufo_mini.jumpForce} | Gravity: ${GAMEMODE_DATA.gm_ufo_mini.gravity}`,
  gm_robot: `Robot (Big) \u2014 Jump: ${GAMEMODE_DATA.gm_robot.jumpForce} | Gravity: ${GAMEMODE_DATA.gm_robot.gravity} | Max hold: ${GAMEMODE_DATA.gm_robot.maxHold}s`,
  gm_robot_mini: `Robot (Mini) \u2014 Jump: ${GAMEMODE_DATA.gm_robot_mini.jumpForce} | Gravity: ${GAMEMODE_DATA.gm_robot_mini.gravity} | Max hold: ${GAMEMODE_DATA.gm_robot_mini.maxHold}s`,
  gm_wave: `Wave (Big) \u2014 45\u00B0 angle | Vy = Vx (1:1 ratio) | Hold=up, Release=down`,
  gm_wave_mini: `Wave (Mini) \u2014 63.43\u00B0 angle | Vy = 2\u00D7Vx (2:1 ratio) | 2x sensitivity`,
  orb_dash_green: "Dash Orb (Green) \u2014 Vy=0 while held, horizontal travel only | Gravity resumes on release",
  orb_dash_pink: "Dash Orb (Pink) \u2014 Vy=0 while held | Flips gravity on release (g = -g)",
  orb_spider: "Spider Orb \u2014 Raycast to nearest surface, teleport in 1 frame, flip gravity",
  eraser: "Click or drag to erase objects | Right-click also deletes",
};

const AUDIO_EXTENSIONS = ["mp3", "wav"];

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
