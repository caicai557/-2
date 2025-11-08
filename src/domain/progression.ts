import { ATTRIBUTE_GROWTH_CURVE, LEVEL_EXP_CURVE, MAX_LEVEL } from './balance';
import type { Attributes, Hero } from './models';

export const DEFAULT_ATTRIBUTES: Attributes = {
  power: ATTRIBUTE_GROWTH_CURVE.power[0],
  skill: ATTRIBUTE_GROWTH_CURVE.skill[0],
  vitality: ATTRIBUTE_GROWTH_CURVE.vitality[0],
  agility: ATTRIBUTE_GROWTH_CURVE.agility[0],
};

export function createNewHero(name: string): Hero {
  return {
    id: crypto.randomUUID(),
    name,
    level: 1,
    exp: 0,
    attributes: { ...DEFAULT_ATTRIBUTES },
    skills: [],
  };
}

export function experienceRequiredForLevel(level: number) {
  const targetLevel = Math.min(level + 1, LEVEL_EXP_CURVE.length - 1);
  return LEVEL_EXP_CURVE[targetLevel];
}

export function applyLevelGain(hero: Hero, levels = 1): Hero {
  const targetLevel = Math.min(MAX_LEVEL, hero.level + Math.max(0, levels));
  const attributes: Attributes = { ...hero.attributes };

  (Object.keys(attributes) as Array<keyof Attributes>).forEach((key) => {
    const growth = ATTRIBUTE_GROWTH_CURVE[key];
    const index = Math.min(targetLevel - 1, growth.length - 1);
    attributes[key] = Math.max(attributes[key], growth[index]);
  });

  return {
    ...hero,
    level: targetLevel,
    attributes,
  };
}

export function grantOfflineRewards(hero: Hero, elapsedMs: number) {
  const hours = Math.min(elapsedMs / 3_600_000, 12);
  const expGain = Math.floor(hours * (20 + hero.level * 12));
  const silverGain = Math.floor(hours * (30 + hero.level * 18));

  return {
    expGain,
    silverGain,
    accumulatedHours: hours,
  };
}
import {
  ATTRIBUTE_GROWTH_CURVES,
  AttributeId,
  LEVEL_CAP,
  LEVEL_EXP_TABLE,
  getLevelRequirement,
} from './balance';

export interface Attributes {
  str: number;
  vit: number;
  agi: number;
  wis: number;
}

export interface ProgressionState {
  level: number;
  exp: number;
  attributes: Attributes;
}

export interface LevelUpSummary {
  levelsGained: number;
  expRemaining: number;
  newLevel: number;
  attributeGain: Attributes;
}

const ATTRIBUTE_IDS: readonly AttributeId[] = ['str', 'vit', 'agi', 'wis'];

function zeroAttributes(): Attributes {
  return { str: 0, vit: 0, agi: 0, wis: 0 };
}

export function getExpToNextLevel(level: number): number | null {
  const requirement = getLevelRequirement(level);
  return requirement ? requirement.expToNext : null;
}

export function getAttributeGrowthForLevel(level: number): Attributes {
  const growth = zeroAttributes();
  const levelIndex = level - 2;

  if (levelIndex < 0) {
    return growth;
  }

  ATTRIBUTE_IDS.forEach((id) => {
    const curve = ATTRIBUTE_GROWTH_CURVES[id];
    growth[id] = curve[levelIndex] ?? 0;
  });

  return growth;
}

function addAttributes(base: Attributes, delta: Attributes): Attributes {
  return {
    str: base.str + delta.str,
    vit: base.vit + delta.vit,
    agi: base.agi + delta.agi,
    wis: base.wis + delta.wis,
  };
}

export function applyExperience(
  state: ProgressionState,
  expGained: number,
): { state: ProgressionState; summary: LevelUpSummary } {
  let { level } = state;
  let exp = state.exp + Math.max(expGained, 0);
  const attributeGain = zeroAttributes();
  let levelsGained = 0;

  while (level < LEVEL_CAP) {
    const expToNext = getExpToNextLevel(level);

    if (!expToNext) {
      break;
    }

    if (exp < expToNext) {
      break;
    }

    exp -= expToNext;
    level += 1;
    levelsGained += 1;

    const growth = getAttributeGrowthForLevel(level);
    attributeGain.str += growth.str;
    attributeGain.vit += growth.vit;
    attributeGain.agi += growth.agi;
    attributeGain.wis += growth.wis;
  }

  const newAttributes = addAttributes(state.attributes, attributeGain);

  const updatedState: ProgressionState = {
    level,
    exp,
    attributes: newAttributes,
  };

  return {
    state: updatedState,
    summary: {
      levelsGained,
      expRemaining: exp,
      newLevel: level,
      attributeGain,
    },
  };
}

export function forecastTotalAttributeGrowth(targetLevel: number): Attributes {
  const cappedLevel = Math.min(Math.max(targetLevel, 1), LEVEL_CAP);
  const total = zeroAttributes();

  for (let level = 2; level <= cappedLevel; level += 1) {
    const growth = getAttributeGrowthForLevel(level);
    total.str += growth.str;
    total.vit += growth.vit;
    total.agi += growth.agi;
    total.wis += growth.wis;
  }

  return total;
}

export function totalExpForLevel(targetLevel: number): number {
  const cappedLevel = Math.min(Math.max(targetLevel, 1), LEVEL_CAP);

  let total = 0;
  for (let level = 1; level < cappedLevel; level += 1) {
    const requirement = getLevelRequirement(level);
    if (!requirement) {
      break;
    }
    total += requirement.expToNext;
  }
  return total;
}

export function describeLevelProgression(): Array<{
  level: number;
  expToNext: number | null;
  growth: Attributes;
}> {
  return LEVEL_EXP_TABLE.map((entry) => ({
    level: entry.level,
    expToNext: entry.expToNext,
    growth: getAttributeGrowthForLevel(entry.level + 1),
  }));
}
