import { describe, it, expect, vi } from 'vitest'
import { calculateDamage } from '../damageCalculator'
import type { DamageCalculationInput } from '../damageCalculator'

describe('damageCalculator (Q宠大乐斗2 正确版)', () => {
    describe('calculateDamage', () => {
        it('应该计算基础伤害 (无暴击，无闪避)', () => {
            const input: DamageCalculationInput = {
                baseAttack: 50,
                skillMultiplier: 1.0,
                defenseReduction: 0,
                isCrit: false,
                isMiss: false
            }

            // Mock Math.random to return consistent value
            vi.spyOn(Math, 'random').mockReturnValue(0.5) // 1.0 浮动

            const damage = calculateDamage(input)

            // 50 * 1.0 * 1.0 * 1.0 = 50
            expect(damage).toBe(50)

            vi.restoreAllMocks()
        })

        it('应该在暴击时造成 1.5 倍伤害', () => {
            const input: DamageCalculationInput = {
                baseAttack: 50,
                skillMultiplier: 1.0,
                defenseReduction: 0,
                isCrit: true, // 暴击
                isMiss: false
            }

            vi.spyOn(Math, 'random').mockReturnValue(0.5)

            const damage = calculateDamage(input)

            // 50 * 1.0 * 1.0 * 1.0 * 1.5 = 75
            expect(damage).toBe(75)

            vi.restoreAllMocks()
        })

        it('应该在闪避时造成 0 伤害', () => {
            const input: DamageCalculationInput = {
                baseAttack: 50,
                skillMultiplier: 1.0,
                defenseReduction: 0,
                isCrit: false,
                isMiss: true // 闪避
            }

            const damage = calculateDamage(input)

            expect(damage).toBe(0)
        })

        it('应该应用技能倍率', () => {
            const input: DamageCalculationInput = {
                baseAttack: 50,
                skillMultiplier: 2.0, // 200% 倍率
                defenseReduction: 0,
                isCrit: false,
                isMiss: false
            }

            vi.spyOn(Math, 'random').mockReturnValue(0.5)

            const damage = calculateDamage(input)

            // 50 * 2.0 * 1.0 * 1.0 = 100
            expect(damage).toBe(100)

            vi.restoreAllMocks()
        })

        it('应该应用防御减伤', () => {
            const input: DamageCalculationInput = {
                baseAttack: 50,
                skillMultiplier: 1.0,
                defenseReduction: 0.3, // 30% 减伤
                isCrit: false,
                isMiss: false
            }

            vi.spyOn(Math, 'random').mockReturnValue(0.5)

            const damage = calculateDamage(input)

            // 50 * 1.0 * (1 - 0.3) * 1.0 = 35
            expect(damage).toBe(35)

            vi.restoreAllMocks()
        })

        it('应该保证至少造成 1 点伤害', () => {
            const input: DamageCalculationInput = {
                baseAttack: 1,
                skillMultiplier: 0.5,
                defenseReduction: 0.99, // 99% 减伤
                isCrit: false,
                isMiss: false
            }

            vi.spyOn(Math, 'random').mockReturnValue(0.1) // 最小浮动

            const damage = calculateDamage(input)

            expect(damage).toBeGreaterThanOrEqual(1)

            vi.restoreAllMocks()
        })

        it('应该应用随机浮动系数 (0.9-1.1)', () => {
            const input: DamageCalculationInput = {
                baseAttack: 100,
                skillMultiplier: 1.0,
                defenseReduction: 0,
                isCrit: false,
                isMiss: false
            }

            // 测试最小浮动
            vi.spyOn(Math, 'random').mockReturnValue(0) // 0.9
            const minDamage = calculateDamage(input)
            expect(minDamage).toBe(90) // 100 * 0.9

            // 测试最大浮动
            vi.spyOn(Math, 'random').mockReturnValue(1) // 1.1
            const maxDamage = calculateDamage(input)
            expect(maxDamage).toBe(110) // 100 * 1.1

            vi.restoreAllMocks()
        })

        it('应该正确处理复杂组合 (暴击 + 技能倍率 + 防御)', () => {
            const input: DamageCalculationInput = {
                baseAttack: 50,
                skillMultiplier: 1.5,
                defenseReduction: 0.2,
                isCrit: true,
                isMiss: false
            }

            vi.spyOn(Math, 'random').mockReturnValue(0.5) // 1.0 浮动

            const damage = calculateDamage(input)

            // 50 * 1.5 * (1 - 0.2) * 1.0 * 1.5 = 90
            expect(damage).toBe(90)

            vi.restoreAllMocks()
        })
    })
})
