import type { LevelObject } from "../types";

function wallsWithGap(col: number, gapTop: number, gapBot: number): LevelObject[] {
  const objs: LevelObject[] = [];
  for (let r = 0; r < 9; r++) {
    if (r >= gapTop && r <= gapBot) continue;
    objs.push({ x: col, y: r, type: "block" });
  }
  return objs;
}

function solidRows(col: number, from: number, to: number): LevelObject[] {
  const objs: LevelObject[] = [];
  for (let r = from; r <= to; r++) {
    objs.push({ x: col, y: r, type: "block" });
  }
  return objs;
}

export function generateWaveTrialsLevel(): { objects: LevelObject[]; name: string; startMode: "wave" | "cube" } {
  const objs: LevelObject[] = [];

  objs.push({ x: 1, y: 4, type: "speed_slow" });
  objs.push({ x: 2, y: 4, type: "gm_wave" });

  const intro = [5, 5, 4, 4, 3, 3, 4, 4, 5, 5];
  for (let i = 0; i < intro.length; i++) {
    const c = 3 + i;
    const g = intro[i];
    objs.push(...wallsWithGap(c, g, g + 1));
  }

  objs.push({ x: 13, y: 4, type: "speed_normal" });

  const s1 = [5, 4, 3, 3, 2, 2, 3, 4, 5, 5, 6, 6, 5, 4, 3, 3, 4, 5, 6, 6, 5, 4, 3, 2];
  for (let i = 0; i < s1.length; i++) {
    const c = 14 + i;
    const g = s1[i];
    objs.push(...wallsWithGap(c, g, g + 1));
    if (i % 4 === 0) {
      if (g > 0) objs.push({ x: c, y: g - 1, type: "spike" });
      if (g + 2 < 9) objs.push({ x: c, y: g + 2, type: "spike" });
    }
  }

  objs.push({ x: 38, y: 4, type: "speed_fast" });

  const s2 = [3, 2, 1, 1, 2, 3, 4, 5, 6, 6, 5, 4, 3, 2, 1, 1, 2, 3];
  for (let i = 0; i < s2.length; i++) {
    const c = 39 + i;
    const g = s2[i];
    objs.push(...wallsWithGap(c, g, g + 1));
    if (g > 0) objs.push({ x: c, y: g - 1, type: "spike" });
    if (g + 2 < 9) objs.push({ x: c, y: g + 2, type: "spike" });
  }

  objs.push({ x: 57, y: 4, type: "gm_wave_mini" });

  const s3 = [4, 3, 2, 2, 3, 4, 5, 6, 6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 5, 4, 3];
  for (let i = 0; i < s3.length; i++) {
    const c = 58 + i;
    const g = s3[i];
    objs.push(...wallsWithGap(c, g, g));
    if (g > 0) objs.push({ x: c, y: g - 1, type: "spike" });
    if (g + 1 < 9) objs.push({ x: c, y: g + 1, type: "spike" });
  }

  objs.push({ x: 80, y: 4, type: "gm_wave" });
  objs.push({ x: 81, y: 4, type: "speed_slow" });

  const s4 = [4, 4, 4, 4, 5, 5, 5, 5, 4, 4, 4, 4, 3, 3, 3, 3, 4, 4];
  for (let i = 0; i < s4.length; i++) {
    const c = 82 + i;
    const g = s4[i];
    objs.push(...wallsWithGap(c, g, g + 1));
  }

  objs.push({ x: 100, y: 4, type: "speed_fast" });

  const s5 = [4, 3, 2, 1, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 1, 1, 2];
  for (let i = 0; i < s5.length; i++) {
    const c = 101 + i;
    const g = s5[i];
    objs.push(...wallsWithGap(c, g, g + 1));
    if (g > 0) objs.push({ x: c, y: g - 1, type: "spike" });
    if (g + 2 < 9) objs.push({ x: c, y: g + 2, type: "spike" });
  }

  objs.push({ x: 121, y: 4, type: "speed_vfast" });

  const s6 = [
    3, 4, 5, 6, 6, 5, 4, 3, 2, 1,
    1, 2, 3, 4, 5, 6, 5, 4, 3, 2,
    1, 1, 2, 3, 4, 5, 6, 7, 7, 6
  ];
  for (let i = 0; i < s6.length; i++) {
    const c = 122 + i;
    const g = s6[i];
    objs.push(...wallsWithGap(c, g, g + 1));
    if (g > 0) objs.push({ x: c, y: g - 1, type: "spike" });
    if (g + 2 < 9) objs.push({ x: c, y: g + 2, type: "spike" });
  }

  objs.push({ x: 152, y: 4, type: "speed_sfast" });
  objs.push({ x: 152, y: 3, type: "gm_wave_mini" });

  const s7 = [
    4, 3, 2, 1, 1, 2, 3, 4, 5, 6,
    7, 7, 6, 5, 4, 3, 2, 1, 2, 3,
    4, 5, 6, 7, 6, 5, 4, 3, 2, 1,
    2, 3, 4, 5, 6, 7, 7, 6, 5, 4,
    3, 2, 1, 1, 2, 3
  ];
  for (let i = 0; i < s7.length; i++) {
    const c = 153 + i;
    if (c >= 199) break;
    const g = s7[i];
    objs.push(...wallsWithGap(c, g, g));
    if (g > 0) objs.push({ x: c, y: g - 1, type: "spike" });
    if (g + 1 < 9) objs.push({ x: c, y: g + 1, type: "spike" });
  }

  objs.push({ x: 20, y: 1, type: "coin" });
  objs.push({ x: 70, y: 1, type: "coin" });
  objs.push({ x: 140, y: 1, type: "coin" });

  return {
    objects: objs,
    name: "Ashley Wave Trials E",
    startMode: "cube",
  };
}
