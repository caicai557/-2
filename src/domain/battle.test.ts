import { describe, expect, it } from 'vitest';

import { simulateBattle } from './battle';
import type { Hero, Skill } from './models';

let heroCounter = 0;

const STRIKE: Skill = {
  id: 'skill-strike',
  name: '破军斩',
  level: 3,
  scaling: {
    base: 18,
    ratios: {
      power: 1.1,
      skill: 0.4,
    },
  },
  cooldown: 1,
  tags: ['attack', 'slash'],
};

const BREATH: Skill = {
  id: 'skill-breath',
  name: '罡气爆发',
  level: 5,
  scaling: {
    base: 26,
    ratios: {
      power: 1.4,
      vitality: 0.2,
    },
  },
  cooldown: 3,
  tags: ['attack', 'burst'],
};

function createHero(overrides: Partial<Hero> = {}): Hero {
  return {
    id: overrides.id ?? `hero-${(heroCounter += 1)}`,
    name: overrides.name ?? '测试侠客',
    level: overrides.level ?? 10,
    exp: overrides.exp ?? 0,
    attributes: {
      power: 120,
      skill: 95,
      vitality: 110,
      agility: 90,
      ...(overrides.attributes ?? {}),
    },
    skills: overrides.skills ?? [],
  };
}

describe('simulateBattle', () => {
  it('resolves hero victory against a weaker enemy', () => {
    const hero = createHero({ skills: [STRIKE] });
    const enemy = createHero({
      name: '练功稻草人',
      attributes: { power: 70, skill: 50, vitality: 60, agility: 40 },
      skills: [],
    });

    const result = simulateBattle(hero, enemy, 42);

    expect(result.outcome).toBe('hero');
    expect(result.turns.length).toBeGreaterThan(0);
    expect(result.enemy.remainingHp).toBe(0);
  });

  it('produces miss events when agility gap is large', () => {
    const hero = createHero({
      attributes: { power: 100, skill: 60, vitality: 80, agility: 10 },
      skills: [STRIKE],
    });
    const enemy = createHero({
      name: '灵巧木桩',
      attributes: { power: 50, skill: 50, vitality: 80, agility: 220 },
      skills: [],
    });

    const result = simulateBattle(hero, enemy, 7);

    const hasMiss = result.turns.some((entry) => entry.actor === 'hero' && !entry.hit);
    expect(hasMiss).toBe(true);
  });

  it('can trigger critical hits when skill mastery is high', () => {
    const hero = createHero({
      attributes: { power: 140, skill: 260, vitality: 120, agility: 90 },
      skills: [BREATH],
    });
    const enemy = createHero({ name: '重甲傀儡', attributes: { power: 110, skill: 80, vitality: 140, agility: 60 } });

    const result = simulateBattle(hero, enemy, 3);

    const critLog = result.turns.find((entry) => entry.actor === 'hero' && entry.critical);
    expect(critLog).toBeTruthy();
  });

  it('respects skill cooldown before reusing the same ability', () => {
    const hero = createHero({
      skills: [BREATH],
    });
    const enemy = createHero({ name: '稳固守卫', attributes: { power: 80, skill: 60, vitality: 120, agility: 75 }, skills: [] });

    const result = simulateBattle(hero, enemy, 55);

    const heroTurns = result.turns.filter((entry) => entry.actor === 'hero');
    const indices = heroTurns
      .map((entry, index) => ({ index, skillId: entry.skillId }))
      .filter((entry) => entry.skillId === BREATH.id)
      .map((entry) => entry.index);

    for (let i = 1; i < indices.length; i += 1) {
      expect(indices[i] - indices[i - 1]).toBeGreaterThanOrEqual(BREATH.cooldown);
    }
  });

  it('allows the enemy to win when overpowered', () => {
    const hero = createHero({
      attributes: { power: 80, skill: 70, vitality: 70, agility: 70 },
      skills: [],
    });
    const enemy = createHero({
      name: '宗师幻影',
      attributes: { power: 200, skill: 200, vitality: 200, agility: 180 },
      skills: [BREATH],
    });

    const result = simulateBattle(hero, enemy, 11);

    expect(result.outcome).toBe('enemy');
    expect(result.hero.remainingHp).toBe(0);
  });
});
