export type BuiltinObjectType =
  | "block"
  | "spike"
  | "platform"
  | "portal"
  | "coin"
  | "ring"
  | "orb"
  | "speed_slow"
  | "speed_normal"
  | "speed_fast"
  | "speed_vfast"
  | "speed_sfast";

export type ToolType = BuiltinObjectType | "eraser" | string;

export interface LevelObject {
  x: number;
  y: number;
  type: string;
  time?: number;
}

export interface ObjectDef {
  type: string;
  label: string;
  color: string;
  render: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void;
}

export interface CustomImage {
  id: string;
  name: string;
  dataUrl: string;
  image: HTMLImageElement;
}

export interface MusicTrack {
  id: string;
  name: string;
  dataUrl: string;
  fileExtension: string;
}
