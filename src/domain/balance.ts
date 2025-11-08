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
