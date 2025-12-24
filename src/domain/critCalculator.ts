/**
 * 计算是否暴击
 * @param critRate 暴击率 (0-1)
 * @returns 是否暴击
 */
export function calculateCrit(critRate: number): boolean {
    const effectiveCritRate = Math.max(0, Math.min(1, critRate))
    return Math.random() < effectiveCritRate
}
