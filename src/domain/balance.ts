export type AttributeId = 'str' | 'vit' | 'agi' | 'wis';

export interface LevelRequirement {
  level: number;
  expToNext: number;
}

export const LEVEL_EXP_TABLE: readonly LevelRequirement[] = [
  { level: 1, expToNext: 120 },
  { level: 2, expToNext: 150 },
  { level: 3, expToNext: 190 },
  { level: 4, expToNext: 230 },
  { level: 5, expToNext: 280 },
  { level: 6, expToNext: 340 },
  { level: 7, expToNext: 400 },
  { level: 8, expToNext: 470 },
  { level: 9, expToNext: 540 },
  { level: 10, expToNext: 620 },
  { level: 11, expToNext: 710 },
  { level: 12, expToNext: 810 },
  { level: 13, expToNext: 920 },
  { level: 14, expToNext: 1040 },
  { level: 15, expToNext: 1170 },
  { level: 16, expToNext: 1310 },
  { level: 17, expToNext: 1460 },
  { level: 18, expToNext: 1620 },
  { level: 19, expToNext: 1790 },
  { level: 20, expToNext: 1970 },
  { level: 21, expToNext: 2160 },
  { level: 22, expToNext: 2360 },
  { level: 23, expToNext: 2570 },
  { level: 24, expToNext: 2790 },
  { level: 25, expToNext: 3020 },
  { level: 26, expToNext: 3260 },
  { level: 27, expToNext: 3510 },
  { level: 28, expToNext: 3770 },
  { level: 29, expToNext: 4040 },
];

export const LEVEL_CAP = LEVEL_EXP_TABLE[LEVEL_EXP_TABLE.length - 1].level + 1;

export type AttributeGrowthCurves = Record<AttributeId, readonly number[]>;

export const ATTRIBUTE_GROWTH_CURVES: AttributeGrowthCurves = {
  str: [
    2, 2, 3, 3, 4, 3, 4, 4, 5, 4, 5, 5, 6, 6, 7, 6, 7, 7, 8, 8, 9, 8, 9, 9, 10,
    10, 11, 11, 12,
  ],
  vit: [
    3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10,
    11, 11, 11, 12, 12,
  ],
  agi: [
    1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9,
    10, 10, 10, 11,
  ],
  wis: [
    1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9,
    9, 10, 10, 10,
  ],
};

export function getLevelRequirement(level: number): LevelRequirement | undefined {
  return LEVEL_EXP_TABLE.find((entry) => entry.level === level);
}
