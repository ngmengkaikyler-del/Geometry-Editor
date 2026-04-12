import type { LevelObject } from "../types";

export type PlayableMode = "cube" | "ship" | "spider" | "wave";

const TILE = 40;
const COLS = 200;
const ROWS = 10;

const VIEWPORT_W = 960;
const VIEWPORT_H = ROWS * TILE;
const GROUND_Y = (ROWS - 1) * TILE;

const BASE_SCROLL_SPEED = 340;

const GRAVITY = 2800;
const JUMP_VY = -900;
const SHIP_THRUST = -2200;
const SHIP_GRAVITY = 1400;
const SHIP_MAX_VY = 500;
const WAVE_VY_RATIO = 1;

const SPEED_MULTIPLIERS: Record<string, number> = {
  speed_slow: 0.8,
  speed_normal: 1,
  speed_fast: 1.25,
  speed_vfast: 1.6,
  speed_sfast: 2,
};

const GAMEMODE_MAP: Record<string, PlayableMode> = {
  gm_cube: "cube",
  gm_cube_mini: "cube",
  gm_ball: "cube",
  gm_ball_mini: "cube",
  gm_ufo: "ship",
  gm_ufo_mini: "ship",
  gm_robot: "cube",
  gm_robot_mini: "cube",
  gm_wave: "wave",
  gm_wave_mini: "wave",
};

export interface PlayerState {
  worldX: number;
  y: number;
  vy: number;
  mode: PlayableMode;
  grounded: boolean;
  dead: boolean;
  won: boolean;
  speedMultiplier: number;
}

export interface GameState {
  player: PlayerState;
  cameraX: number;
  targetCameraX: number;
  holding: boolean;
  startTime: number;
  elapsed: number;
}

const SOLID_TYPES = new Set(["block", "platform"]);
const HAZARD_TYPES = new Set(["spike"]);
const SPEED_TYPES = new Set(Object.keys(SPEED_MULTIPLIERS));
const GAMEMODE_TYPES = new Set(Object.keys(GAMEMODE_MAP));

function key(col: number, row: number) {
  return `${col},${row}`;
}

interface CollisionGrid {
  solids: Set<string>;
  hazards: Set<string>;
  portals: Map<string, LevelObject>;
}

function buildCollisionGrid(objects: LevelObject[]): CollisionGrid {
  const solids = new Set<string>();
  const hazards = new Set<string>();
  const portals = new Map<string, LevelObject>();

  for (const obj of objects) {
    const k = key(obj.x, obj.y);
    if (SOLID_TYPES.has(obj.type)) {
      solids.add(k);
    } else if (HAZARD_TYPES.has(obj.type)) {
      hazards.add(k);
    } else if (SPEED_TYPES.has(obj.type) || GAMEMODE_TYPES.has(obj.type)) {
      portals.set(k, obj);
    }
  }

  return { solids, hazards, portals };
}

const PLAYER_SCREEN_X = 160;

const PLAYER_W = TILE * 0.85;
const PLAYER_H = TILE * 0.85;
const PLAYER_OFFSET = (TILE - PLAYER_W) / 2;

export function createInitialState(startMode: PlayableMode): GameState {
  return {
    player: {
      worldX: PLAYER_SCREEN_X,
      y: GROUND_Y - PLAYER_H - PLAYER_OFFSET,
      vy: 0,
      mode: startMode,
      grounded: false,
      dead: false,
      won: false,
      speedMultiplier: 1,
    },
    cameraX: 0,
    targetCameraX: 0,
    holding: false,
    startTime: performance.now(),
    elapsed: 0,
  };
}

function isSolid(grid: CollisionGrid, px: number, py: number, w: number, h: number): boolean {
  const left = Math.floor(px / TILE);
  const right = Math.floor((px + w - 0.01) / TILE);
  const top = Math.floor(py / TILE);
  const bottom = Math.floor((py + h - 0.01) / TILE);

  for (let c = left; c <= right; c++) {
    for (let r = top; r <= bottom; r++) {
      if (grid.solids.has(key(c, r))) return true;
    }
  }
  return false;
}

function isHazard(grid: CollisionGrid, px: number, py: number, w: number, h: number): boolean {
  const left = Math.floor(px / TILE);
  const right = Math.floor((px + w - 0.01) / TILE);
  const top = Math.floor(py / TILE);
  const bottom = Math.floor((py + h - 0.01) / TILE);

  for (let c = left; c <= right; c++) {
    for (let r = top; r <= bottom; r++) {
      if (grid.hazards.has(key(c, r))) return true;
    }
  }
  return false;
}

function checkPortals(grid: CollisionGrid, player: PlayerState) {
  const col = Math.floor((player.worldX + PLAYER_OFFSET + PLAYER_W * 0.5) / TILE);
  const row = Math.floor((player.y + PLAYER_OFFSET + PLAYER_H * 0.5) / TILE);

  const portal = grid.portals.get(key(col, row));
  if (!portal) return;

  if (SPEED_TYPES.has(portal.type)) {
    player.speedMultiplier = SPEED_MULTIPLIERS[portal.type] ?? 1;
  }
  if (GAMEMODE_TYPES.has(portal.type)) {
    const newMode = GAMEMODE_MAP[portal.type];
    if (newMode && newMode !== player.mode) {
      player.mode = newMode;
      player.vy = 0;
    }
  }
}

export function stepGame(state: GameState, dt: number, objects: LevelObject[]): GameState {
  const p = { ...state.player };
  let camX = state.cameraX;
  let targetCamX = state.targetCameraX;

  if (p.dead || p.won) {
    return { ...state, player: p, cameraX: camX, targetCameraX: targetCamX };
  }

  const grid = buildCollisionGrid(objects);
  const holding = state.holding;
  const realDt = Math.min(dt, 0.033);
  const worldH = ROWS * TILE;
  const worldW = COLS * TILE;

  const scrollSpeed = BASE_SCROLL_SPEED * p.speedMultiplier;

  targetCamX += scrollSpeed * realDt;

  const maxCameraX = Math.max(0, worldW - VIEWPORT_W);
  targetCamX = Math.min(targetCamX, maxCameraX);

  const lerpFactor = 1 - Math.pow(0.0001, realDt);
  camX += (targetCamX - camX) * lerpFactor;
  camX = Math.max(0, Math.min(camX, maxCameraX));

  p.worldX = camX + PLAYER_SCREEN_X;

  switch (p.mode) {
    case "cube": {
      p.vy += GRAVITY * realDt;
      if (holding && p.grounded) {
        p.vy = JUMP_VY;
        p.grounded = false;
      }
      break;
    }
    case "ship": {
      if (holding) {
        p.vy += SHIP_THRUST * realDt;
        p.vy = Math.max(p.vy, -SHIP_MAX_VY);
      } else {
        p.vy += SHIP_GRAVITY * realDt;
        p.vy = Math.min(p.vy, SHIP_MAX_VY);
      }
      p.grounded = false;
      break;
    }
    case "spider": {
      p.vy += GRAVITY * realDt;
      if (holding && p.grounded) {
        const playerCol = Math.floor((p.worldX + TILE * 0.5) / TILE);
        let targetRow = Math.floor(p.y / TILE) - 1;
        while (targetRow >= 0 && !grid.solids.has(key(playerCol, targetRow))) {
          targetRow--;
        }
        if (targetRow >= 0) {
          p.y = (targetRow + 1) * TILE;
          p.vy = 0;
        }
      }
      break;
    }
    case "wave": {
      const waveVy = scrollSpeed * WAVE_VY_RATIO;
      if (holding) {
        p.vy = -waveVy;
      } else {
        p.vy = waveVy;
      }
      p.grounded = false;
      break;
    }
  }

  p.y += p.vy * realDt;

  let bx = p.worldX + PLAYER_OFFSET;
  let by = p.y + PLAYER_OFFSET;

  if (isSolid(grid, bx, by, PLAYER_W, PLAYER_H)) {
    if (p.vy > 0) {
      const bottomRow = Math.floor((by + PLAYER_H - 0.01) / TILE);
      p.y = bottomRow * TILE - PLAYER_H - PLAYER_OFFSET;
      p.vy = 0;
      p.grounded = true;
    } else if (p.vy < 0) {
      const topRow = Math.floor(by / TILE);
      p.y = (topRow + 1) * TILE - PLAYER_OFFSET;
      p.vy = 0;
    }
  }

  bx = p.worldX + PLAYER_OFFSET;
  by = p.y + PLAYER_OFFSET;

  const groundBelow = isSolid(grid, bx, by + PLAYER_H, PLAYER_W, 2);
  if (p.mode === "cube" || p.mode === "spider") {
    p.grounded = groundBelow;
  }

  const wallInset = 6;
  if (isSolid(grid, bx + PLAYER_W, by + wallInset, 2, PLAYER_H - wallInset * 2)) {
    p.dead = true;
  }

  if (by < 0) {
    p.y = -PLAYER_OFFSET;
    if (p.vy < 0) p.vy = 0;
  }

  if (by + PLAYER_H > GROUND_Y) {
    p.y = GROUND_Y - PLAYER_H - PLAYER_OFFSET;
    if (p.vy > 0) p.vy = 0;
    if (p.mode === "cube" || p.mode === "spider") {
      p.grounded = true;
    }
  }

  if (isHazard(grid, bx, p.y + PLAYER_OFFSET, PLAYER_W, PLAYER_H)) {
    p.dead = true;
  }

  checkPortals(grid, p);

  if (p.worldX > worldW) {
    p.won = true;
  }

  return {
    ...state,
    player: p,
    cameraX: camX,
    targetCameraX: targetCamX,
    elapsed: (performance.now() - state.startTime) / 1000,
  };
}

export { TILE, COLS, ROWS, PLAYER_W, PLAYER_H, PLAYER_OFFSET, PLAYER_SCREEN_X, VIEWPORT_W, VIEWPORT_H };
