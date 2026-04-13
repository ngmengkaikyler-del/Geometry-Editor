import type { ToolType, BuiltinObjectType } from "../types";
import { TOOLBAR_GROUPS, OBJECT_DEFS } from "../objectDefs";
import type { PlayableMode } from "../lib/gameEngine";

const START_MODES: PlayableMode[] = ["cube", "ship", "spider", "wave"];

interface ToolbarProps {
  selected: ToolType;
  onSelect: (tool: ToolType) => void;
  objectCount: number;
  levelName: string;
  onLevelNameChange: (name: string) => void;
  onClear: () => void;
  onExportJson: () => void;
  onExportZip: () => void;
  startMode: PlayableMode;
  onStartModeChange: (mode: PlayableMode) => void;
  onPlay: () => void;
  onLoadDemo: () => void;
}

const TOOL_ICONS: Record<string, string> = {
  block: "\u25A0",
  spike_purple: "\u25B2",
  spike_purple_down: "\u25BC",
  spike_green: "\u25B2",
  spike_green_down: "\u25BC",
  spike_blue: "\u25B2",
  spike_blue_down: "\u25BC",
  dash_green: "\u25B6",
  dash_pink: "\u25B6",
  gm_wave: "\u2215",
  gm_wave_mini: "\u2215",
  speed_slow: "\u25C0",
  speed_normal: "\u25B6",
  speed_fast: "\u25B6\u25B6",
  speed_vfast: "\u25B6\u25B6",
  speed_sfast: "\u25B6\u25B6",
  eraser: "\u2715",
};

const TOOL_COLORS: Record<string, string> = {
  block: "#d63384",
  spike_purple: "#b844e0",
  spike_purple_down: "#b844e0",
  spike_green: "#44e060",
  spike_green_down: "#44e060",
  spike_blue: "#44b0e0",
  spike_blue_down: "#44b0e0",
  dash_green: "#00ff40",
  dash_pink: "#ff40a0",
  gm_wave: "#facc15",
  gm_wave_mini: "#facc15",
  speed_slow: "#ff8c00",
  speed_normal: "#00d4ff",
  speed_fast: "#00ff40",
  speed_vfast: "#e040ff",
  speed_sfast: "#ff2020",
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
  startMode,
  onStartModeChange,
  onPlay,
  onLoadDemo,
}: ToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        background: "rgba(15,15,35,0.95)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          color: "#f472b6",
          fontWeight: 700,
          fontSize: "14px",
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
          width: "120px",
          padding: "4px 8px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "5px",
          color: "#e5e7eb",
          fontSize: "11px",
          fontFamily: "monospace",
          outline: "none",
          marginRight: "2px",
        }}
      />

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "flex-end" }}>
        {TOOLBAR_GROUPS.map((group) => (
          <div
            key={group.label || "misc"}
            style={{ display: "flex", flexDirection: "column", gap: "2px" }}
          >
            {group.label && (
              <span
                style={{
                  fontSize: "8px",
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "monospace",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  paddingLeft: "2px",
                }}
              >
                {group.label}
              </span>
            )}
            <div style={{ display: "flex", gap: "2px" }}>
              {group.items.map((type) => {
                const isEraser = type === "eraser";
                const label = isEraser
                  ? "Eraser"
                  : OBJECT_DEFS[type as BuiltinObjectType]?.label ?? type;
                const color = TOOL_COLORS[type] ?? "#6b7280";
                const isActive = selected === type;
                const isMini = type.endsWith("_mini");

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
                      width: "44px",
                      height: "40px",
                      border: isActive
                        ? `2px solid ${color}`
                        : "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "6px",
                      background: isActive
                        ? `${color}22`
                        : "rgba(255,255,255,0.03)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      gap: "1px",
                      padding: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.background = `${color}15`;
                        (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}80`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "rgba(255,255,255,0.03)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor =
                          "rgba(255,255,255,0.1)";
                      }
                    }}
                  >
                    <span
                      style={{
                        fontSize: isMini ? "11px" : "14px",
                        color: isActive ? color : "#9ca3af",
                        lineHeight: 1,
                      }}
                    >
                      {TOOL_ICONS[type] ?? "\u25A0"}
                    </span>
                    <span
                      style={{
                        fontSize: "7px",
                        color: isActive ? color : "#6b7280",
                        fontFamily: "monospace",
                        fontWeight: isActive ? 700 : 400,
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                        lineHeight: 1,
                      }}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: "#6b7280", fontSize: "9px", fontFamily: "monospace" }}>START:</span>
          <select
            value={startMode}
            onChange={(e) => onStartModeChange(e.target.value as PlayableMode)}
            style={{
              padding: "3px 4px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "4px",
              color: "#d1d5db",
              fontSize: "10px",
              fontFamily: "monospace",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {START_MODES.map((m) => (
              <option key={m} value={m} style={{ background: "#1a1a2e" }}>
                {m.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onPlay}
          title="Play level (test)"
          style={{
            padding: "5px 14px",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            border: "1px solid rgba(74,222,128,0.4)",
            borderRadius: "5px",
            color: "#fff",
            cursor: "pointer",
            fontSize: "11px",
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: "0.03em",
            boxShadow: "0 0 12px rgba(34,197,94,0.3)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(34,197,94,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 12px rgba(34,197,94,0.3)";
          }}
        >
          PLAY
        </button>
        <span style={{ color: "#6b7280", fontSize: "11px", fontFamily: "monospace" }}>
          {objectCount} obj
        </span>
        <button
          onClick={onLoadDemo}
          title="Load Wave Trials demo level"
          style={{
            padding: "5px 10px",
            background: "rgba(250,204,21,0.1)",
            border: "1px solid rgba(250,204,21,0.3)",
            borderRadius: "5px",
            color: "#facc15",
            cursor: "pointer",
            fontSize: "10px",
            fontFamily: "monospace",
            fontWeight: 600,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(250,204,21,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(250,204,21,0.1)";
          }}
        >
          Demo
        </button>
        <button
          onClick={onClear}
          title="Clear all objects"
          style={{
            padding: "5px 10px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "5px",
            color: "#f87171",
            cursor: "pointer",
            fontSize: "11px",
            fontFamily: "monospace",
            fontWeight: 600,
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
            padding: "5px 8px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "5px",
            color: "#d1d5db",
            cursor: "pointer",
            fontSize: "10px",
            fontFamily: "monospace",
            fontWeight: 600,
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
            padding: "5px 12px",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            border: "1px solid rgba(167,139,250,0.4)",
            borderRadius: "5px",
            color: "#fff",
            cursor: "pointer",
            fontSize: "11px",
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: "0.03em",
            boxShadow: "0 0 12px rgba(124,58,237,0.3)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 20px rgba(124,58,237,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 12px rgba(124,58,237,0.3)";
          }}
        >
          ZIP
        </button>
      </div>
    </div>
  );
}
