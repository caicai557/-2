/**
 * 基础属性 (Base Attributes)
 * 角色的原始属性值，通过升级或装备获得
 */
export interface BaseAttributes {
    /** 力量 - Q宠大乐斗2中仅影响特定技能，不影响基础攻击 */
    strength: number
    /** 敏捷 - 影响闪避率、暴击率和减伤(上限300) */
    agility: number
    /** 速度 - 决定出手顺序和回合数，最重要属性 */
    speed: number
    /** 最大生命值 */
    maxHp: number
    /** 等级 - 影响基础攻击力 */
    level: number
}

/**
 * 派生属性 (Derived Stats)
 * 从基础属性计算得出的战斗属性
 */
export interface DerivedStats {
    /** 基础攻击力 (由等级计算，NOT力量) */
    baseAttack: number
    /** 防御减伤百分比 (由敏捷计算，上限30%@300AGI) */
    defenseReduction: number
    /** 闪避率 (0-1 之间) */
    dodgeRate: number
    /** 暴击率 (0-1 之间) */
    critRate: number
    /** 速度优先级 (决定出手顺序) */
    speedPriority: number
}

/**
 * 战斗者完整属性 (Combatant Stats)
 * 包含基础属性和派生属性的完整战斗数据
 */
export interface CombatantStats {
    base: BaseAttributes
    derived: DerivedStats
}
