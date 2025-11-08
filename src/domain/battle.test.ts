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
