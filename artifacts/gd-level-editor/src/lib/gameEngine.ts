import type { LevelObject } from "../types";

export type PlayableMode = "cube" | "ship" | "spider" | "wave";

const TILE = 40;
const COLS = 500;
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
  gm_wave: "wave",
  gm_wave_mini: "wave",
};

const DASH_ORB_TYPES = new Set(["dash_green", "dash_pink"]);

export interface PlayerState {
  worldX: number;
  y: number;
  vy: number;
  mode: PlayableMode;
  grounded: boolean;
  dead: boolean;
  won: boolean;
  speedMultiplier: number;
  rotation: number;
  targetRotation: number;
  dashTimer: number;
  dashDirection: number;
}

export interface GameState {
  player: PlayerState;
  cameraX: number;
  targetCameraX: number;
  holding: boolean;
  startTime: number;
  elapsed: number;
}

const SOLID_TYPES = new Set(["block"]);
const RAMP_TYPE = "ramp";
const HAZARD_TYPES = new Set([
  "spike", "spike_down", "sawblade",
  "spike_purple", "spike_purple_down",
  "spike_green", "spike_green_down",
  "spike_blue", "spike_blue_down",
]);
const SPEED_TYPES = new Set(Object.keys(SPEED_MULTIPLIERS));
const GAMEMODE_TYPES = new Set(Object.keys(GAMEMODE_MAP));

function key(col: number, row: number) {
  return `${col},${row}`;
}

interface CollisionGrid {
  solids: Set<string>;
  hazardObjects: LevelObject[];
  ramps: Map<string, LevelObject>;
  portals: Map<string, LevelObject>;
}

function buildCollisionGrid(objects: LevelObject[]): CollisionGrid {
  const solids = new Set<string>();
  const hazardObjects: LevelObject[] = [];
  const ramps = new Map<string, LevelObject>();
  const portals = new Map<string, LevelObject>();

  for (const obj of objects) {
    const k = key(obj.x, obj.y);
    if (SOLID_TYPES.has(obj.type)) {
      solids.add(k);
    } else if (obj.type === RAMP_TYPE) {
      ramps.set(k, obj);
    } else if (HAZARD_TYPES.has(obj.type)) {
      hazardObjects.push(obj);
    } else if (SPEED_TYPES.has(obj.type) || GAMEMODE_TYPES.has(obj.type) || DASH_ORB_TYPES.has(obj.type)) {
      portals.set(k, obj);
    }
  }

  return { solids, hazardObjects, ramps, portals };
}

function getRampSurfaceY(ramp: LevelObject, worldX: number, playerW: number): number | null {
  const rot = ramp.rotation ?? 0;
  const rx = ramp.x * TILE;
  const ry = ramp.y * TILE;

  const playerCenterX = worldX + playerW / 2;
  const t = Math.max(0, Math.min(1, (playerCenterX - rx) / TILE));

  let surfaceY: number;
  switch (rot) {
    case 0:
      surfaceY = ry + TILE - t * TILE;
      break;
    case 90:
      surfaceY = ry + t * TILE;
      break;
    case 180:
      surfaceY = ry + t * TILE;
      break;
    case 270:
      surfaceY = ry + TILE - t * TILE;
      break;
    default:
      surfaceY = ry + TILE - t * TILE;
  }
  return surfaceY;
}

function checkRampCollision(
  grid: CollisionGrid,
  px: number, py: number, pw: number, ph: number
): { surfaceY: number; ramp: LevelObject } | null {
  const leftCol = Math.floor(px / TILE);
  const rightCol = Math.floor((px + pw - 0.01) / TILE);
  const bottomRow = Math.floor((py + ph - 0.01) / TILE);
  const topRow = Math.floor(py / TILE);

  let bestResult: { surfaceY: number; ramp: LevelObject } | null = null;

  for (let c = leftCol; c <= rightCol; c++) {
    for (let r = topRow; r <= bottomRow; r++) {
      const ramp = grid.ramps.get(key(c, r));
      if (!ramp) continue;

      const surfaceY = getRampSurfaceY(ramp, px, pw);
      if (surfaceY === null) continue;

      const playerBottom = py + ph;
      if (playerBottom > surfaceY && py < ramp.y * TILE + TILE) {
        if (!bestResult || surfaceY < bestResult.surfaceY) {
          bestResult = { surfaceY, ramp };
        }
      }
    }
  }
  return bestResult;
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
      rotation: 0,
      targetRotation: 0,
      dashTimer: 0,
      dashDirection: 0,
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

const SPIKE_UP_TYPES = new Set(["spike", "spike_purple", "spike_green", "spike_blue"]);
const SPIKE_DOWN_TYPES = new Set(["spike_down", "spike_purple_down", "spike_green_down", "spike_blue_down"]);
const SAWBLADE_TYPES = new Set(["sawblade"]);

function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function circleRectOverlap(
  cx: number, cy: number, cr: number,
  rx: number, ry: number, rw: number, rh: number
): boolean {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= cr * cr;
}

function checkHazards(grid: CollisionGrid, px: number, py: number, pw: number, ph: number): boolean {
  for (const obj of grid.hazardObjects) {
    const ox = obj.x * TILE;
    const oy = obj.y * TILE;

    if (Math.abs(ox - px) > TILE * 2 || Math.abs(oy - py) > TILE * 2) continue;

    if (SPIKE_UP_TYPES.has(obj.type)) {
      const inset = TILE * 0.25;
      const tipH = TILE * 0.45;
      const hx = ox + inset;
      const hw = TILE - inset * 2;
      const hy = oy;
      const hh = tipH;
      if (rectsOverlap(px, py, pw, ph, hx, hy, hw, hh)) return true;
    } else if (SPIKE_DOWN_TYPES.has(obj.type)) {
      const inset = TILE * 0.25;
      const tipH = TILE * 0.45;
      const hx = ox + inset;
      const hw = TILE - inset * 2;
      const hy = oy + TILE - tipH;
      const hh = tipH;
      if (rectsOverlap(px, py, pw, ph, hx, hy, hw, hh)) return true;
    } else if (SAWBLADE_TYPES.has(obj.type)) {
      const cr = TILE * 0.38;
      const ccx = ox + TILE / 2;
      const ccy = oy + TILE / 2;
      if (circleRectOverlap(ccx, ccy, cr, px, py, pw, ph)) return true;
    } else {
      const inset = TILE * 0.1;
      const hx = ox + inset;
      const hy = oy + inset;
      const hw = TILE - inset * 2;
      const hh = TILE - inset * 2;
      if (rectsOverlap(px, py, pw, ph, hx, hy, hw, hh)) return true;
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
  if (DASH_ORB_TYPES.has(portal.type)) {
    if (portal.type === "dash_green") {
      player.dashTimer = 0.6;
      player.dashDirection = 0;
      player.vy = 0;
    } else if (portal.type === "dash_pink") {
      player.dashTimer = 0.5;
      player.dashDirection = -280;
      player.vy = -280;
    }
  }
}

export function computeLevelWidth(objects: LevelObject[]): number {
  let maxCol = COLS;
  for (const obj of objects) {
    if (obj.x + 1 > maxCol) maxCol = obj.x + 1;
  }
  return (maxCol + 2) * TILE;
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
  const worldW = computeLevelWidth(objects);

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
        p.targetRotation += Math.PI / 2;
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
          p.grounded = false;
        }
      }
      break;
    }
    case "wave": {
      if (p.dashTimer > 0) {
        p.dashTimer -= realDt;
        p.vy = p.dashDirection;
        if (p.dashTimer <= 0) {
          p.dashTimer = 0;
        }
      } else {
        const waveVy = scrollSpeed * WAVE_VY_RATIO;
        if (holding) {
          p.vy = -waveVy;
        } else {
          p.vy = waveVy;
        }
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
      if (p.mode !== "wave") p.grounded = true;
    } else if (p.vy < 0) {
      const topRow = Math.floor(by / TILE);
      p.y = (topRow + 1) * TILE - PLAYER_OFFSET;
      p.vy = 0;
    }
  }

  bx = p.worldX + PLAYER_OFFSET;
  by = p.y + PLAYER_OFFSET;

  if (p.mode !== "wave") {
    const rampHit = checkRampCollision(grid, bx, by, PLAYER_W, PLAYER_H);
    if (rampHit && p.vy >= 0) {
      const newY = rampHit.surfaceY - PLAYER_H - PLAYER_OFFSET;
      if (newY < p.y || (p.y - newY < TILE * 0.5)) {
        p.y = newY;
        p.vy = 0;
        p.grounded = true;
      }
    }
  }

  bx = p.worldX + PLAYER_OFFSET;
  by = p.y + PLAYER_OFFSET;

  let groundBelow = isSolid(grid, bx, by + PLAYER_H, PLAYER_W, 2);
  if (!groundBelow && p.mode !== "wave") {
    const rampBelow = checkRampCollision(grid, bx, by + 2, PLAYER_W, PLAYER_H + 2);
    if (rampBelow) groundBelow = true;
  }
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

  if (p.mode === "cube") {
    if (!p.grounded) {
      const rotLerp = 1 - Math.pow(0.00001, realDt);
      p.rotation += (p.targetRotation - p.rotation) * rotLerp;
    } else {
      p.rotation = p.targetRotation;
    }
  }

  if (checkHazards(grid, bx, p.y + PLAYER_OFFSET, PLAYER_W, PLAYER_H)) {
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
