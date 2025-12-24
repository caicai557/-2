import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SkillBar } from '../SkillBar'
import type { Skill } from '../../domain/models'

// Mock motion/react
vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, className, style, ...props }: any) => (
            <div className={className} style={style} data-testid="skill-icon" {...props}>
                {children}
            </div>
        )
    }
}))

const mockSkills: Skill[] = [
    {
        id: 'skill1',
        name: 'Fireball',
        level: 1,
        scaling: { base: 10, ratios: {} },
        cooldown: 3,
        tags: []
    },
    {
        id: 'skill2',
        name: 'Heal',
        level: 1,
        scaling: { base: 20, ratios: {} },
        cooldown: 5,
        tags: []
    }
]

describe('SkillBar', () => {
    it('renders all skills', () => {
        render(<SkillBar skills={mockSkills} activeSkillId={null} />)
        expect(screen.getByText('Fi')).toBeDefined() // First 2 chars
        expect(screen.getByText('He')).toBeDefined()
    })

    it('highlights active skill', () => {
        render(<SkillBar skills={mockSkills} activeSkillId="skill1" />)
        const icons = screen.getAllByTestId('skill-icon')
        // Check if the first icon has the active class (border-yellow-400)
        // Note: We can't easily check class names on mocked components if we don't pass them through perfectly,
        // but our mock passes className.
        expect(icons[0].className).toContain('border-yellow-400')
        expect(icons[1].className).toContain('border-slate-600')
    })

    it('renders empty state', () => {
        render(<SkillBar skills={[]} activeSkillId={null} />)
        expect(screen.getByText('无技能')).toBeDefined()
    })
})
