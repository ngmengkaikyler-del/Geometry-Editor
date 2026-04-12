import type { ObjectType } from "../types";
import { TOOLBAR_ITEMS, OBJECT_DEFS } from "../objectDefs";

interface ToolbarProps {
  selected: ObjectType;
  onSelect: (tool: ObjectType) => void;
  objectCount: number;
  onClear: () => void;
  onExport: () => void;
}

const TOOL_ICONS: Record<ObjectType, string> = {
  block: "▪",
  spike: "▲",
  platform: "▬",
  portal: "◉",
  coin: "●",
  ring: "○",
  orb: "◈",
  eraser: "✕",
};

const TOOL_COLORS: Record<ObjectType, string> = {
  block: "#4a90d9",
  spike: "#e74c3c",
  platform: "#27ae60",
  portal: "#7c3aed",
  coin: "#f59e0b",
  ring: "#f97316",
  orb: "#16a34a",
  eraser: "#6b7280",
};

export function Toolbar({ selected, onSelect, objectCount, onClear, onExport }: ToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 16px",
        background: "rgba(15,15,35,0.95)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          color: "#c4b5fd",
          fontWeight: 700,
          fontSize: "15px",
          letterSpacing: "0.05em",
          marginRight: "8px",
          fontFamily: "monospace",
        }}
      >
        GD EDITOR
      </span>

      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {TOOLBAR_ITEMS.map((type) => {
          const isEraser = type === "eraser";
          const label = isEraser ? "Eraser" : OBJECT_DEFS[type as Exclude<ObjectType, "eraser">].label;
          const color = TOOL_COLORS[type];
          const isActive = selected === type;

          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              title={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "58px",
                height: "52px",
                border: isActive
                  ? `2px solid ${color}`
                  : "2px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                background: isActive
                  ? `${color}22`
                  : "rgba(255,255,255,0.04)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                gap: "3px",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = `${color}15`;
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}80`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                }
              }}
            >
              <span style={{ fontSize: "18px", color: isActive ? color : "#9ca3af" }}>
                {TOOL_ICONS[type]}
              </span>
              <span
                style={{
                  fontSize: "9px",
                  color: isActive ? color : "#6b7280",
                  fontFamily: "monospace",
                  fontWeight: isActive ? 700 : 400,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#6b7280", fontSize: "12px", fontFamily: "monospace" }}>
          {objectCount} object{objectCount !== 1 ? "s" : ""}
        </span>
        <button
          onClick={onClear}
          title="Clear all objects"
          style={{
            padding: "7px 14px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "6px",
            color: "#f87171",
            cursor: "pointer",
            fontSize: "12px",
            fontFamily: "monospace",
            fontWeight: 600,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)";
          }}
        >
          Clear
        </button>
        <button
          onClick={onExport}
          title="Export level.json"
          style={{
            padding: "7px 16px",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            border: "1px solid rgba(167,139,250,0.4)",
            borderRadius: "6px",
            color: "#fff",
            cursor: "pointer",
            fontSize: "12px",
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: "0.03em",
            transition: "all 0.15s ease",
            boxShadow: "0 0 12px rgba(124,58,237,0.3)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(124,58,237,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 12px rgba(124,58,237,0.3)";
          }}
        >
          Export JSON
        </button>
      </div>
    </div>
  );
}
