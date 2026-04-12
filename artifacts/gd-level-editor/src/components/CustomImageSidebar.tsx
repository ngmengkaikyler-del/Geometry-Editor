import { useRef } from "react";
import type { CustomImage, ToolType } from "../types";
import { processImageFile } from "../lib/processImageFile";

interface CustomImageSidebarProps {
  images: CustomImage[];
  selectedTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onAddImage: (image: CustomImage) => void;
  onRemoveImage: (id: string) => void;
  loading?: boolean;
}

export function CustomImageSidebar({
  images,
  selectedTool,
  onSelectTool,
  onAddImage,
  onRemoveImage,
  loading,
}: CustomImageSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const img = await processImageFile(file);
      onAddImage(img);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to load image");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      style={{
        width: "180px",
        minWidth: "180px",
        background: "rgba(15,15,35,0.95)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <span
          style={{
            color: "#a78bfa",
            fontSize: "10px",
            fontFamily: "monospace",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Custom Images
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,image/png"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: "100%",
            padding: "7px 0",
            background: "rgba(167,139,250,0.12)",
            border: "1px dashed rgba(167,139,250,0.4)",
            borderRadius: "6px",
            color: "#c4b5fd",
            cursor: "pointer",
            fontSize: "11px",
            fontFamily: "monospace",
            fontWeight: 600,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(167,139,250,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(167,139,250,0.12)";
          }}
        >
          + Upload PNG
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {loading && (
          <div
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "10px",
              fontFamily: "monospace",
              textAlign: "center",
              padding: "20px 8px",
            }}
          >
            Loading assets...
          </div>
        )}

        {!loading && images.length === 0 && (
          <div
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: "10px",
              fontFamily: "monospace",
              textAlign: "center",
              padding: "20px 8px",
              lineHeight: "1.5",
            }}
          >
            No custom images yet.
            <br />
            Upload a PNG to get started.
          </div>
        )}

        {images.map((img) => {
          const isActive = selectedTool === img.id;
          return (
            <div
              key={img.id}
              onClick={() => onSelectTool(img.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 8px",
                borderRadius: "6px",
                border: isActive
                  ? "1px solid rgba(167,139,250,0.6)"
                  : "1px solid transparent",
                background: isActive
                  ? "rgba(167,139,250,0.15)"
                  : "transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }
              }}
            >
              <img
                src={img.dataUrl}
                alt={img.name}
                style={{
                  width: "28px",
                  height: "28px",
                  objectFit: "contain",
                  borderRadius: "3px",
                  background: "rgba(255,255,255,0.06)",
                  imageRendering: "pixelated",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: isActive ? "#c4b5fd" : "#9ca3af",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    fontWeight: isActive ? 700 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {img.name}
                </div>
                <div
                  style={{
                    color: "#4b5563",
                    fontSize: "8px",
                    fontFamily: "monospace",
                  }}
                >
                  {img.id}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(img.id);
                }}
                title="Remove image"
                style={{
                  width: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "none",
                  color: "#4b5563",
                  cursor: "pointer",
                  fontSize: "12px",
                  borderRadius: "3px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#4b5563";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                x
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
