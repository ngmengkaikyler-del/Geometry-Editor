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

function corridor(startCol: number, path: number[], gapSize: number): LevelObject[] {
  const objs: LevelObject[] = [];
  for (let i = 0; i < path.length; i++) {
    const c = startCol + i;
    const g = path[i];
    objs.push(...walls(c, g, g + gapSize - 1));
  }
  return objs;
}

function spikedCorridor(startCol: number, path: number[], gapSize: number): LevelObject[] {
  const objs: LevelObject[] = [];
  for (let i = 0; i < path.length; i++) {
    const c = startCol + i;
    const g = path[i];
    objs.push(...walls(c, g, g + gapSize - 1));
    if (g > 0) objs.push({ x: c, y: g - 1, type: "spike" });
    if (g + gapSize < 9) objs.push({ x: c, y: g + gapSize, type: "spike" });
  }
  return objs;
}

function vShape(startCol: number, topRow: number, depth: number, width: number): LevelObject[] {
  const objs: LevelObject[] = [];
  const half = Math.floor(width / 2);
  for (let i = 0; i <= half; i++) {
    const r = topRow + i;
    if (r < 9) {
      objs.push({ x: startCol + i, y: r, type: "block" });
      objs.push({ x: startCol + width - i, y: r, type: "block" });
    }
  }
  return objs;
}

function diamond(cx: number, cy: number, radius: number): LevelObject[] {
  const objs: LevelObject[] = [];
  for (let dy = -radius; dy <= radius; dy++) {
    const w = radius - Math.abs(dy);
    for (let dx = -w; dx <= w; dx++) {
      const r = cy + dy;
      const c = cx + dx;
      if (r >= 0 && r < 9 && c >= 0) {
        objs.push({ x: c, y: r, type: "block" });
      }
    }
  }
  return objs;
}

function sawblade(col: number, row: number): LevelObject[] {
  const objs: LevelObject[] = [];
  objs.push({ x: col, y: row, type: "spike" });
  if (row > 0) objs.push({ x: col, y: row - 1, type: "spike" });
  if (row < 8) objs.push({ x: col, y: row + 1, type: "spike" });
  if (col > 0) objs.push({ x: col - 1, y: row, type: "spike" });
  objs.push({ x: col + 1, y: row, type: "spike" });
  return objs;
}

function diagonalStripe(startCol: number, startRow: number, length: number, dir: 1 | -1): LevelObject[] {
  const objs: LevelObject[] = [];
  for (let i = 0; i < length; i++) {
    const r = startRow + i * dir;
    if (r >= 0 && r < 9) {
      objs.push({ x: startCol + i, y: r, type: "block" });
    }
  }
  return objs;
}

export function generateWaveTrialsLevel(): { objects: LevelObject[]; name: string; startMode: "wave" | "cube" } {
  const objs: LevelObject[] = [];

  // ===== SECTION 1: Cube Intro (cols 1-9) =====
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

  // ===== SECTION 2: Wave mode + Slow speed (col 9-10) =====
  objs.push({ x: 9, y: 4, type: "gm_wave" });
  objs.push({ x: 10, y: 4, type: "speed_slow" });

  // ===== SECTION 3: Slow Wave Corridors (cols 11-22) =====
  objs.push(...corridor(11, [5, 5, 4, 4, 3, 3, 4, 4, 5, 5, 4, 4], 2));

  // ===== SECTION 4: Normal speed (col 23) =====
  objs.push({ x: 23, y: 4, type: "speed_normal" });

  // ===== SECTION 5: Normal zigzag wave with spikes (cols 24-51) =====
  const s2 = [
    5, 4, 3, 3, 2, 2, 3, 4, 5, 5,
    6, 6, 5, 4, 3, 3, 4, 5, 6, 6,
    5, 4, 3, 2, 2, 3, 4, 5
  ];
  objs.push(...spikedCorridor(24, s2, 2));

  // ===== SECTION 6: Fast speed (col 52) =====
  objs.push({ x: 52, y: 4, type: "speed_fast" });

  // ===== SECTION 7: Fast V-corridors with spike edges (cols 53-78) - Large V shapes =====
  const s3 = [
    6, 5, 4, 3, 2, 1, 1, 2, 3, 4,
    5, 6, 7, 7, 6, 5, 4, 3, 2, 1,
    1, 2, 3, 4, 5, 6
  ];
  objs.push(...spikedCorridor(53, s3, 2));

  // ===== SECTION 8: W/M patterns - big V shapes with spike borders (cols 79-96) =====
  objs.push({ x: 79, y: 4, type: "speed_normal" });

  objs.push(...blocks(80, [0, 1, 2]));
  objs.push(...blocks(80, [7, 8]));
  objs.push(...spikes(80, [3]));
  objs.push({ x: 81, y: 5, type: "ring" });
  objs.push(...blocks(82, [1, 2]));
  objs.push(...blocks(82, [6, 7]));
  objs.push({ x: 83, y: 3, type: "ring" });
  objs.push(...blocks(84, [0, 1]));
  objs.push(...blocks(84, [5, 6, 7, 8]));
  objs.push(...spikes(84, [4]));
  objs.push({ x: 85, y: 2, type: "ring" });
  objs.push(...blocks(86, [2, 3]));
  objs.push(...blocks(86, [6, 7]));
  objs.push({ x: 87, y: 4, type: "ring" });
  objs.push(...blocks(88, [0, 1, 2]));
  objs.push(...blocks(88, [7, 8]));
  objs.push(...spikes(88, [3]));
  objs.push({ x: 89, y: 5, type: "ring" });
  objs.push(...blocks(90, [1]));
  objs.push(...blocks(90, [5]));
  objs.push({ x: 90, y: 3, type: "ring" });
  objs.push(...blocks(92, [0, 1]));
  objs.push(...blocks(92, [6, 7, 8]));
  objs.push(...spikes(92, [5]));
  objs.push(...blocks(94, [2, 3]));
  objs.push(...blocks(94, [7, 8]));
  objs.push({ x: 95, y: 5, type: "ring" });

  // ===== SECTION 9: Mini wave + fast (col 97) =====
  objs.push({ x: 97, y: 4, type: "speed_fast" });
  objs.push({ x: 97, y: 3, type: "gm_wave_mini" });

  // ===== SECTION 10: Mini wave tight zigzags (cols 98-121) =====
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

  // ===== SECTION 11: Regular wave + vfast (col 122-123) =====
  objs.push({ x: 122, y: 4, type: "gm_wave" });
  objs.push({ x: 123, y: 4, type: "speed_vfast" });

  // ===== SECTION 12: Block maze horizontal corridors (cols 124-139) =====
  for (let c = 124; c <= 127; c++) {
    objs.push(...blocks(c, [0, 1, 2, 3]));
    objs.push(...blocks(c, [6, 7, 8]));
  }
  objs.push(...spikes(127, [4]));
  objs.push(...spikes(127, [5]));

  for (let c = 128; c <= 130; c++) {
    objs.push(...blocks(c, [0, 1]));
    objs.push(...blocks(c, [7, 8]));
  }
  objs.push(...spikes(128, [2]));
  objs.push(...spikes(130, [6]));

  for (let c = 131; c <= 133; c++) {
    objs.push(...blocks(c, [0, 1, 2, 3, 4]));
    objs.push(...blocks(c, [7, 8]));
  }
  objs.push(...spikes(131, [5]));
  objs.push(...spikes(133, [6]));

  for (let c = 134; c <= 136; c++) {
    objs.push(...blocks(c, [0, 1]));
    objs.push(...blocks(c, [5, 6, 7, 8]));
  }
  objs.push(...spikes(134, [2]));
  objs.push(...spikes(136, [4]));

  for (let c = 137; c <= 139; c++) {
    objs.push(...blocks(c, [0, 1, 2]));
    objs.push(...blocks(c, [6, 7, 8]));
  }
  objs.push(...spikes(137, [3]));
  objs.push(...spikes(139, [5]));

  objs.push({ x: 140, y: 4, type: "orb" });

  // ===== SECTION 13: Super fast zigzags (cols 141-198) =====
  objs.push({ x: 141, y: 4, type: "speed_sfast" });

  const s7 = [
    5, 4, 3, 2, 1, 1, 2, 3, 4, 5,
    6, 7, 7, 6, 5, 4, 3, 2, 1, 1,
    2, 3, 4, 5, 6, 7, 6, 5, 4, 3,
    2, 1, 2, 3, 4, 5, 6, 7, 7, 6,
    5, 4, 3, 2, 1, 1, 2, 3, 4, 5,
    6, 7, 6, 5, 4, 3, 2, 1
  ];
  objs.push(...spikedCorridor(142, s7, 2));

  // ===== SECTION 14: Transition — big W/hexagon patterns (cols 200-220) =====
  objs.push({ x: 200, y: 4, type: "speed_fast" });

  const wPat = [
    6, 5, 4, 3, 2, 3, 4, 5, 6, 7,
    6, 5, 4, 3, 2, 3, 4, 5, 6, 7, 6
  ];
  objs.push(...spikedCorridor(201, wPat, 2));

  // ===== SECTION 15: Large V-shapes with spike edges (cols 221-250) =====
  objs.push({ x: 221, y: 4, type: "speed_normal" });

  for (let c = 222; c <= 225; c++) {
    objs.push(...blocks(c, [0, 1]));
    objs.push(...spikes(c, [2]));
  }
  for (let c = 226; c <= 229; c++) {
    objs.push(...blocks(c, [0, 1, 2, 3]));
    objs.push(...spikes(c, [4]));
  }
  for (let c = 230; c <= 233; c++) {
    objs.push(...blocks(c, [0, 1]));
    objs.push(...spikes(c, [2]));
  }
  objs.push({ x: 234, y: 5, type: "ring" });

  objs.push(...blocks(235, [7, 8]));
  objs.push(...blocks(236, [6, 7, 8]));
  objs.push(...blocks(237, [5, 6, 7, 8]));
  objs.push(...spikes(237, [4]));
  objs.push(...blocks(238, [6, 7, 8]));
  objs.push(...blocks(239, [7, 8]));

  objs.push({ x: 240, y: 3, type: "ring" });

  for (let c = 241; c <= 244; c++) {
    objs.push(...blocks(c, [0, 1, 2]));
    objs.push(...blocks(c, [6, 7, 8]));
    objs.push(...spikes(c, [3]));
    objs.push(...spikes(c, [5]));
  }
  objs.push({ x: 245, y: 4, type: "orb" });

  for (let c = 246; c <= 249; c++) {
    const r = c % 2 === 0 ? [0, 1] : [7, 8];
    objs.push(...blocks(c, r));
    if (c % 2 === 0) objs.push(...spikes(c, [2]));
    else objs.push(...spikes(c, [6]));
  }

  // ===== SECTION 16: Sawblade scatter + V-zigzag spikes (cols 250-280) =====
  objs.push({ x: 250, y: 4, type: "speed_fast" });

  objs.push(...sawblade(252, 2));
  objs.push(...sawblade(255, 6));
  objs.push(...sawblade(258, 3));
  objs.push(...sawblade(261, 5));
  objs.push({ x: 254, y: 4, type: "ring" });
  objs.push({ x: 260, y: 4, type: "ring" });

  for (let c = 264; c <= 267; c++) {
    objs.push(...blocks(c, [0, 1]));
    objs.push(...blocks(c, [7, 8]));
  }
  objs.push(...spikes(264, [2]));
  objs.push(...spikes(267, [6]));
  objs.push(...sawblade(266, 4));
  objs.push({ x: 268, y: 4, type: "orb" });

  const vzig = [
    7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6
  ];
  objs.push(...spikedCorridor(269, vzig, 2));

  // ===== SECTION 17: X-pattern sawblades (cols 281-300) =====
  objs.push({ x: 281, y: 4, type: "speed_vfast" });

  for (let i = 0; i < 5; i++) {
    const c = 282 + i * 4;
    objs.push(...sawblade(c, 1 + i));
    objs.push(...sawblade(c + 2, 7 - i));
  }

  objs.push({ x: 283, y: 4, type: "ring" });
  objs.push({ x: 287, y: 4, type: "ring" });
  objs.push({ x: 291, y: 4, type: "ring" });
  objs.push({ x: 295, y: 4, type: "ring" });
  objs.push({ x: 299, y: 4, type: "ring" });

  // ===== SECTION 18: Speed orb section + block houses (cols 300-330) =====
  objs.push({ x: 300, y: 4, type: "speed_fast" });
  objs.push({ x: 301, y: 4, type: "orb" });

  objs.push(...blocks(303, [5, 6, 7, 8]));
  objs.push(...blocks(304, [4, 5, 6, 7, 8]));
  objs.push(...blocks(305, [3, 4, 5, 6, 7, 8]));
  objs.push(...blocks(306, [4, 5, 6, 7, 8]));
  objs.push(...blocks(307, [5, 6, 7, 8]));
  objs.push(...spikes(303, [4]));
  objs.push(...spikes(307, [4]));

  objs.push({ x: 309, y: 3, type: "ring" });

  objs.push(...blocks(311, [0, 1, 2]));
  objs.push(...blocks(312, [0, 1, 2, 3]));
  objs.push(...blocks(313, [0, 1, 2, 3, 4]));
  objs.push(...blocks(314, [0, 1, 2, 3]));
  objs.push(...blocks(315, [0, 1, 2]));
  objs.push(...spikes(313, [5]));
  objs.push(...sawblade(310, 6));
  objs.push(...sawblade(316, 6));

  objs.push({ x: 318, y: 4, type: "speed_vfast" });
  objs.push({ x: 319, y: 4, type: "orb" });

  objs.push(...blocks(321, [6, 7, 8]));
  objs.push(...blocks(322, [5, 6, 7, 8]));
  objs.push(...blocks(323, [5, 6, 7, 8]));
  objs.push(...blocks(324, [6, 7, 8]));
  objs.push(...spikes(321, [5]));
  objs.push(...spikes(324, [5]));

  objs.push(...blocks(326, [0, 1]));
  objs.push(...blocks(327, [0, 1, 2]));
  objs.push(...blocks(328, [0, 1, 2]));
  objs.push(...blocks(329, [0, 1]));
  objs.push(...spikes(326, [2]));
  objs.push(...spikes(329, [3]));
  objs.push(...sawblade(325, 4));
  objs.push(...sawblade(330, 4));

  // ===== SECTION 19: Diagonal triangle + pentagon blocks (cols 331-350) =====
  objs.push({ x: 331, y: 4, type: "speed_fast" });

  for (let i = 0; i < 6; i++) {
    objs.push(...blocks(332 + i, [8 - i, 7 - Math.max(0, i - 1)]));
  }
  objs.push(...spikes(337, [2]));
  objs.push(...sawblade(335, 1));
  objs.push(...sawblade(338, 7));

  objs.push({ x: 340, y: 4, type: "orb" });

  objs.push(...blocks(342, [6, 7, 8]));
  objs.push(...blocks(343, [5, 6, 7, 8]));
  objs.push(...blocks(344, [4, 5, 6, 7, 8]));
  objs.push(...blocks(345, [4, 5, 6, 7, 8]));
  objs.push(...blocks(346, [5, 6, 7, 8]));
  objs.push(...blocks(347, [6, 7, 8]));
  objs.push(...spikes(344, [3]));
  objs.push(...spikes(345, [3]));

  objs.push(...blocks(349, [0, 1]));
  objs.push(...blocks(350, [0, 1, 2]));

  // ===== SECTION 20: Diamond patterns (cols 351-385) =====
  objs.push({ x: 351, y: 4, type: "speed_normal" });

  objs.push(...diamond(354, 4, 2));
  objs.push(...sawblade(352, 1));
  objs.push({ x: 357, y: 4, type: "ring" });

  objs.push(...diamond(360, 3, 2));
  objs.push(...sawblade(363, 7));
  objs.push({ x: 358, y: 6, type: "orb" });

  objs.push(...diamond(366, 5, 2));
  objs.push(...sawblade(364, 1));
  objs.push({ x: 369, y: 3, type: "ring" });

  objs.push({ x: 371, y: 4, type: "speed_fast" });

  objs.push(...diamond(374, 4, 3));
  objs.push({ x: 378, y: 2, type: "orb" });
  objs.push({ x: 378, y: 6, type: "orb" });

  objs.push(...diamond(381, 2, 2));
  objs.push(...diamond(381, 6, 2));
  objs.push(...sawblade(384, 4));

  // ===== SECTION 21: Diamond V-shapes + orbs (cols 386-405) =====
  objs.push({ x: 386, y: 4, type: "speed_vfast" });

  for (let i = 0; i < 4; i++) {
    const c = 387 + i * 2;
    objs.push(...blocks(c, [i, 8 - i]));
    objs.push(...blocks(c + 1, [i, 8 - i]));
    objs.push(...spikes(c, [i + 1]));
    if (8 - i - 1 >= 0) objs.push(...spikes(c, [7 - i]));
  }
  objs.push({ x: 395, y: 4, type: "orb" });

  for (let i = 0; i < 4; i++) {
    const c = 396 + i * 2;
    objs.push(...blocks(c, [3 - i, 5 + i]));
    objs.push(...blocks(c + 1, [3 - i, 5 + i]));
  }
  objs.push({ x: 404, y: 4, type: "ring" });

  // ===== SECTION 22: Diagonal stripes (cols 406-430) =====
  objs.push({ x: 406, y: 4, type: "speed_fast" });

  for (let i = 0; i < 4; i++) {
    objs.push(...diagonalStripe(407 + i * 6, 0, 5, 1));
    objs.push({ x: 409 + i * 6, y: i % 2 === 0 ? 6 : 1, type: "orb" });
  }

  for (let i = 0; i < 3; i++) {
    objs.push(...diagonalStripe(409 + i * 6, 8, 5, -1));
  }

  objs.push({ x: 430, y: 4, type: "speed_normal" });

  // ===== SECTION 23: Arrow zigzag patterns (cols 431-455) =====
  const arrows = [
    6, 5, 4, 3, 2, 1, 2, 3, 4, 5,
    6, 7, 6, 5, 4, 3, 2, 1, 2, 3,
    4, 5, 6, 7, 6
  ];
  for (let i = 0; i < arrows.length; i++) {
    const c = 431 + i;
    const g = arrows[i];
    objs.push(...walls(c, g, g + 1));
    if (i % 4 === 0) {
      objs.push({ x: c, y: g, type: "spike" });
    }
  }

  // ===== SECTION 24: Mountain spikes (cols 456-475) =====
  objs.push({ x: 456, y: 4, type: "speed_fast" });

  objs.push(...blocks(457, [7, 8]));
  objs.push(...blocks(458, [6, 7, 8]));
  objs.push(...blocks(459, [5, 6, 7, 8]));
  objs.push(...spikes(459, [4]));
  objs.push(...blocks(460, [6, 7, 8]));
  objs.push(...blocks(461, [7, 8]));

  objs.push(...blocks(463, [7, 8]));
  objs.push(...blocks(464, [6, 7, 8]));
  objs.push(...blocks(465, [5, 6, 7, 8]));
  objs.push(...blocks(466, [4, 5, 6, 7, 8]));
  objs.push(...spikes(466, [3]));
  objs.push(...blocks(467, [5, 6, 7, 8]));
  objs.push(...blocks(468, [6, 7, 8]));
  objs.push(...blocks(469, [7, 8]));

  objs.push(...blocks(471, [0, 1]));
  objs.push(...blocks(472, [0, 1, 2]));
  objs.push(...blocks(473, [0, 1, 2, 3]));
  objs.push(...spikes(473, [4]));
  objs.push(...blocks(474, [0, 1, 2]));
  objs.push(...blocks(475, [0, 1]));

  objs.push({ x: 476, y: 4, type: "speed_vfast" });
  objs.push({ x: 477, y: 4, type: "orb" });

  // ===== SECTION 25: Dense finale — diamond grid + sawblades + rings (cols 478-520) =====
  objs.push({ x: 478, y: 4, type: "speed_sfast" });

  for (let i = 0; i < 8; i++) {
    const c = 479 + i * 5;
    objs.push(...diamond(c, 4, 1));
    objs.push(...sawblade(c + 2, 2));
    objs.push(...sawblade(c + 2, 6));
    objs.push({ x: c + 3, y: 4, type: "ring" });
  }

  objs.push(...blocks(519, [0, 1, 2]));
  objs.push(...blocks(519, [6, 7, 8]));
  objs.push(...spikes(519, [3]));
  objs.push(...spikes(519, [5]));

  objs.push(...blocks(520, [0, 1]));
  objs.push(...blocks(520, [7, 8]));

  for (let i = 0; i < 6; i++) {
    const c = 521 + i * 3;
    objs.push(...sawblade(c, 1 + i % 3));
    objs.push(...sawblade(c + 1, 6 - i % 3));
    objs.push({ x: c + 2, y: 4, type: "ring" });
  }

  objs.push(...blocks(540, [0, 1, 2, 3]));
  objs.push(...blocks(540, [5, 6, 7, 8]));
  objs.push(...spikes(540, [4]));

  for (let i = 0; i < 4; i++) {
    const c = 541 + i * 4;
    objs.push(...diamond(c + 1, 4, 2));
    objs.push(...sawblade(c + 3, 1));
    objs.push(...sawblade(c + 3, 7));
  }

  objs.push({ x: 557, y: 4, type: "ring" });
  objs.push({ x: 558, y: 4, type: "orb" });

  for (let c = 559; c <= 562; c++) {
    objs.push(...blocks(c, [0, 1, 2, 3]));
    objs.push(...blocks(c, [5, 6, 7, 8]));
  }
  objs.push(...spikes(559, [4]));
  objs.push(...spikes(562, [4]));

  objs.push({ x: 564, y: 4, type: "speed_normal" });

  const finale = [
    5, 4, 3, 2, 1, 2, 3, 4, 5, 6,
    7, 6, 5, 4, 3, 2, 3, 4, 5, 6
  ];
  objs.push(...spikedCorridor(565, finale, 2));

  return {
    objects: objs,
    name: "Ashley Wave Trials E",
    startMode: "cube",
  };
}
