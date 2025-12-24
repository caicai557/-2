import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BattleIntro } from '../BattleIntro'
import type { CombatantSummary } from '../../domain/models'

// Mock Framer Motion
vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, className, ...props }: any) => (
            <div className={className} data-testid="motion-div">
                {children}
            </div>
        )
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}))

describe('BattleIntro', () => {
    const mockHero: CombatantSummary = {
        id: 'hero-1',
        name: 'Test Hero',
        level: 10,
        maxHp: 100,
        remainingHp: 100,
        attributes: { power: 10, skill: 10, vitality: 10, agility: 10 },
        skills: []
    }

    const mockEnemy: CombatantSummary = {
        id: 'enemy-1',
        name: 'Test Enemy',
        level: 12,
        maxHp: 120,
        remainingHp: 120,
        attributes: { power: 12, skill: 8, vitality: 12, agility: 8 },
        skills: []
    }

    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('renders hero and enemy names', () => {
        render(<BattleIntro hero={mockHero} enemy={mockEnemy} onComplete={vi.fn()} />)

        expect(screen.getByText('Test Hero')).toBeTruthy()
        expect(screen.getByText('Level 10')).toBeTruthy()
        expect(screen.getByText('Test Enemy')).toBeTruthy()
        expect(screen.getByText('Level 12')).toBeTruthy()
    })

    it('renders VS and Fight text', () => {
        render(<BattleIntro hero={mockHero} enemy={mockEnemy} onComplete={vi.fn()} />)

        expect(screen.getByText('VS')).toBeTruthy()
        expect(screen.getByText('Ready... FIGHT!')).toBeTruthy()
    })

    it('calls onComplete after timeout', () => {
        const onComplete = vi.fn()
        render(<BattleIntro hero={mockHero} enemy={mockEnemy} onComplete={onComplete} />)

        expect(onComplete).not.toHaveBeenCalled()

        act(() => {
            vi.advanceTimersByTime(2500)
        })

        expect(onComplete).toHaveBeenCalled()
    })
})
