import type { BaseAttributes, DerivedStats } from '../types/attributes'

/**
 * 根据基础属性计算派生属性 (Q宠大乐斗2 正确版本)
 * @param base 基础属性
 * @returns 派生属性
 */
export function calculateDerivedStats(base: BaseAttributes): DerivedStats {
    // 基础攻击力 = 10 + 等级 * 2 (力量不影响基础攻击！)
    const baseAttack = 10 + base.level * 2

    // 防御减伤 = min(敏捷 / 1000, 0.3)  上限30%在300敏捷
    const defenseReduction = Math.min(base.agility / 1000, 0.3)

    // 闪避率 = 敏捷 / (敏捷 + 100)
    const dodgeRate = base.agility / (base.agility + 100)

    // 暴击率 = 敏捷 / (敏捷 + 200)
    const critRate = base.agility / (base.agility + 200)

    // 速度优先级 = 速度值 (决定出手顺序)
    const speedPriority = base.speed

    return {
        baseAttack,
        defenseReduction,
        dodgeRate,
        critRate,
        speedPriority
    }
}
