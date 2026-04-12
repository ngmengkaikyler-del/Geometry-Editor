import JSZip from "jszip";
import type { LevelObject, CustomImage, MusicTrack } from "../types";
import { isBuiltinType } from "../objectDefs";

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] ?? "image/png";
  const bytes = atob(parts[1]);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }
  return new Blob([arr], { type: mime });
}

function buildLevelData(
  levelName: string,
  objects: LevelObject[],
  customImages: CustomImage[],
  musicTrack: MusicTrack | null
) {
  const usedCustomIds = new Set<string>();
  for (const obj of objects) {
    if (!isBuiltinType(obj.type)) {
      usedCustomIds.add(obj.type);
    }
  }

  const assetMap: Record<string, string> = {};
  const usedImages: CustomImage[] = [];
  for (const img of customImages) {
    if (usedCustomIds.has(img.id)) {
      const filename = `${img.id}.png`;
      assetMap[img.id] = filename;
      usedImages.push(img);
    }
  }

  const levelData: Record<string, unknown> = {
    version: "1.0",
    name: levelName || "Untitled Level",
    gridSize: 32,
    cols: 60,
    rows: 20,
    assetIds: Object.keys(assetMap),
    objects,
  };

  if (musicTrack) {
    levelData.music = {
      id: musicTrack.id,
      name: musicTrack.name,
      file: `${musicTrack.id}.${musicTrack.fileExtension}`,
    };
  }

  return { levelData, assetMap, usedImages };
}

export async function exportLevelZip(
  levelName: string,
  objects: LevelObject[],
  customImages: CustomImage[],
  musicTrack: MusicTrack | null
) {
  const { levelData, assetMap, usedImages } = buildLevelData(
    levelName, objects, customImages, musicTrack
  );

  const assetsData: Record<string, string> = { ...assetMap };
  if (musicTrack) {
    assetsData[musicTrack.id] = `${musicTrack.id}.${musicTrack.fileExtension}`;
  }

  const zip = new JSZip();
  zip.file("level.json", JSON.stringify(levelData, null, 2));
  zip.file("assets.json", JSON.stringify(assetsData, null, 2));

  const assetsFolder = zip.folder("assets");
  if (assetsFolder) {
    for (const img of usedImages) {
      const blob = dataUrlToBlob(img.dataUrl);
      assetsFolder.file(`${img.id}.png`, blob);
    }
    if (musicTrack) {
      const blob = dataUrlToBlob(musicTrack.dataUrl);
      assetsFolder.file(`${musicTrack.id}.${musicTrack.fileExtension}`, blob);
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = (levelName || "level").replace(/[^a-zA-Z0-9_-]/g, "_");
  a.download = `${safeName}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportLevelJsonOnly(
  levelName: string,
  objects: LevelObject[],
  customImages: CustomImage[],
  musicTrack: MusicTrack | null
) {
  const { levelData } = buildLevelData(levelName, objects, customImages, musicTrack);

  const blob = new Blob([JSON.stringify(levelData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "level.json";
  a.click();
  URL.revokeObjectURL(url);
}
