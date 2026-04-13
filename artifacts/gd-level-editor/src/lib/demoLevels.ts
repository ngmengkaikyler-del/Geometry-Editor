import type { LevelObject } from "../types";

function fillColumn(col: number, gapTop: number, gapBot: number, spikeEdges: boolean = true): LevelObject[] {
  const objs: LevelObject[] = [];
  for (let r = 0; r < 9; r++) {
    if (r >= gapTop && r <= gapBot) continue;
    objs.push({ x: col, y: r, type: "block" });
  }
  if (spikeEdges && gapTop > 0) {
    objs.push({ x: col, y: gapTop - 1, type: "spike" });
  }
  return objs;
}

export function generateWaveTrialsLevel(): { objects: LevelObject[]; name: string; startMode: "wave" | "cube" } {
  const objs: LevelObject[] = [];

  for (let c = 3; c <= 5; c++) {
    objs.push({ x: c, y: 7, type: "block" });
    objs.push({ x: c, y: 8, type: "block" });
  }
  objs.push({ x: 4, y: 6, type: "spike" });

  objs.push({ x: 8, y: 4, type: "gm_wave" });
  objs.push({ x: 9, y: 4, type: "speed_fast" });

  let gap = 4;
  for (let c = 12; c <= 22; c++) {
    objs.push(...fillColumn(c, gap, gap + 1));
    if (c % 3 === 0 && gap > 1) gap--;
    if (c % 4 === 0 && gap < 6) gap++;
  }

  for (let c = 24; c <= 28; c++) {
    const g = 2;
    objs.push(...fillColumn(c, g, g + 1));
  }
  for (let c = 29; c <= 33; c++) {
    const g = 5;
    objs.push(...fillColumn(c, g, g + 1));
  }
  for (let c = 34; c <= 38; c++) {
    const g = 3;
    objs.push(...fillColumn(c, g, g + 1));
  }

  objs.push({ x: 40, y: 4, type: "speed_vfast" });

  let gapPos = 3;
  const dir1 = [3,3,4,4,5,5,6,6,5,5,4,4,3,3,2,2,3,3,4,4];
  for (let i = 0; i < dir1.length; i++) {
    const c = 42 + i;
    gapPos = dir1[i];
    objs.push(...fillColumn(c, gapPos, gapPos + 1));
  }

  objs.push({ x: 63, y: 4, type: "speed_normal" });

  for (let c = 65; c <= 70; c++) {
    objs.push(...fillColumn(c, 4, 5, false));
  }
  for (let c = 71; c <= 75; c++) {
    objs.push(...fillColumn(c, 2, 3, false));
  }
  for (let c = 76; c <= 80; c++) {
    objs.push(...fillColumn(c, 5, 6, false));
  }
  for (let c = 81; c <= 85; c++) {
    objs.push(...fillColumn(c, 3, 4, false));
  }

  objs.push({ x: 87, y: 4, type: "speed_fast" });

  const wave2 = [4,4,3,3,2,2,1,1,2,2,3,3,4,4,5,5,6,6,5,5,4,4,3,3];
  for (let i = 0; i < wave2.length; i++) {
    const c = 89 + i;
    objs.push(...fillColumn(c, wave2[i], wave2[i] + 1));
  }

  objs.push({ x: 114, y: 4, type: "speed_sfast" });

  const tight1 = [3,4,5,5,4,3,2,2,3,4,5,6,6,5,4,3];
  for (let i = 0; i < tight1.length; i++) {
    const c = 116 + i;
    objs.push(...fillColumn(c, tight1[i], tight1[i] + 1));
  }

  objs.push({ x: 133, y: 4, type: "speed_normal" });

  for (let c = 135; c <= 140; c++) {
    objs.push(...fillColumn(c, 4, 5, false));
    objs.push({ x: c, y: 3, type: "spike" });
    objs.push({ x: c, y: 6, type: "spike" });
  }

  objs.push({ x: 142, y: 4, type: "speed_fast" });

  const zigzag = [6,5,4,3,2,1,2,3,4,5,6,5,4,3,2,1,2,3,4,5,6,5,4,3];
  for (let i = 0; i < zigzag.length; i++) {
    const c = 144 + i;
    objs.push(...fillColumn(c, zigzag[i], zigzag[i] + 1));
  }

  objs.push({ x: 169, y: 4, type: "speed_vfast" });

  const finale = [4,3,2,2,3,4,5,6,6,5,4,3,2,1,1,2,3,4,5,6,6,5,4,3,2,2,3,4];
  for (let i = 0; i < finale.length; i++) {
    const c = 171 + i;
    if (c >= 200) break;
    objs.push(...fillColumn(c, finale[i], finale[i] + 1));
  }

  objs.push({ x: 10, y: 1, type: "coin" });
  objs.push({ x: 50, y: 1, type: "coin" });
  objs.push({ x: 100, y: 1, type: "coin" });

  return {
    objects: objs,
    name: "Wave Trials",
    startMode: "cube",
  };
}
