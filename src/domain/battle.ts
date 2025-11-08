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
  if (available.length > 0) {
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

  const basicAttack = actor.skills.find((skill) => skill.id === BASIC_ATTACK.id);
  const basicAttackCooldown = actor.cooldowns[basicAttack?.id ?? BASIC_ATTACK.id] ?? 0;
  if (basicAttackCooldown === 0) {
    return basicAttack ?? BASIC_ATTACK;
  }

  return BASIC_ATTACK;
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
