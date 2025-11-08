import type { AttributeKey } from './models';

export const MAX_LEVEL = 20;

/**
 * 等级经验需求（index 对应等级，0 占位；Lv1->Lv2 使用 LEVEL_EXP_CURVE[2]）
 */
export const LEVEL_EXP_CURVE: number[] = [
  0,
  0,
  120,
  260,
  450,
  700,
  1_020,
  1_400,
  1_850,
  2_370,
  2_970,
  3_650,
  4_410,
  5_250,
  6_170,
  7_170,
  8_250,
  9_410,
  10_650,
  11_970,
];

/**
 * 四维成长曲线：index 0 代表 Lv1 的基础值。
 */
export const ATTRIBUTE_GROWTH_CURVE: Record<AttributeKey, number[]> = {
  power: [14, 18, 22, 27, 33, 40, 48, 57, 67, 78, 90, 103, 117, 132, 148, 165, 183, 202, 222, 243],
  skill: [12, 15, 19, 23, 28, 34, 41, 49, 58, 68, 79, 91, 104, 118, 133, 149, 166, 184, 203, 223],
  vitality: [16, 21, 27, 34, 42, 51, 61, 72, 84, 97, 111, 126, 142, 159, 177, 196, 216, 237, 259, 282],
  agility: [13, 16, 20, 25, 31, 38, 46, 55, 65, 76, 88, 101, 115, 130, 146, 163, 181, 200, 220, 241],
};

export const HP_PER_VITALITY = 12;
export const DEFENSE_PER_VITALITY = 0.35;
export const BASE_HIT_RATE = 0.78;
export const HIT_RATE_PER_AGILITY = 0.0025;
export const MIN_HIT_RATE = 0.1;
export const MAX_HIT_RATE = 0.97;
export const BASE_CRIT_RATE = 0.1;
export const CRIT_PER_SKILL = 0.0015;
export const CRIT_MULTIPLIER = 1.6;
export const DAMAGE_VARIANCE = 0.12;
export const LEVEL_DAMAGE_SCALE = 0.03;
export const MAX_TURNS = 60;

export const BASIC_ATTACK_SCALING = {
  base: 8,
  ratios: {
    power: 0.9,
    skill: 0.35,
  },
} as const;
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
