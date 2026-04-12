interface StatusBarProps {
  selectedTool: string;
  hintText: string;
}

export function StatusBar({ selectedTool, hintText }: StatusBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "6px 16px",
        background: "rgba(10,10,25,0.9)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        fontSize: "11px",
        fontFamily: "monospace",
        color: "#4b5563",
      }}
    >
      <span>
        Tool: <span style={{ color: "#c4b5fd" }}>{selectedTool.toUpperCase()}</span>
      </span>
      <span style={{ marginLeft: "auto" }}>{hintText}</span>
    </div>
  );
}
