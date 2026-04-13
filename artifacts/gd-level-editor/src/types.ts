export type BuiltinObjectType =
  | "spike_purple"
  | "spike_purple_down"
  | "spike_green"
  | "spike_green_down"
  | "spike_blue"
  | "spike_blue_down"
  | "block"
  | "ramp"
  | "sawblade"
  | "dash_green"
  | "dash_pink"
  | "gm_cube"
  | "gm_wave"
  | "gm_wave_mini"
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
  rotation?: number;
  time?: number;
}

export const ROTATABLE_TYPES = new Set([
  "block", "ramp",
  "spike_purple", "spike_purple_down",
  "spike_green", "spike_green_down",
  "spike_blue", "spike_blue_down",
]);

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
