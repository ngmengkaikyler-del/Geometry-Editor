import type { LevelObject } from "../types";

function fillCol(col: number, gapTop: number, gapBot: number): LevelObject[] {
  const objs: LevelObject[] = [];
  for (let r = 0; r < 9; r++) {
    if (r >= gapTop && r <= gapBot) continue;
    objs.push({ x: col, y: r, type: "block" });
  }
  return objs;
}

function solidCol(col: number, top: number, bot: number): LevelObject[] {
  const objs: LevelObject[] = [];
  for (let r = top; r <= bot; r++) {
    objs.push({ x: col, y: r, type: "block" });
  }
  return objs;
}

function spikeEdges(col: number, gapTop: number, gapBot: number): LevelObject[] {
  const objs: LevelObject[] = [];
  if (gapTop > 0) objs.push({ x: col, y: gapTop - 1, type: "spike" });
  if (gapBot < 8) objs.push({ x: col, y: gapBot + 1, type: "spike" });
  return objs;
}

export function generateWaveTrialsLevel(): { objects: LevelObject[]; name: string; startMode: "wave" | "cube" } {
  const objs: LevelObject[] = [];

  objs.push({ x: 2, y: 4, type: "speed_slow" });
  objs.push({ x: 3, y: 4, type: "gm_wave" });

  let gap = 4;
  for (let c = 4; c <= 7; c++) {
    objs.push(...fillCol(c, gap, gap + 1));
  }

  objs.push({ x: 8, y: 4, type: "speed_normal" });

  const sec1: number[] = [4,4,3,3,3,4,4,5,5,4,4,3,3,4,4,5];
  for (let i = 0; i < sec1.length; i++) {
    const c = 9 + i;
    objs.push(...fillCol(c, sec1[i], sec1[i] + 1));
    if (i % 3 === 0) objs.push(...spikeEdges(c, sec1[i], sec1[i] + 1));
  }

  objs.push({ x: 25, y: 4, type: "speed_fast" });

  const sec2: number[] = [5,4,3,2,2,3,4,5,6,6,5,4,3,2,1,2,3,4];
  for (let i = 0; i < sec2.length; i++) {
    const c = 26 + i;
    objs.push(...fillCol(c, sec2[i], sec2[i] + 1));
    objs.push(...spikeEdges(c, sec2[i], sec2[i] + 1));
  }

  objs.push({ x: 44, y: 1, type: "coin" });

  objs.push({ x: 45, y: 4, type: "gm_wave_mini" });

  const sec3: number[] = [4,3,2,2,3,4,5,5,4,3,2,3,4,5,6,5,4,3,2,3,4,5,4,3];
  for (let i = 0; i < sec3.length; i++) {
    const c = 46 + i;
    objs.push(...fillCol(c, sec3[i], sec3[i]));
    objs.push(...spikeEdges(c, sec3[i], sec3[i]));
  }

  objs.push({ x: 70, y: 4, type: "gm_wave" });

  objs.push({ x: 71, y: 4, type: "speed_slow" });

  for (let c = 72; c <= 79; c++) {
    const g = 4;
    objs.push(...fillCol(c, g, g + 1));
  }

  objs.push({ x: 80, y: 4, type: "speed_fast" });

  const sec5: number[] = [4,3,2,1,1,2,3,4,5,6,6,5,4,3,2,1,2,3,4,5];
  for (let i = 0; i < sec5.length; i++) {
    const c = 81 + i;
    objs.push(...fillCol(c, sec5[i], sec5[i] + 1));
    objs.push(...spikeEdges(c, sec5[i], sec5[i] + 1));
  }

  objs.push({ x: 101, y: 4, type: "speed_vfast" });

  const sec6: number[] = [3,4,5,6,6,5,4,3,2,1,1,2,3,4,5,6,5,4,3,2];
  for (let i = 0; i < sec6.length; i++) {
    const c = 102 + i;
    objs.push(...fillCol(c, sec6[i], sec6[i] + 1));
    objs.push(...spikeEdges(c, sec6[i], sec6[i] + 1));
  }

  objs.push({ x: 100, y: 1, type: "coin" });

  objs.push({ x: 122, y: 4, type: "speed_normal" });

  const sec7a: number[] = [4,3,2,3,4,5];
  for (let i = 0; i < sec7a.length; i++) {
    const c = 123 + i;
    objs.push(...fillCol(c, sec7a[i], sec7a[i] + 1));
  }

  for (let c = 129; c <= 131; c++) {
    objs.push(...solidCol(c, 0, 3));
    objs.push(...solidCol(c, 6, 8));
    objs.push({ x: c, y: 3, type: "spike" });
    objs.push({ x: c, y: 6, type: "spike" });
  }

  for (let c = 132; c <= 134; c++) {
    objs.push(...solidCol(c, 0, 1));
    objs.push(...solidCol(c, 4, 8));
    objs.push({ x: c, y: 1, type: "spike" });
    objs.push({ x: c, y: 4, type: "spike" });
  }

  objs.push({ x: 136, y: 4, type: "speed_fast" });

  const sec8: number[] = [5,5,4,3,2,1,1,2,3,4,5,6,6,5,4,3,2,1];
  for (let i = 0; i < sec8.length; i++) {
    const c = 137 + i;
    objs.push(...fillCol(c, sec8[i], sec8[i] + 1));
    objs.push(...spikeEdges(c, sec8[i], sec8[i] + 1));
  }

  objs.push({ x: 155, y: 4, type: "speed_sfast" });

  const sec9: number[] = [
    3,4,5,6,6,5,4,3,2,1,
    1,2,3,4,5,6,5,4,3,2,
    1,2,3,4,5,6,6,5,4,3,
    2,1,1,2,3,4,5,6,5,4,
    3,2
  ];
  for (let i = 0; i < sec9.length; i++) {
    const c = 156 + i;
    if (c >= 199) break;
    objs.push(...fillCol(c, sec9[i], sec9[i] + 1));
    objs.push(...spikeEdges(c, sec9[i], sec9[i] + 1));
  }

  objs.push({ x: 180, y: 1, type: "coin" });

  return {
    objects: objs,
    name: "Ashley Wave Trials E",
    startMode: "cube",
  };
}
