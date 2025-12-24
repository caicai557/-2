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

