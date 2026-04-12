import { useState, useRef, useEffect, useCallback } from "react";
import type { MusicTrack } from "../types";

interface MusicPlayerProps {
  track: MusicTrack | null;
  onUpload: (track: MusicTrack) => void;
  onRemove: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MusicPlayer({ track, onUpload, onRemove }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (track) {
      const audio = new Audio(track.dataUrl);
      audioRef.current = audio;
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });
      audio.addEventListener("ended", () => {
        cancelAnimationFrame(animFrameRef.current);
        setIsPlaying(false);
        setCurrentTime(0);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [track?.id]);

  const updateTime = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
    animFrameRef.current = requestAnimationFrame(updateTime);
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      cancelAnimationFrame(animFrameRef.current);
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      animFrameRef.current = requestAnimationFrame(updateTime);
      setIsPlaying(true);
    }
  }, [isPlaying, updateTime]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * audioRef.current.duration;
    setCurrentTime(audioRef.current.currentTime);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["mp3", "wav"].includes(ext)) {
      alert("Only MP3 and WAV files are supported.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const id = `music_${Date.now()}`;
      const name = file.name.replace(/\.(mp3|wav)$/i, "");
      onUpload({ id, name, dataUrl, fileExtension: ext });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 16px",
        background: "rgba(15,15,35,0.95)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        minHeight: "36px",
      }}
    >
      <span
        style={{
          color: "#7c3aed",
          fontSize: "11px",
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: "0.05em",
          flexShrink: 0,
        }}
      >
        MUSIC
      </span>

      {!track ? (
        <>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "4px 12px",
              background: "rgba(255,255,255,0.06)",
              border: "1px dashed rgba(255,255,255,0.2)",
              borderRadius: "5px",
              color: "#9ca3af",
              cursor: "pointer",
              fontSize: "11px",
              fontFamily: "monospace",
            }}
          >
            + Add Audio (MP3/WAV)
          </button>
          <span style={{ color: "#4b5563", fontSize: "10px", fontFamily: "monospace" }}>
            or drag & drop an audio file
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,audio/mpeg,audio/wav"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </>
      ) : (
        <>
          <button
            onClick={togglePlay}
            title={isPlaying ? "Pause" : "Play"}
            style={{
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isPlaying
                ? "rgba(239,68,68,0.15)"
                : "rgba(124,58,237,0.2)",
              border: isPlaying
                ? "1px solid rgba(239,68,68,0.4)"
                : "1px solid rgba(124,58,237,0.4)",
              borderRadius: "50%",
              color: isPlaying ? "#f87171" : "#c4b5fd",
              cursor: "pointer",
              fontSize: "12px",
              flexShrink: 0,
            }}
          >
            {isPlaying ? "\u23F8" : "\u25B6"}
          </button>

          <span
            style={{
              color: "#d1d5db",
              fontSize: "11px",
              fontFamily: "monospace",
              maxWidth: "120px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
            title={track.name}
          >
            {track.name}
          </span>

          <span
            style={{
              color: "#6b7280",
              fontSize: "10px",
              fontFamily: "monospace",
              flexShrink: 0,
              width: "36px",
              textAlign: "right",
            }}
          >
            {formatTime(currentTime)}
          </span>

          <div
            ref={progressRef}
            onClick={handleSeek}
            style={{
              flex: 1,
              height: "6px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: "3px",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              minWidth: "80px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                borderRadius: "3px",
                transition: "width 0.1s linear",
              }}
            />
          </div>

          <span
            style={{
              color: "#6b7280",
              fontSize: "10px",
              fontFamily: "monospace",
              flexShrink: 0,
              width: "36px",
            }}
          >
            {formatTime(duration)}
          </span>

          <button
            onClick={onRemove}
            title="Remove music"
            style={{
              width: "22px",
              height: "22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "4px",
              color: "#f87171",
              cursor: "pointer",
              fontSize: "11px",
              flexShrink: 0,
            }}
          >
            {"\u2715"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,audio/mpeg,audio/wav"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </>
      )}
    </div>
  );
}
