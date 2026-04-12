import type { ToolType, BuiltinObjectType } from "../types";
import { TOOLBAR_ITEMS, OBJECT_DEFS } from "../objectDefs";

interface ToolbarProps {
  selected: ToolType;
  onSelect: (tool: ToolType) => void;
  objectCount: number;
  levelName: string;
  onLevelNameChange: (name: string) => void;
  onClear: () => void;
  onExportJson: () => void;
  onExportZip: () => void;
}

const TOOL_ICONS: Record<string, string> = {
  block: "\u25AA",
  spike: "\u25B2",
  platform: "\u25AC",
  portal: "\u25C9",
  coin: "\u25CF",
  ring: "\u25CB",
  orb: "\u25C8",
  speed_slow: "\u25C7",
  speed_normal: "\u25C6",
  speed_fast: "\u25B6\u25B6",
  speed_vfast: "\u25B6\u25B6\u25B6",
  speed_sfast: "\u2726",
  eraser: "\u2715",
};

const TOOL_COLORS: Record<string, string> = {
  block: "#4a90d9",
  spike: "#e74c3c",
  platform: "#27ae60",
  portal: "#7c3aed",
  coin: "#f59e0b",
  ring: "#f97316",
  orb: "#16a34a",
  speed_slow: "#3b82f6",
  speed_normal: "#22c55e",
  speed_fast: "#f59e0b",
  speed_vfast: "#ef4444",
  speed_sfast: "#a855f7",
  eraser: "#6b7280",
};

export function Toolbar({
  selected,
  onSelect,
  objectCount,
  levelName,
  onLevelNameChange,
  onClear,
  onExportJson,
  onExportZip,
}: ToolbarProps) {
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
          marginRight: "4px",
          fontFamily: "monospace",
        }}
      >
        GD EDITOR
      </span>

      <input
        type="text"
        value={levelName}
        onChange={(e) => onLevelNameChange(e.target.value)}
        placeholder="Level name..."
        style={{
          width: "140px",
          padding: "5px 8px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "5px",
          color: "#e5e7eb",
          fontSize: "11px",
          fontFamily: "monospace",
          outline: "none",
          marginRight: "4px",
        }}
      />

      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", alignItems: "flex-end" }}>
        {TOOLBAR_ITEMS.map((type) => {
          const isEraser = type === "eraser";
          const label = isEraser ? "Eraser" : OBJECT_DEFS[type as BuiltinObjectType]?.label ?? type;
          const color = TOOL_COLORS[type] ?? "#6b7280";
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
                width: "52px",
                height: "48px",
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
                {TOOL_ICONS[type] ?? "\u25A0"}
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
          onClick={onExportJson}
          title="Export level.json only"
          style={{
            padding: "7px 12px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "6px",
            color: "#d1d5db",
            cursor: "pointer",
            fontSize: "11px",
            fontFamily: "monospace",
            fontWeight: 600,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
          }}
        >
          JSON
        </button>
        <button
          onClick={onExportZip}
          title="Download ZIP with level.json, assets.json, and image files"
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
          Export ZIP
        </button>
      </div>
    </div>
  );
}
