export type ObjectType =
  | "block"
  | "spike"
  | "platform"
  | "portal"
  | "coin"
  | "ring"
  | "orb"
  | "eraser";

export interface LevelObject {
  x: number;
  y: number;
  type: Exclude<ObjectType, "eraser">;
}

export interface ObjectDef {
  type: ObjectType;
  label: string;
  color: string;
  render: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void;
}
