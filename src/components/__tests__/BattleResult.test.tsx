import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BattleResult } from '../BattleResult'
import type { BattleResultData } from '../../types/battle-ui'

// Mock motion/react
vi.mock('motion/react', () => {
    const motion = new Proxy({}, {
        get: (target, prop: string) => {
            return ({ children, className, style, onClick, ...props }: any) => {
                const Component = prop as any
                // Filter out motion-specific props to avoid React warnings
                const {
                    initial, animate, exit, transition, variants,
                    whileHover, whileTap, whileDrag, whileFocus, whileInView,
                    viewport, layout, layoutId, onAnimationComplete,
                    ...validProps
                } = props

                return (
                    <Component
                        className={className}
                        style={style}
                        onClick={onClick}
                        data-testid={`motion-${prop}`}
                        {...validProps}
                    >
                        {children}
                    </Component>
                )
            }
        }
    })

    return {
        motion,
        AnimatePresence: ({ children }: any) => <div>{children}</div>
    }
})

const mockVictoryData: BattleResultData = {
    winner: 'hero',
    rewards: {
        exp: 100,
        gold: 50,
        items: ['Small Potion']
    },
    onClose: vi.fn()
}

const mockDefeatData: BattleResultData = {
    winner: 'enemy',
    rewards: {
        exp: 10,
        gold: 0
    },
    onClose: vi.fn()
}

describe('BattleResult', () => {
    it('renders victory state correctly', () => {
        render(<BattleResult result={mockVictoryData} />)

        expect(screen.getByText(/大获全胜/i)).toBeDefined()
        expect(screen.getByText(/100/)).toBeDefined() // EXP
        expect(screen.getByText(/50/)).toBeDefined() // Gold
        expect(screen.getByText('Small Potion')).toBeDefined()
    })

    it('renders defeat state correctly', () => {
        render(<BattleResult result={mockDefeatData} />)

        expect(screen.getByText(/遗憾落败/i)).toBeDefined()
        expect(screen.getByText(/10/)).toBeDefined() // EXP
    })

    it('calls onClose when button is clicked', () => {
        render(<BattleResult result={mockVictoryData} />)

        const button = screen.getByRole('button')
        fireEvent.click(button)

        expect(mockVictoryData.onClose).toHaveBeenCalled()
    })
})
