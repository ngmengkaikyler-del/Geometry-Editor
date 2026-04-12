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
  - 7 built-in object types: Block, Spike, Platform, Portal, Coin, Ring, Orb
  - Custom image uploads (PNG): uploaded images get unique IDs and appear in a sidebar
  - Clicking a custom image in the sidebar selects it as the current tool
  - Custom images placed on grid are stored as `{ x, y, type: "custom_id" }` — no image data in level.json
  - Toolbar for built-in tool selection with visual preview
  - Object count display
  - Clear all button
  - Export to `level.json` download
  - Dark Geometry Dash-themed UI
- **Key files**:
  - `src/types.ts` — TypeScript types (ToolType, LevelObject, CustomImage)
  - `src/objectDefs.ts` — Built-in object definitions and canvas drawing functions
  - `src/components/LevelEditor.tsx` — Main canvas grid component (renders both built-in and custom objects)
  - `src/components/Toolbar.tsx` — Built-in tool selection toolbar
  - `src/components/CustomImageSidebar.tsx` — Sidebar for uploading/selecting custom PNG images
  - `src/components/StatusBar.tsx` — Bottom status bar
  - `src/pages/EditorPage.tsx` — Root page with state management
