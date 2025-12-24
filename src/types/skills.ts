/**
 * 门派枚举 (Q宠大乐斗2 五大门派)
 */
export enum Sect {
    /** 凌烟阁 - 物理攻击 */
    LINGYAN = 'lingyan',
    /** 缥缈峰 - 法术攻击 */
    PIAOMIAO = 'piaomiao',
    /** 太虚观 - 召唤 */
    TAIXU = 'taixu',
    /** 万圣山 - 治疗/辅助 */
    WANSHENG = 'wansheng',
    /** 幽冥宫 - 控制 */
    YOUMING = 'youming'
}

/**
 * 技能类型枚举
 */
export enum SkillType {
    /** 物理技能 */
    PHYSICAL = 'physical',
    /** 魔法技能 */
    MAGIC = 'magic',
    /** 内功技能 */
    INTERNAL = 'internal',
    /** 召唤技能 */
    SUMMON = 'summon',
    /** 治疗技能 */
    HEAL = 'heal',
    /** 控制技能 */
    CONTROL = 'control'
}

/**
 * 技能效果类型
 */
export enum SkillEffectType {
    /** 晕眩 (无法行动) */
    STUN = 'stun',
    /** 中毒 (持续扣血) */
    POISON = 'poison',
    /** 减速 (降低速度) */
    SLOW = 'slow',
    /** 虚弱 (降低攻击) */
    WEAKEN = 'weaken',
    /** 治疗 (恢复生命) */
    HEAL = 'heal',
    /** 无效果 (纯伤害) */
    NONE = 'none'
}

/**
 * 技能效果接口
 */
export interface SkillEffect {
    /** 效果类型 */
    type: SkillEffectType
    /** 持续回合数 */
    duration?: number
    /** 效果强度 (如中毒每回合伤害) */
    power?: number
}

/**
 * 技能数据接口
 */
export interface SkillData {
    /** 技能 ID */
    id: string
    /** 技能名称 */
    name: string
    /** 所属门派 */
    sect: Sect
    /** 技能类型 */
    type: SkillType
    /** 伤害倍率 (1.0 = 100%) */
    damageMultiplier: number
    /** 附加效果 */
    effects: SkillEffect[]
    /** 描述 */
    description?: string
}

/**
 * 技能类型别名
 */
export type Skill = SkillData
