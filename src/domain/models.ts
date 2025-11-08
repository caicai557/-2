export type AttributeKey = 'power' | 'skill' | 'vitality' | 'agility';

export type Attributes = Record<AttributeKey, number>;

export interface SkillScaling {
  /** 固定基础伤害/治疗系数 */
  base: number;
  /** 关联四维的倍率加成（0-?） */
  ratios: Partial<Record<AttributeKey, number>>;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  scaling: SkillScaling;
  cooldown: number;
  tags: string[];
}

export interface Hero {
  id: string;
  name: string;
  level: number;
  exp: number;
  attributes: Attributes;
  skills: Skill[];
}

export interface EnemyTemplate {
  id: string;
  name: string;
  level: number;
  attributes: Attributes;
  skills: Skill[];
  tags?: string[];
}

export interface StageRewardRule {
  baseExp: number;
  expPerLevel: number;
  baseSilver: number;
  silverPerLevel: number;
  rareDropIds?: string[];
}

export interface Stage {
  id: number;
  name: string;
  enemy: EnemyTemplate;
  rewardRule: StageRewardRule;
}

export interface CombatantSummary {
  id: string;
  name: string;
  level: number;
  maxHp: number;
  remainingHp: number;
  attributes: Attributes;
}

export interface TurnLogEntry {
  turn: number;
  actor: 'hero' | 'enemy';
  skillId: string | null;
  skillName: string | null;
  hit: boolean;
  critical: boolean;
  damage: number;
  remainingHp: number;
  description: string;
}

export interface BattleRecord {
  timestamp: number;
  seed: number;
  hero: CombatantSummary;
  enemy: CombatantSummary;
  turns: TurnLogEntry[];
  outcome: 'hero' | 'enemy';
}
