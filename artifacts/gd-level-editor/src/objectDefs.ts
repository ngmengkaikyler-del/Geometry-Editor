import type { ObjectDef, BuiltinObjectType, ToolType } from "./types";

export const OBJECT_DEFS: Record<BuiltinObjectType, Omit<ObjectDef, "type">> = {} as any;

export const BUILTIN_TYPES: BuiltinObjectType[] = [];

export const TOOLBAR_GROUPS: { label: string; items: ToolType[] }[] = [
  { label: "", items: ["eraser"] },
];

export const TOOLBAR_ITEMS: ToolType[] = ["eraser"];

export function isBuiltinType(type: string): type is BuiltinObjectType {
  return type in OBJECT_DEFS;
}
