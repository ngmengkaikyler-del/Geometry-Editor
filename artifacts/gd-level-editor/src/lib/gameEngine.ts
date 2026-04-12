import type { LevelObject } from "../types";
import { SPEED_DATA } from "../objectDefs";

export type PlayableMode = "cube" | "ship" | "spider" | "wave";

const TILE = 32;
const COLS = 60;
const ROWS = 20;
const GRAVITY = 62;
const JUMP_VY = -14;
const SHIP_UP_VY = -10;
const SHIP_GRAVITY = 25;
const WAVE_SPEED = 10;
const WAVE_MINI_SPEED = 20;

const SPEED_MULTIPLIERS: Record<string, number> = {
  speed_slow: 0.7,
  speed_normal: 1,
  speed_fast: 1.4,
  speed_vfast: 1.8,
  speed_sfast: 2.3,
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
  x: number;
  y: number;
  vy: number;
  vx: number;
  mode: PlayableMode;
  grounded: boolean;
  dead: boolean;
  won: boolean;
  speedMultiplier: number;
}

export interface GameState {
  player: PlayerState;
  holding: boolean;
  startTime: number;
  elapsed: number;
}

const SOLID_TYPES = new Set(["block", "platform"]);
const HAZARD_TYPES = new Set(["spike"]);
const SPEED_TYPES = new Set(Object.keys(SPEED_MULTIPLIERS));
const GAMEMODE_TYPES = new Set(Object.keys(GAMEMODE_MAP));

interface CollisionGrid {
  solids: Set<string>;
  hazards: Set<string>;
  portals: Map<string, LevelObject>;
}

function key(col: number, row: number) {
  return `${col},${row}`;
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

export function createInitialState(startMode: PlayableMode): GameState {
  return {
    player: {
      x: 1.5 * TILE,
      y: (ROWS - 2) * TILE,
      vy: 0,
      vx: 3,
      mode: startMode,
      grounded: false,
      dead: false,
      won: false,
      speedMultiplier: 1,
    },
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
  const col = Math.floor((player.x + TILE * 0.4) / TILE);
  const row = Math.floor((player.y + TILE * 0.4) / TILE);

  for (let dc = 0; dc <= 0; dc++) {
    const portal = grid.portals.get(key(col + dc, row));
    if (!portal) continue;

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
}

const PLAYER_W = TILE * 0.8;
const PLAYER_H = TILE * 0.8;
const PLAYER_OFFSET = (TILE - PLAYER_W) / 2;

export function stepGame(state: GameState, dt: number, objects: LevelObject[]): GameState {
  const p = { ...state.player };
  if (p.dead || p.won) return { ...state, player: p };

  const grid = buildCollisionGrid(objects);
  const holding = state.holding;
  const realDt = Math.min(dt, 0.033);
  const worldW = COLS * TILE;
  const worldH = ROWS * TILE;

  const baseSpeed = 3;
  p.vx = baseSpeed * p.speedMultiplier;

  const px = p.x + PLAYER_OFFSET;
  const py = p.y + PLAYER_OFFSET;

  switch (p.mode) {
    case "cube": {
      p.vy += GRAVITY * realDt;

      const groundCheck = isSolid(grid, px, py + PLAYER_H + 1, PLAYER_W, 1);
      p.grounded = groundCheck;

      if (holding && p.grounded) {
        p.vy = JUMP_VY;
        p.grounded = false;
      }
      break;
    }
    case "ship": {
      if (holding) {
        p.vy -= SHIP_UP_VY * realDt * 4;
        if (p.vy > 0) p.vy -= SHIP_GRAVITY * realDt * 2;
        p.vy = Math.max(p.vy, -8);
      } else {
        p.vy += SHIP_GRAVITY * realDt;
        p.vy = Math.min(p.vy, 8);
      }
      p.grounded = false;
      break;
    }
    case "spider": {
      p.vy += GRAVITY * realDt;
      const groundCheck = isSolid(grid, px, py + PLAYER_H + 1, PLAYER_W, 1);
      p.grounded = groundCheck;

      if (holding && p.grounded) {
        let targetRow = Math.floor(p.y / TILE) - 1;
        while (targetRow >= 0 && !grid.solids.has(key(Math.floor(p.x / TILE), targetRow))) {
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
      const waveVy = WAVE_SPEED * p.speedMultiplier;
      if (holding) {
        p.vy = -waveVy;
      } else {
        p.vy = waveVy;
      }
      p.grounded = false;
      break;
    }
  }

  p.x += p.vx;
  p.y += p.vy;

  const ppx = p.x + PLAYER_OFFSET;
  const ppy = p.y + PLAYER_OFFSET;

  if (isSolid(grid, ppx, ppy, PLAYER_W, PLAYER_H)) {
    if (p.vy > 0) {
      p.y = Math.floor((ppy) / TILE) * TILE - PLAYER_OFFSET;
      p.vy = 0;
      p.grounded = true;
    } else if (p.vy < 0) {
      p.y = (Math.floor(ppy / TILE) + 1) * TILE - PLAYER_OFFSET;
      p.vy = 0;
    }
    if (p.vx > 0 && isSolid(grid, p.x + PLAYER_OFFSET + PLAYER_W, p.y + PLAYER_OFFSET, 1, PLAYER_H)) {
      p.dead = true;
    }
  }

  if (ppy < 0) {
    p.y = -PLAYER_OFFSET;
    p.vy = Math.max(0, p.vy);
  }
  if (ppy + PLAYER_H > worldH) {
    if (p.mode === "wave" || p.mode === "ship") {
      p.y = worldH - PLAYER_H - PLAYER_OFFSET;
      p.vy = 0;
    } else {
      p.dead = true;
    }
  }

  if (isHazard(grid, p.x + PLAYER_OFFSET, p.y + PLAYER_OFFSET, PLAYER_W, PLAYER_H)) {
    p.dead = true;
  }

  checkPortals(grid, p);

  if (p.x > worldW) {
    p.won = true;
  }

  return {
    ...state,
    player: p,
    elapsed: (performance.now() - state.startTime) / 1000,
  };
}

export { TILE, COLS, ROWS, PLAYER_W, PLAYER_H, PLAYER_OFFSET };
