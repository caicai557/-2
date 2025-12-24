import { describe, it, expect } from 'vitest'
import { calculateDerivedStats } from '../attributeCalculator'
import type { BaseAttributes } from '../../types/attributes'

describe('attributeCalculator (Q宠大乐斗2 正确版)', () => {
    describe('calculateDerivedStats', () => {
        it('应该基于等级计算基础攻击力 (不受力量影响)', () => {
            const base: BaseAttributes = {
                strength: 100,  // 力量高
                agility: 30,
                speed: 40,
                maxHp: 100,
                level: 10  // 等级10
            }

            const derived = calculateDerivedStats(base)

            // baseAttack = 10 + level * 2 = 10 + 10 * 2 = 30 (力量不影响)
            expect(derived.baseAttack).toBe(30)
        })

        it('应该根据敏捷计算减伤 (上限30%@300敏捷)', () => {
            const base300: BaseAttributes = {
                strength: 50,
                agility: 300,  // 300 AGI
                speed: 40,
                maxHp: 100,
                level: 10
            }

            const derived300 = calculateDerivedStats(base300)

            // 300 / 1000 = 0.3 (30% 减伤上限)
            expect(derived300.defenseReduction).toBeCloseTo(0.3, 2)

            // 测试600敏捷也不会超过30%
            const base600: BaseAttributes = {
                strength: 50,
                agility: 600,
                speed: 40,
                maxHp: 100,
                level: 10
            }

            const derived600 = calculateDerivedStats(base600)
            expect(derived600.defenseReduction).toBe(0.3)  // 仍然是30%上限
        })

        it('应该根据敏捷计算闪避率 (AGI / (AGI + 100))', () => {
            const base: BaseAttributes = {
                strength: 50,
                agility: 100,
                speed: 40,
                maxHp: 100,
                level: 10
            }

            const derived = calculateDerivedStats(base)

            // 100 / (100 + 100) = 0.5 (50%)
            expect(derived.dodgeRate).toBeCloseTo(0.5, 2)
        })

        it('应该根据敏捷计算暴击率 (AGI / (AGI + 200))', () => {
            const base: BaseAttributes = {
                strength: 50,
                agility: 100,
                speed: 40,
                maxHp: 100,
                level: 10
            }

            const derived = calculateDerivedStats(base)

            // 100 / (100 + 200) = 0.333...
            expect(derived.critRate).toBeCloseTo(0.333, 2)
        })

        it('应该正确计算速度优先级 (就是速度值本身)', () => {
            const base: BaseAttributes = {
                strength: 50,
                agility: 30,
                speed: 150,
                maxHp: 100,
                level: 10
            }

            const derived = calculateDerivedStats(base)

            expect(derived.speedPriority).toBe(150)
        })

        it('应该处理等级1的最小值', () => {
            const base: BaseAttributes = {
                strength: 10,
                agility: 10,
                speed: 10,
                maxHp: 50,
                level: 1
            }

            const derived = calculateDerivedStats(base)

            // baseAttack = 10 + 1 * 2 = 12
            expect(derived.baseAttack).toBe(12)
        })
    })
})
