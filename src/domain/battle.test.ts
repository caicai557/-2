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
import { describe, expect, it } from "vitest";

import {
  type AttackLog,
  type BattleEndLog,
  type CooldownLog,
  type SkillDefinition,
  type CombatantDefinition,
  type SkillLog,
  simulateBattle,
} from "./battle";

const heavyStrike: SkillDefinition = {
  id: "heavy-strike",
  name: "Heavy Strike",
  cooldown: 2,
  effect: () => ({
    description: "Heavy Strike adds 3 damage",
    bonusDamage: 3,
  }),
};

const regenAura: SkillDefinition = {
  id: "regen-aura",
  name: "Regen Aura",
  cooldown: 1,
  effect: () => ({
    description: "Regeneration heals 2",
    heal: 2,
  }),
};

const baseAttacker: CombatantDefinition = {
  id: "attacker",
  name: "Attacker",
  maxHp: 30,
  attack: 10,
  defense: 2,
  critChance: 0.25,
  critMultiplier: 2,
  hitChance: 0.7,
  skills: [heavyStrike],
};

const baseDefender: CombatantDefinition = {
  id: "defender",
  name: "Defender",
  maxHp: 28,
  attack: 8,
  defense: 3,
  critChance: 0.15,
  critMultiplier: 1.5,
  hitChance: 0.75,
  skills: [regenAura],
};

function cloneCombatant(definition: CombatantDefinition): CombatantDefinition {
  return {
    ...definition,
    skills: definition.skills?.map((skill) => ({ ...skill })),
  };
}

function runBattle(
  seed: string,
  options: Partial<{ maxRounds: number }> = {},
) {
  return simulateBattle({
    left: cloneCombatant(baseAttacker),
    right: cloneCombatant(baseDefender),
    seed,
    ...options,
  });
}

describe("simulateBattle log fidelity", () => {
  it("records deterministic hit and miss outcomes", () => {
    const result = runBattle("seed-hit", { maxRounds: 4 });
    const attacks = result.log.filter((entry): entry is AttackLog =>
      entry.type === "attack"
    );

    expect(attacks.some((entry) => entry.outcome === "hit")).toBe(true);
    expect(attacks.some((entry) => entry.outcome === "miss")).toBe(true);

    const summary = attacks.map((entry) => ({
      round: entry.round,
      actor: entry.actorName,
      outcome: entry.outcome,
      damage: entry.damage,
      isCritical: entry.isCritical,
    }));

    expect(summary).toMatchInlineSnapshot(`
      [
        {
          "actor": "Attacker",
          "damage": 10,
          "isCritical": false,
          "outcome": "hit",
          "round": 1,
        },
        {
          "actor": "Defender",
          "damage": 0,
          "isCritical": false,
          "outcome": "miss",
          "round": 1,
        },
        {
          "actor": "Attacker",
          "damage": 7,
          "isCritical": false,
          "outcome": "hit",
          "round": 2,
        },
        {
          "actor": "Defender",
          "damage": 0,
          "isCritical": false,
          "outcome": "miss",
          "round": 2,
        },
        {
          "actor": "Attacker",
          "damage": 7,
          "isCritical": false,
          "outcome": "hit",
          "round": 3,
        },
        {
          "actor": "Defender",
          "damage": 6,
          "isCritical": false,
          "outcome": "hit",
          "round": 3,
        },
        {
          "actor": "Attacker",
          "damage": 0,
          "isCritical": false,
          "outcome": "miss",
          "round": 4,
        },
        {
          "actor": "Defender",
          "damage": 6,
          "isCritical": false,
          "outcome": "hit",
          "round": 4,
        },
      ]
    `);
  });

  it("flags critical strikes when the seed favors them", () => {
    const result = runBattle("crit-2", { maxRounds: 4 });
    const attacks = result.log.filter((entry): entry is AttackLog =>
      entry.type === "attack"
    );

    const criticalStrikes = attacks.filter((entry) => entry.isCritical);
    expect(criticalStrikes.length).toBeGreaterThan(0);

    const criticalSummary = criticalStrikes.map((entry) => ({
      round: entry.round,
      actor: entry.actorName,
      damage: entry.damage,
      targetHp: entry.targetRemainingHp,
    }));

    expect(criticalSummary).toMatchInlineSnapshot(`
      [
        {
          "actor": "Defender",
          "damage": 9,
          "round": 2,
          "targetHp": 15,
        },
        {
          "actor": "Attacker",
          "damage": 20,
          "round": 4,
          "targetHp": 0,
        },
      ]
    `);
  });

  it("ticks skill cooldowns between uses", () => {
    const result = runBattle("seed-hit", { maxRounds: 4 });
    const cooldowns = result.log.filter(
      (entry): entry is CooldownLog => entry.type === "cooldown",
    );

    const heavyStrikeCooldowns = cooldowns
      .filter((entry) => entry.skillId === "heavy-strike")
      .map((entry) => ({
        round: entry.round,
        remaining: entry.remaining,
        actor: entry.actorName,
      }));

    expect(heavyStrikeCooldowns).toMatchInlineSnapshot(`
      [
        {
          "actor": "Attacker",
          "remaining": 1,
          "round": 2,
        },
        {
          "actor": "Attacker",
          "remaining": 0,
          "round": 3,
        },
      ]
    `);

    const skillEntries = result.log.filter((entry): entry is SkillLog =>
      entry.type === "skill" && entry.skillId === "heavy-strike"
    );
    expect(skillEntries.length).toBeGreaterThan(1);
  });

  it("distinguishes knockout wins from max-round decisions", () => {
    const knockout = runBattle("crit-2");
    const knockoutEnd = knockout.log.at(-1) as BattleEndLog;
    expect(knockoutEnd.reason).toBe("knockout");
    expect(knockoutEnd.winnerId).toBe("attacker");
    expect(knockoutEnd.loserId).toBe("defender");

    const maxRounds = runBattle("draw-seed", { maxRounds: 1 });
    const maxRoundsEnd = maxRounds.log.at(-1) as BattleEndLog;
    expect(maxRoundsEnd.reason).toBe("maxRounds");
    expect(maxRoundsEnd.winnerId).toBe("attacker");
    expect(maxRoundsEnd.loserId).toBe("defender");

    expect([knockoutEnd, maxRoundsEnd]).toMatchInlineSnapshot(`
      [
        {
          "loserId": "defender",
          "loserName": "Defender",
          "reason": "knockout",
          "round": 4,
          "type": "battleEnd",
          "winnerId": "attacker",
          "winnerName": "Attacker",
        },
        {
          "loserId": "defender",
          "loserName": "Defender",
          "reason": "maxRounds",
          "round": 1,
          "type": "battleEnd",
          "winnerId": "attacker",
          "winnerName": "Attacker",
        },
      ]
    `);
  });
});
