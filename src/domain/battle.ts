export interface SkillContext {
  readonly rng: () => number;
  readonly actor: FighterState;
  readonly target: FighterState;
}

export interface SkillResult {
  description: string;
  bonusDamage?: number;
  heal?: number;
}

export interface SkillDefinition {
  id: string;
  name: string;
  cooldown: number;
  effect: (context: SkillContext) => SkillResult;
}

export interface CombatantDefinition {
  id: string;
  name: string;
  maxHp: number;
  attack: number;
  defense: number;
  critChance: number; // 0..1
  critMultiplier: number; // >= 1
  hitChance: number; // 0..1
  skills?: SkillDefinition[];
}

export interface BattleOptions {
  left: CombatantDefinition;
  right: CombatantDefinition;
  maxRounds?: number;
  seed?: string;
}

export interface FighterState {
  readonly id: string;
  readonly name: string;
  readonly maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  critChance: number;
  critMultiplier: number;
  hitChance: number;
  skills: SkillRuntime[];
}

export interface SkillRuntime extends SkillDefinition {
  remaining: number;
}

export type CombatLogEntry =
  | RoundLog
  | AttackLog
  | SkillLog
  | CooldownLog
  | BattleEndLog;

export interface RoundLog {
  type: "round";
  round: number;
}

export interface AttackLog {
  type: "attack";
  round: number;
  actorId: string;
  actorName: string;
  targetId: string;
  targetName: string;
  outcome: "hit" | "miss";
  isCritical: boolean;
  damage: number;
  targetRemainingHp: number;
}

export interface SkillLog {
  type: "skill";
  round: number;
  actorId: string;
  actorName: string;
  skillId: string;
  skillName: string;
  description: string;
}

export interface CooldownLog {
  type: "cooldown";
  round: number;
  actorId: string;
  actorName: string;
  skillId: string;
  skillName: string;
  remaining: number;
}

export interface BattleEndLog {
  type: "battleEnd";
  round: number;
  winnerId: string;
  winnerName: string;
  loserId: string;
  loserName: string;
  reason: "knockout" | "maxRounds";
}

export interface BattleResult {
  winnerId: string;
  loserId: string;
  rounds: number;
  log: CombatLogEntry[];
  finalState: Record<string, { hp: number }>;
}

export function simulateBattle(options: BattleOptions): BattleResult {
  const {
    left,
    right,
    maxRounds = 20,
    seed = `${left.id}-${right.id}`,
  } = options;

  const rng = createRng(seed);
  const log: CombatLogEntry[] = [];
  const fighters: [FighterState, FighterState] = [
    createFighterState(left),
    createFighterState(right),
  ];

  let winner: FighterState | null = null;
  let loser: FighterState | null = null;
  let rounds = 0;

  outer: for (let round = 1; round <= maxRounds; round += 1) {
    log.push({ type: "round", round });
    rounds = round;
    for (let turn = 0; turn < fighters.length; turn += 1) {
      const actor = fighters[turn];
      const target = fighters[1 - turn];
      if (actor.hp <= 0) {
        continue;
      }
      if (target.hp <= 0) {
        winner = actor;
        loser = target;
        break outer;
      }

      const bonusDamage = handleSkills(actor, target, round, rng, log);
      executeAttack(actor, target, bonusDamage, round, rng, log);

      if (target.hp <= 0) {
        winner = actor;
        loser = target;
        break outer;
      }
    }
  }

  if (!winner || !loser) {
    const leftHp = fighters[0].hp;
    const rightHp = fighters[1].hp;
    if (leftHp === rightHp) {
      winner = leftHp >= rightHp ? fighters[0] : fighters[1];
      loser = winner === fighters[0] ? fighters[1] : fighters[0];
    } else {
      winner = leftHp > rightHp ? fighters[0] : fighters[1];
      loser = winner === fighters[0] ? fighters[1] : fighters[0];
    }
    log.push({
      type: "battleEnd",
      round: rounds,
      winnerId: winner.id,
      winnerName: winner.name,
      loserId: loser.id,
      loserName: loser.name,
      reason: "maxRounds",
    });
  } else {
    log.push({
      type: "battleEnd",
      round: rounds,
      winnerId: winner.id,
      winnerName: winner.name,
      loserId: loser.id,
      loserName: loser.name,
      reason: "knockout",
    });
  }

  return {
    winnerId: winner.id,
    loserId: loser.id,
    rounds,
    log,
    finalState: Object.fromEntries(
      fighters.map((fighter) => [fighter.id, { hp: fighter.hp }]),
    ),
  };
}

function createFighterState(def: CombatantDefinition): FighterState {
  return {
    id: def.id,
    name: def.name,
    maxHp: def.maxHp,
    hp: def.maxHp,
    attack: def.attack,
    defense: def.defense,
    critChance: def.critChance,
    critMultiplier: def.critMultiplier,
    hitChance: def.hitChance,
    skills: (def.skills ?? []).map((skill) => ({
      ...skill,
      remaining: 0,
    })),
  };
}

function handleSkills(
  actor: FighterState,
  target: FighterState,
  round: number,
  rng: () => number,
  log: CombatLogEntry[],
): number {
  let totalBonusDamage = 0;
  for (const skill of actor.skills) {
    if (skill.remaining > 0) {
      skill.remaining -= 1;
      log.push({
        type: "cooldown",
        round,
        actorId: actor.id,
        actorName: actor.name,
        skillId: skill.id,
        skillName: skill.name,
        remaining: skill.remaining,
      });
      continue;
    }

    const result = skill.effect({ actor, target, rng });
    log.push({
      type: "skill",
      round,
      actorId: actor.id,
      actorName: actor.name,
      skillId: skill.id,
      skillName: skill.name,
      description: result.description,
    });
    skill.remaining = skill.cooldown;
    if (typeof result.bonusDamage === "number") {
      totalBonusDamage += result.bonusDamage;
    }
    if (typeof result.heal === "number" && result.heal > 0) {
      actor.hp = Math.min(actor.maxHp, actor.hp + result.heal);
    }
  }
  return totalBonusDamage;
}

function executeAttack(
  actor: FighterState,
  target: FighterState,
  bonusDamage: number,
  round: number,
  rng: () => number,
  log: CombatLogEntry[],
): void {
  const hitRoll = rng();
  if (hitRoll > actor.hitChance) {
    log.push({
      type: "attack",
      round,
      actorId: actor.id,
      actorName: actor.name,
      targetId: target.id,
      targetName: target.name,
      outcome: "miss",
      isCritical: false,
      damage: 0,
      targetRemainingHp: target.hp,
    });
    return;
  }

  const critRoll = rng();
  const isCritical = critRoll < actor.critChance;
  const baseDamage = Math.max(1, actor.attack - target.defense);
  let damage = baseDamage + bonusDamage;
  if (isCritical) {
    damage = Math.floor(damage * actor.critMultiplier);
  }
  target.hp = Math.max(0, target.hp - damage);
  log.push({
    type: "attack",
    round,
    actorId: actor.id,
    actorName: actor.name,
    targetId: target.id,
    targetName: target.name,
    outcome: "hit",
    isCritical,
    damage,
    targetRemainingHp: target.hp,
  });
}

function createRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function rng() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}
