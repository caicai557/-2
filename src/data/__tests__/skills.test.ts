import { describe, it, expect } from 'vitest'
import skillsData from '../skills.json'
import { Sect, SkillType } from '../../types/skills'

describe('skills.json data validation (Q宠大乐斗2 五大门派)', () => {
    it('应该有至少 25 种技能 (5门派 * 5技能)', () => {
        expect(skillsData.length).toBeGreaterThanOrEqual(25)
    })

    it('所有技能都应该有必需字段', () => {
        skillsData.forEach((skill) => {
            expect(skill).toHaveProperty('id')
            expect(skill).toHaveProperty('name')
            expect(skill).toHaveProperty('sect')
            expect(skill).toHaveProperty('type')
            expect(skill).toHaveProperty('damageMultiplier')
            expect(skill).toHaveProperty('effects')
        })
    })

    it('技能伤害倍率应该在合理范围内 (0.3-3.0)', () => {
        skillsData.forEach((skill) => {
            expect(skill.damageMultiplier).toBeGreaterThanOrEqual(0.3)
            expect(skill.damageMultiplier).toBeLessThanOrEqual(3.0)
        })
    })

    it('门派类型应该是有效的枚举值', () => {
        const validSects = Object.values(Sect)
        skillsData.forEach((skill) => {
            expect(validSects).toContain(skill.sect)
        })
    })

    it('技能类型应该是有效的枚举值', () => {
        const validTypes = Object.values(SkillType)
        skillsData.forEach((skill) => {
            expect(validTypes).toContain(skill.type)
        })
    })

    it('应该包含所有五大门派', () => {
        const sects = new Set(skillsData.map(s => s.sect))
        expect(sects.has(Sect.LINGYAN)).toBe(true)
        expect(sects.has(Sect.PIAOMIAO)).toBe(true)
        expect(sects.has(Sect.TAIXU)).toBe(true)
        expect(sects.has(Sect.WANSHENG)).toBe(true)
        expect(sects.has(Sect.YOUMING)).toBe(true)
    })

    it('每个门派应该至少有 5 种技能', () => {
        const sectCounts = skillsData.reduce((acc, skill) => {
            acc[skill.sect] = (acc[skill.sect] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        Object.values(Sect).forEach(sect => {
            expect(sectCounts[sect]).toBeGreaterThanOrEqual(5)
        })
    })

    it('凌烟阁技能应该是物理类型', () => {
        const lingyanSkills = skillsData.filter(s => s.sect === Sect.LINGYAN)
        lingyanSkills.forEach(skill => {
            expect(skill.type).toBe(SkillType.PHYSICAL)
        })
    })

    it('缥缈峰技能应该是魔法类型', () => {
        const piaomiaoSkills = skillsData.filter(s => s.sect === Sect.PIAOMIAO)
        piaomiaoSkills.forEach(skill => {
            expect(skill.type).toBe(SkillType.MAGIC)
        })
    })

    it('太虚观技能应该是召唤类型', () => {
        const taixuSkills = skillsData.filter(s => s.sect === Sect.TAIXU)
        taixuSkills.forEach(skill => {
            expect(skill.type).toBe(SkillType.SUMMON)
        })
    })

    it('万圣山技能应该是治疗类型', () => {
        const wanshengSkills = skillsData.filter(s => s.sect === Sect.WANSHENG)
        wanshengSkills.forEach(skill => {
            expect(skill.type).toBe(SkillType.HEAL)
        })
    })

    it('幽冥宫技能应该是控制类型', () => {
        const youmingSkills = skillsData.filter(s => s.sect === Sect.YOUMING)
        youmingSkills.forEach(skill => {
            expect(skill.type).toBe(SkillType.CONTROL)
        })
    })
})
