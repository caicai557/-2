import {
  BASE_CRIT_RATE,
  BASE_HIT_RATE,
  BASIC_ATTACK_SCALING,
  CRIT_MULTIPLIER,
  CRIT_PER_SKILL,
  DAMAGE_VARIANCE,
  DEFENSE_PER_VITALITY,
  HIT_RATE_PER_AGILITY,
  LEVEL_DAMAGE_SCALE,
  MAX_HIT_RATE,
  MAX_TURNS,
  MIN_HIT_RATE,
  HP_PER_VITALITY,
} from './balance';
import type { BattleRecord, Hero, Skill, SkillScaling, TurnLogEntry } from './models';

interface CombatState {
  side: 'hero' | 'enemy';
  id: string;
  name: string;
  level: number;
  attributes: Hero['attributes'];
  skills: Skill[];
  maxHp: number;
  hp: number;
  cooldowns: Map<string, number>;
}

function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 0x1_0000_0000;
    return state / 0x1_0000_0000;
  };
}

function initialiseCombatant(source: Hero, side: CombatState['side']): CombatState {
  const maxHp = Math.max(1, Math.round(source.attributes.vitality * HP_PER_VITALITY));
  return {
    side,
    id: source.id,
    name: source.name,
    level: source.level,
    attributes: source.attributes,
    skills: [...source.skills].sort((a, b) => b.level - a.level),
    maxHp,
    hp: maxHp,
    cooldowns: new Map(source.skills.map((skill) => [skill.id, 0])),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function computeHitChance(attacker: CombatState, defender: CombatState) {
  const agilityDelta = attacker.attributes.agility - defender.attributes.agility;
  const raw = BASE_HIT_RATE + agilityDelta * HIT_RATE_PER_AGILITY;
  return clamp(raw, MIN_HIT_RATE, MAX_HIT_RATE);
}

function computeCritChance(attacker: CombatState) {
  return clamp(BASE_CRIT_RATE + attacker.attributes.skill * CRIT_PER_SKILL, 0, 0.9);
}

function computeSkillDamage(
  attacker: CombatState,
  defender: CombatState,
  scaling: SkillScaling,
  variance: number,
  crit: boolean,
) {
  let value = scaling.base;
  for (const [key, ratio] of Object.entries(scaling.ratios)) {
    if (ratio) {
      value += attacker.attributes[key as keyof Hero['attributes']] * ratio;
    }
  }

  value *= 1 + attacker.level * LEVEL_DAMAGE_SCALE;
  value *= 1 - DAMAGE_VARIANCE / 2 + variance * DAMAGE_VARIANCE;

  if (crit) {
    value *= CRIT_MULTIPLIER;
  }

  const mitigation = defender.attributes.vitality * DEFENSE_PER_VITALITY;
  const result = Math.max(1, Math.round(value - mitigation));
  return result;
}

function reduceCooldowns(state: CombatState) {
  for (const [skillId, value] of state.cooldowns.entries()) {
    if (value > 0) {
      state.cooldowns.set(skillId, value - 1);
    }
  }
}

function selectSkill(state: CombatState) {
  for (const skill of state.skills) {
    const remaining = state.cooldowns.get(skill.id) ?? 0;
    if (remaining <= 0) {
      return skill;
    }
  }
  return null;
}

function markSkillUsed(state: CombatState, skill: Skill | null) {
  if (!skill) {
    return;
  }
  state.cooldowns.set(skill.id, skill.cooldown + 1);
}

function createTurnLogEntry(
  turn: number,
  actor: CombatState,
  skill: Skill | null,
  hit: boolean,
  critical: boolean,
  damage: number,
  targetRemainingHp: number,
): TurnLogEntry {
  const skillName = skill?.name ?? '普通攻击';
  const descriptionParts = [
    `${actor.name} 施展 ${skillName}`,
    hit ? `造成 ${damage} 点伤害` : '被对手闪避',
  ];
  if (hit && critical) {
    descriptionParts.push('触发暴击');
  }

  return {
    turn,
    actor: actor.side,
    skillId: skill?.id ?? null,
    skillName: skill?.name ?? null,
    hit,
    critical,
    damage: hit ? damage : 0,
    remainingHp: targetRemainingHp,
    description: descriptionParts.join('，'),
  };
}

export function simulateBattle(hero: Hero, enemy: Hero, seed: number): BattleRecord {
  const rng = createRng(seed || 1);
  const heroState = initialiseCombatant(hero, 'hero');
  const enemyState = initialiseCombatant(enemy, 'enemy');

  const turns: TurnLogEntry[] = [];
  let turn = 1;
  let attacker = heroState;
  let defender = enemyState;

  while (heroState.hp > 0 && enemyState.hp > 0 && turn <= MAX_TURNS) {
    reduceCooldowns(attacker);
    const skill = selectSkill(attacker);
    const scaling: SkillScaling = skill?.scaling ?? BASIC_ATTACK_SCALING;

    const hitChance = computeHitChance(attacker, defender);
    const critChance = computeCritChance(attacker);
    const rollHit = rng();
    const rollCrit = rng();
    const variance = rng();

    const hit = rollHit <= hitChance;
    const critical = hit && rollCrit <= critChance;

    const damage = hit ? computeSkillDamage(attacker, defender, scaling, variance, critical) : 0;

    if (hit) {
      defender.hp = Math.max(0, defender.hp - damage);
    }

    turns.push(createTurnLogEntry(turn, attacker, skill, hit, critical, damage, defender.hp));

    markSkillUsed(attacker, skill);

    [attacker, defender] = [defender, attacker];
    turn += 1;
  }

  const outcome: 'hero' | 'enemy' = enemyState.hp <= 0 && heroState.hp <= 0
    ? (heroState.hp >= enemyState.hp ? 'hero' : 'enemy')
    : enemyState.hp <= 0
    ? 'hero'
    : heroState.hp <= 0
    ? 'enemy'
    : heroState.hp >= enemyState.hp
    ? 'hero'
    : 'enemy';

  return {
    timestamp: seed,
    seed,
    hero: {
      id: heroState.id,
      name: heroState.name,
      level: heroState.level,
      maxHp: heroState.maxHp,
      remainingHp: heroState.hp,
      attributes: heroState.attributes,
    },
    enemy: {
      id: enemyState.id,
      name: enemyState.name,
      level: enemyState.level,
      maxHp: enemyState.maxHp,
      remainingHp: enemyState.hp,
      attributes: enemyState.attributes,
    },
    turns,
    outcome,
  };
}
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
import type { DeepReadonly } from '../utility/types';

export type Seed = number | string;

export interface CombatStats {
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  critChance?: number;
  critMultiplier?: number;
  variance?: number;
}

export interface AbilityScaling {
  attackMultiplier?: number;
  flatDamage?: number;
  defensePierce?: number;
  critChanceBonus?: number;
  critMultiplier?: number;
  heal?: number;
  variance?: number;
}

export interface AbilityDefinition {
  id: string;
  name: string;
  cooldown: number;
  scaling: AbilityScaling;
  tags?: string[];
}

export interface BattleParticipant {
  id: string;
  name: string;
  stats: CombatStats;
  skills?: ReadonlyArray<AbilityDefinition>;
  currentHp?: number;
  meta?: Record<string, unknown>;
}

export interface ScalingBreakdown {
  attack: number;
  attackMultiplier: number;
  defense: number;
  defensePierce: number;
  randomFactor: number;
  critMultiplier: number;
  flatDamage: number;
  baseDamage: number;
  mitigatedDamage: number;
  healAmount: number;
}

export interface AbilityUsageLog {
  abilityId: string;
  abilityName: string;
  damage: number;
  heal: number;
  wasCritical: boolean;
  scaling: ScalingBreakdown;
}

export interface TurnLog {
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

  let resolvedWinner: FighterState;
  let resolvedLoser: FighterState;

  if (!winner || !loser) {
    const [leftFighter, rightFighter] = fighters;
    const leftHp = leftFighter.hp;
    const rightHp = rightFighter.hp;

    if (leftHp === rightHp) {
      resolvedWinner = leftHp >= rightHp ? leftFighter : rightFighter;
    } else {
      resolvedWinner = leftHp > rightHp ? leftFighter : rightFighter;
    }
    resolvedLoser = resolvedWinner === leftFighter ? rightFighter : leftFighter;

    log.push({
      type: "battleEnd",
      round: rounds,
      winnerId: resolvedWinner.id,
      winnerName: resolvedWinner.name,
      loserId: resolvedLoser.id,
      loserName: resolvedLoser.name,
      reason: "maxRounds",
    });
  } else {
    resolvedWinner = winner;
    resolvedLoser = loser;

    log.push({
      type: "battleEnd",
      round: rounds,
      winnerId: resolvedWinner.id,
      winnerName: resolvedWinner.name,
      loserId: resolvedLoser.id,
      loserName: resolvedLoser.name,
      reason: "knockout",
    });
  }

  return {
    winnerId: resolvedWinner.id,
    loserId: resolvedLoser.id,
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
  ability: AbilityUsageLog;
  actorHpAfter: number;
  targetHpAfter: number;
  defeatedTarget: boolean;
}

export interface RoundLog {
  round: number;
  turns: TurnLog[];
}

export interface BattleSimulationResult {
  seed: Seed;
  winner: 'hero' | 'enemy' | 'draw';
  hero: CombatSnapshot;
  enemy: CombatSnapshot;
  rounds: RoundLog[];
}

export interface CombatSnapshot {
  id: string;
  name: string;
  hp: number;
  stats: CombatStats;
  cooldowns: Record<string, number>;
}

export interface BattleOptions {
  maxRounds?: number;
}

const BASIC_ATTACK: AbilityDefinition = {
  id: 'basic-attack',
  name: 'Basic Attack',
  cooldown: 0,
  scaling: { attackMultiplier: 1 },
};

interface InternalCombatant {
  side: 'hero' | 'enemy';
  id: string;
  name: string;
  stats: CombatStats;
  hp: number;
  skills: AbilityDefinition[];
  cooldowns: Record<string, number>;
}

type Rng = () => number;

export function createSeededRng(seed: Seed): Rng {
  let state = typeof seed === 'number' ? seed : hashString(seed);
  state = (state ^ 0x6d2b79f5) >>> 0;
  return () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    state = (state + Math.imul(state ^ (state >>> 7), 61 | state)) ^ state;
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function simulateBattle(
  hero: DeepReadonly<BattleParticipant>,
  enemy: DeepReadonly<BattleParticipant>,
  seed: Seed,
  options: BattleOptions = {},
): BattleSimulationResult {
  const rng = createSeededRng(seed);
  const heroState = initialiseCombatant(hero, 'hero');
  const enemyState = initialiseCombatant(enemy, 'enemy');
  const rounds: RoundLog[] = [];
  const maxRounds = Math.max(1, options.maxRounds ?? 30);

  for (let roundIndex = 1; roundIndex <= maxRounds; roundIndex += 1) {
    if (heroState.hp <= 0 || enemyState.hp <= 0) {
      break;
    }

    const roundLog: RoundLog = { round: roundIndex, turns: [] };
    const order = determineInitiative(heroState, enemyState);

    for (const actor of order) {
      if (actor.hp <= 0) {
        continue;
      }
      const target = actor.side === 'hero' ? enemyState : heroState;
      if (target.hp <= 0) {
        continue;
      }

      const turnLog = executeTurn(actor, target, rng);
      roundLog.turns.push(turnLog);

      if (target.hp <= 0) {
        break;
      }
    }

    decrementCooldowns(heroState);
    decrementCooldowns(enemyState);
    rounds.push(roundLog);
  }

  const winner = determineWinner(heroState, enemyState);

  return {
    seed,
    winner,
    hero: serialiseCombatant(heroState),
    enemy: serialiseCombatant(enemyState),
    rounds,
  };
}

function determineWinner(hero: InternalCombatant, enemy: InternalCombatant): 'hero' | 'enemy' | 'draw' {
  const heroAlive = hero.hp > 0;
  const enemyAlive = enemy.hp > 0;
  if (heroAlive && !enemyAlive) {
    return 'hero';
  }
  if (!heroAlive && enemyAlive) {
    return 'enemy';
  }
  if (!heroAlive && !enemyAlive) {
    return 'draw';
  }
  if (heroAlive && enemyAlive) {
    if (hero.hp === enemy.hp) {
      return 'draw';
    }
    return hero.hp > enemy.hp ? 'hero' : 'enemy';
  }
  return 'draw';
}

function initialiseCombatant(
  participant: DeepReadonly<BattleParticipant>,
  side: 'hero' | 'enemy',
): InternalCombatant {
  const stats = { ...participant.stats };
  const skillsInput = participant.skills ? Array.from(participant.skills) : [];
  const skillsSource = skillsInput.length > 0 ? skillsInput : [BASIC_ATTACK];
  const skills = skillsSource.map((skill) => ({
    ...skill,
    scaling: { ...(skill.scaling ?? {}) },
    tags: skill.tags ? [...skill.tags] : undefined,
  }));
  const cooldowns: Record<string, number> = {};
  for (const skill of skills) {
    cooldowns[skill.id] = 0;
  }
  const hp = participant.currentHp ?? stats.maxHp;
  return {
    side,
    id: participant.id,
    name: participant.name,
    stats,
    skills,
    cooldowns,
    hp,
  };
}

function determineInitiative(hero: InternalCombatant, enemy: InternalCombatant): InternalCombatant[] {
  const heroSpeed = hero.stats.speed;
  const enemySpeed = enemy.stats.speed;
  if (heroSpeed === enemySpeed) {
    return [hero, enemy];
  }
  return heroSpeed > enemySpeed ? [hero, enemy] : [enemy, hero];
}

function executeTurn(actor: InternalCombatant, target: InternalCombatant, rng: Rng): TurnLog {
  const ability = selectAbility(actor);
  const usage = resolveAbilityUsage(actor, target, ability, rng);
  applyAbilityOutcome(actor, target, ability, usage);

  return {
    actorId: actor.id,
    actorName: actor.name,
    targetId: target.id,
    targetName: target.name,
    ability: usage,
    actorHpAfter: actor.hp,
    targetHpAfter: target.hp,
    defeatedTarget: target.hp <= 0,
  };
}

function selectAbility(actor: InternalCombatant): AbilityDefinition {
  const available = actor.skills.filter((skill) => actor.cooldowns[skill.id] === 0);
  if (available.length === 0) {
    return actor.skills[0];
  }
  return available.reduce((chosen, current) => {
    if (!chosen) {
      return current;
    }
    if (current.cooldown > chosen.cooldown) {
      return current;
    }
    return chosen;
  });
}

function resolveAbilityUsage(
  actor: InternalCombatant,
  target: InternalCombatant,
  ability: AbilityDefinition,
  rng: Rng,
): AbilityUsageLog {
  const scaling = ability.scaling ?? {};
  const attackMultiplier = scaling.attackMultiplier ?? 1;
  const defensePierce = scaling.defensePierce ?? 0;
  const flatDamage = scaling.flatDamage ?? 0;
  const actorAttack = actor.stats.attack;
  const actorVariance = actor.stats.variance ?? 0.15;
  const abilityVariance = scaling.variance ?? 0;
  const variance = Math.max(0, actorVariance + abilityVariance);
  const clampedVariance = clamp(variance, 0, 1);
  const randomFactor = clampedVariance === 0 ? 1 : 1 - clampedVariance / 2 + rng() * clampedVariance;
  const critChance = clamp01((actor.stats.critChance ?? 0.05) + (scaling.critChanceBonus ?? 0));
  const critMultiplier = scaling.critMultiplier ?? actor.stats.critMultiplier ?? 1.5;
  const defense = Math.max(0, target.stats.defense - defensePierce);
  const baseDamage = actorAttack * attackMultiplier + flatDamage;
  const mitigatedDamage = Math.max(0, baseDamage * randomFactor - defense);
  const wasCritical = rng() < critChance;
  const damage = Math.round(mitigatedDamage * (wasCritical ? critMultiplier : 1));
  const healAmount = scaling.heal ? Math.round(scaling.heal * actorAttack) : 0;

  return {
    abilityId: ability.id,
    abilityName: ability.name,
    damage,
    heal: healAmount,
    wasCritical,
    scaling: {
      attack: actorAttack,
      attackMultiplier,
      defense,
      defensePierce,
      randomFactor,
      critMultiplier: wasCritical ? critMultiplier : 1,
      flatDamage,
      baseDamage,
      mitigatedDamage,
      healAmount,
    },
  };
}

function applyAbilityOutcome(
  actor: InternalCombatant,
  target: InternalCombatant,
  ability: AbilityDefinition,
  usage: AbilityUsageLog,
): void {
  actor.cooldowns[ability.id] = Math.max(0, ability.cooldown);
  target.hp = Math.max(0, target.hp - usage.damage);
  if (usage.heal > 0) {
    actor.hp = Math.min(actor.stats.maxHp, actor.hp + usage.heal);
  }
}

function decrementCooldowns(combatant: InternalCombatant): void {
  for (const key of Object.keys(combatant.cooldowns)) {
    const current = combatant.cooldowns[key];
    if (current > 0) {
      combatant.cooldowns[key] = current - 1;
    }
  }
}

function serialiseCombatant(combatant: InternalCombatant): CombatSnapshot {
  return {
    id: combatant.id,
    name: combatant.name,
    hp: combatant.hp,
    stats: { ...combatant.stats },
    cooldowns: { ...combatant.cooldowns },
  };
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}
