# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### GD Level Editor (`artifacts/gd-level-editor`)
- **Type**: react-vite (frontend-only, no backend)
- **Preview path**: `/`
- **Description**: A Geometry Dash-inspired browser-based level editor
- **Features**:
  - 60x20 tile-based grid canvas (HTML Canvas)
  - Click or drag to place/erase objects
  - 20 built-in object types organized in 3 toolbar groups:
    - Objects: Block, Spike, Platform, Portal, Coin, Ring, Orb
    - Speed: Slow (0.5x), Normal (1x), Fast (2x), V.Fast (3x), S.Fast (4x)
    - Gamemode: Cube, Cube Mini, Ball, Ball Mini, UFO, UFO Mini, Robot, Robot Mini, Wave, Wave Mini
  - Speed changers: diamond-shaped portals with GD-accurate speed values (units/sec and blocks/sec)
  - Gamemode portals: oval portals with icons, GD-accurate jump force/gravity/max hold values
  - Custom image uploads (PNG): uploaded images get unique IDs and appear in a sidebar
  - Custom images persisted in IndexedDB (`gd-level-editor-assets` DB) — survive page reloads
  - Clicking a custom image in the sidebar selects it as the current tool
  - Custom images placed on grid are stored as `{ x, y, type: "custom_id" }` — no image data in level.json
  - Toolbar for built-in tool selection with visual preview
  - Object count display
  - Clear all button
  - Export: JSON-only download or full ZIP (level.json + assets.json + PNG/audio files) via JSZip
  - Level name input in toolbar (used in exports and ZIP filename)
  - Drag-and-drop PNG files or MP3/WAV audio anywhere on the editor to add as assets
  - Music support: upload MP3/WAV, play/pause controls, seekable timeline/progress bar
  - Music persisted in IndexedDB (`gd-level-editor-music` DB), single-track semantics
  - Music info (ID + filename) included in level.json; audio file bundled in ZIP exports
  - Timing/sync support: SYNC toggle stamps placed objects with current playback time
  - Objects with time values show purple badges on canvas; time field included in exports
  - Dark Geometry Dash-themed UI
- **Key files**:
  - `src/types.ts` — TypeScript types (ToolType, LevelObject, CustomImage)
  - `src/objectDefs.ts` — Built-in object definitions and canvas drawing functions
  - `src/components/LevelEditor.tsx` — Main canvas grid component (renders both built-in and custom objects)
  - `src/components/Toolbar.tsx` — Built-in tool selection toolbar
  - `src/components/CustomImageSidebar.tsx` — Sidebar for uploading/selecting custom PNG images
  - `src/lib/assetStore.ts` — IndexedDB persistence layer for custom image assets (save/load/delete)
  - `src/lib/processImageFile.ts` — Shared PNG file processing utility (used by sidebar upload and drag-and-drop)
  - `src/lib/musicStore.ts` — IndexedDB persistence for music tracks (single-track, clear-on-save)
  - `src/lib/exportLevel.ts` — Export logic for JSON-only and ZIP downloads (includes music)
  - `src/components/MusicPlayer.tsx` — Music player bar with play/pause, seek, timeline
  - `src/components/StatusBar.tsx` — Bottom status bar
  - `src/pages/EditorPage.tsx` — Root page with state management and drag-and-drop handling
