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
