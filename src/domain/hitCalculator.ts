/**
 * 计算是否命中
 * @param hitRate 攻击方命中率 (0-1)
 * @param dodgeRate 防御方闪避率 (0-1)
 * @returns 是否命中
 */
export function calculateHit(hitRate: number, dodgeRate: number): boolean {
    const effectiveHitRate = Math.max(0, Math.min(1, hitRate - dodgeRate))
    return Math.random() < effectiveHitRate
}
