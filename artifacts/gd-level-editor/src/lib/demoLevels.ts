import type { LevelObject } from "../types";

function walls(col: number, gapTop: number, gapBot: number): LevelObject[] {
  const objs: LevelObject[] = [];
  for (let r = 0; r < 9; r++) {
    if (r >= gapTop && r <= gapBot) continue;
    objs.push({ x: col, y: r, type: "block" });
  }
  return objs;
}

function blocks(col: number, rows: number[]): LevelObject[] {
  return rows.map(r => ({ x: col, y: r, type: "block" }));
}

function spikes(col: number, rows: number[]): LevelObject[] {
  return rows.map(r => ({ x: col, y: r, type: "spike" }));
}

function rings(col: number, rows: number[]): LevelObject[] {
  return rows.map(r => ({ x: col, y: r, type: "ring" }));
}

export function generateWaveTrialsLevel(): { objects: LevelObject[]; name: string; startMode: "wave" | "cube" } {
  const objs: LevelObject[] = [];

  objs.push(...blocks(1, [6, 7, 8]));
  objs.push(...blocks(2, [6, 7, 8]));
  objs.push(...spikes(3, [5]));
  objs.push(...blocks(3, [6, 7, 8]));
  objs.push(...blocks(4, [3, 4, 5, 6, 7, 8]));
  objs.push(...blocks(5, [3, 4, 5, 6, 7, 8]));
  objs.push(...spikes(5, [2]));
  objs.push(...blocks(6, [7, 8]));
  objs.push(...spikes(6, [6]));
  objs.push({ x: 7, y: 4, type: "orb" });
  objs.push(...blocks(8, [0, 1, 2, 3]));
  objs.push(...blocks(8, [7, 8]));
  objs.push(...spikes(8, [4]));
  objs.push(...spikes(8, [6]));
  objs.push({ x: 9, y: 4, type: "gm_wave" });
  objs.push({ x: 10, y: 4, type: "speed_slow" });

  const s1 = [5, 5, 4, 4, 3, 3, 4, 4, 5, 5, 4, 4];
  for (let i = 0; i < s1.length; i++) {
    const c = 11 + i;
    objs.push(...walls(c, s1[i], s1[i] + 1));
  }

  objs.push({ x: 23, y: 4, type: "speed_normal" });

  const s2 = [
    5, 4, 3, 3, 2, 2, 3, 4, 5, 5,
    6, 6, 5, 4, 3, 3, 4, 5, 6, 6,
    5, 4, 3, 2, 2, 3, 4, 5
  ];
  for (let i = 0; i < s2.length; i++) {
    const c = 24 + i;
    const g = s2[i];
    objs.push(...walls(c, g, g + 1));
    if (i % 3 === 0) {
      if (g > 0) objs.push({ x: c, y: g - 1, type: "spike" });
      if (g + 2 < 9) objs.push({ x: c, y: g + 2, type: "spike" });
    }
  }

  objs.push({ x: 52, y: 4, type: "speed_fast" });

  const s3 = [
    6, 5, 4, 3, 2, 1, 1, 2, 3, 4,
    5, 6, 7, 7, 6, 5, 4, 3, 2, 1,
    1, 2, 3, 4, 5, 6
  ];
  for (let i = 0; i < s3.length; i++) {
    const c = 53 + i;
    const g = s3[i];
    objs.push(...walls(c, g, g + 1));
    if (g > 0) objs.push({ x: c, y: g - 1, type: "spike" });
    if (g + 2 < 9) objs.push({ x: c, y: g + 2, type: "spike" });
  }

  objs.push({ x: 79, y: 4, type: "speed_normal" });

  objs.push(...blocks(80, [0, 1, 2]));
  objs.push(...blocks(80, [7, 8]));
  objs.push({ x: 80, y: 3, type: "spike" });
  objs.push(...blocks(82, [1, 2]));
  objs.push(...blocks(82, [6, 7]));
  objs.push({ x: 83, y: 3, type: "ring" });
  objs.push(...blocks(84, [0, 1]));
  objs.push(...blocks(84, [5, 6, 7, 8]));
  objs.push({ x: 84, y: 4, type: "spike" });
  objs.push(...blocks(86, [2, 3]));
  objs.push(...blocks(86, [6, 7]));
  objs.push({ x: 87, y: 4, type: "ring" });
  objs.push(...blocks(88, [0, 1, 2]));
  objs.push(...blocks(88, [7, 8]));
  objs.push({ x: 88, y: 3, type: "spike" });
  objs.push(...blocks(90, [1]));
  objs.push(...blocks(90, [5]));
  objs.push({ x: 90, y: 3, type: "ring" });
  objs.push(...blocks(92, [0, 1]));
  objs.push(...blocks(92, [6, 7, 8]));
  objs.push({ x: 92, y: 5, type: "spike" });
  objs.push(...blocks(94, [2, 3]));
  objs.push(...blocks(94, [7, 8]));
  objs.push({ x: 95, y: 5, type: "ring" });

  objs.push({ x: 97, y: 4, type: "speed_fast" });
  objs.push({ x: 97, y: 3, type: "gm_wave_mini" });

  const s5 = [
    4, 3, 2, 1, 1, 2, 3, 4, 5, 6,
    7, 7, 6, 5, 4, 3, 2, 1, 2, 3,
    4, 5, 6, 7
  ];
  for (let i = 0; i < s5.length; i++) {
    const c = 98 + i;
    const g = s5[i];
    objs.push(...walls(c, g, g));
    if (g > 0) objs.push({ x: c, y: g - 1, type: "spike" });
    if (g + 1 < 9) objs.push({ x: c, y: g + 1, type: "spike" });
  }

  objs.push({ x: 122, y: 4, type: "gm_wave" });
  objs.push({ x: 123, y: 4, type: "speed_vfast" });

  for (let c = 124; c <= 127; c++) {
    objs.push(...blocks(c, [0, 1, 2, 3]));
    objs.push(...blocks(c, [6, 7, 8]));
    objs.push({ x: c, y: 3, type: "spike" });
    objs.push({ x: c, y: 6, type: "spike" });
  }
  for (let c = 128; c <= 130; c++) {
    objs.push(...blocks(c, [0, 1]));
    objs.push(...blocks(c, [7, 8]));
    objs.push({ x: c, y: 2, type: "spike" });
    objs.push({ x: c, y: 6, type: "spike" });
  }
  for (let c = 131; c <= 133; c++) {
    objs.push(...blocks(c, [0, 1, 2, 3, 4]));
    objs.push(...blocks(c, [7, 8]));
    objs.push({ x: c, y: 5, type: "spike" });
    objs.push({ x: c, y: 6, type: "spike" });
  }
  for (let c = 134; c <= 136; c++) {
    objs.push(...blocks(c, [0, 1]));
    objs.push(...blocks(c, [5, 6, 7, 8]));
    objs.push({ x: c, y: 2, type: "spike" });
    objs.push({ x: c, y: 4, type: "spike" });
  }
  for (let c = 137; c <= 139; c++) {
    objs.push(...blocks(c, [0, 1, 2]));
    objs.push(...blocks(c, [6, 7, 8]));
    objs.push({ x: c, y: 3, type: "spike" });
    objs.push({ x: c, y: 5, type: "spike" });
  }

  objs.push({ x: 140, y: 4, type: "orb" });

  objs.push({ x: 141, y: 4, type: "speed_sfast" });

  const s7 = [
    5, 4, 3, 2, 1, 1, 2, 3, 4, 5,
    6, 7, 7, 6, 5, 4, 3, 2, 1, 1,
    2, 3, 4, 5, 6, 7, 6, 5, 4, 3,
    2, 1, 2, 3, 4, 5, 6, 7, 7, 6,
    5, 4, 3, 2, 1, 1, 2, 3, 4, 5,
    6, 7, 6, 5, 4, 3, 2, 1
  ];
  for (let i = 0; i < s7.length; i++) {
    const c = 142 + i;
    if (c >= 200) break;
    const g = s7[i];
    objs.push(...walls(c, g, g + 1));
    if (g > 0) objs.push({ x: c, y: g - 1, type: "spike" });
    if (g + 2 < 9) objs.push({ x: c, y: g + 2, type: "spike" });
  }

  objs.push({ x: 44, y: 1, type: "coin" });
  objs.push({ x: 110, y: 1, type: "coin" });
  objs.push({ x: 175, y: 1, type: "coin" });

  return {
    objects: objs,
    name: "Ashley Wave Trials E",
    startMode: "cube",
  };
}
