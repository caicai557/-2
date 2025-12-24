/**
 * 伤害计算输入参数 (Q宠大乐斗2 正确版本)
 */
export interface DamageCalculationInput {
    /** 基础攻击力 (来自属性计算，由等级决定) */
    baseAttack: number
    /** 技能倍率 (1.0 = 100%) - 技能是唯一的伤害来源 */
    skillMultiplier: number
    /** 防御减伤百分比 (0-1 之间) */
    defenseReduction: number
    /** 是否暴击 */
    isCrit: boolean
    /** 是否闪避 (Miss) */
    isMiss: boolean
}

/**
 * 计算最终伤害 (Q宠大乐斗2 正确版本)
 * @param input 伤害计算参数
 * @returns 最终伤害值 (整数)
 * 
 * 公式:
 * 基础伤害 = 基础攻击 * 技能倍率 * (1 - 防御减伤) * 随机浮动(0.9-1.1)
 * 暴击伤害 = 基础伤害 * 1.5
 * 闪避伤害 = 0
 * 最小伤害 = 1 (如果没有闪避)
 */
export function calculateDamage(input: DamageCalculationInput): number {
    // 如果闪避，直接返回 0
    if (input.isMiss) {
        return 0
    }

    // 计算基础伤害 (技能是唯一伤害来源)
    let damage = input.baseAttack
        * input.skillMultiplier
        * (1 - input.defenseReduction)

    // 应用随机浮动系数 (0.9-1.1)
    const variance = 0.9 + Math.random() * 0.2
    damage *= variance

    // 如果暴击，乘以 1.5
    if (input.isCrit) {
        damage *= 1.5
    }

    // 保证最小伤害为 1
    damage = Math.max(1, damage)

    // 返回整数
    return Math.round(damage)
}
