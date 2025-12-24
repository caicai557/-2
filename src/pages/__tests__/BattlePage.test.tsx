import { render, screen, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import BattlePage from '../BattlePage'
import { useGameStore } from '../../state/gameStore'

// Mock Framer Motion
vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, className, ...props }: any) => (
            <div className={className} data-testid="motion-div" {...props}>
                {children}
            </div>
        )
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}))

// Mock components to avoid complex rendering
vi.mock('../../components/BattleIntro', () => ({
    BattleIntro: ({ onComplete }: any) => (
        <div data-testid="battle-intro">
            Battle Intro
            <button onClick={onComplete}>Skip Intro</button>
        </div>
    )
}))

vi.mock('../../components/BattleResult', () => ({
    BattleResult: ({ result }: any) => (
        <div data-testid="battle-result">
            {result.winner === 'hero' ? 'Victory' : 'Defeat'}
            <button onClick={result.onClose}>Close</button>
        </div>
    )
}))

vi.mock('../../components/BattleArena', () => ({
    BattleArena: () => <div data-testid="battle-arena">Battle Arena</div>
}))

vi.mock('../../components/BattleLog', () => ({
    BattleLog: () => <div data-testid="battle-log">Battle Log</div>
}))

// Mock store
vi.mock('../../state/gameStore', () => ({
    useGameStore: vi.fn()
}))

describe('BattlePage', () => {
    const mockStartBattle = vi.fn()
    const mockActiveBattle = {
        hero: { id: 'h1', name: 'Hero', skills: [] },
        enemy: { id: 'e1', name: 'Enemy', skills: [] },
        turns: [
            { turn: 1, actor: 'hero', damage: 10, remainingHp: 90 },
            { turn: 2, actor: 'enemy', damage: 5, remainingHp: 95 }
        ],
        outcome: 'hero'
    }

    beforeEach(() => {
        vi.clearAllMocks()
            ; (useGameStore as any).mockImplementation((selector: any) => {
                const state = {
                    startBattle: mockStartBattle,
                    activeBattle: mockActiveBattle
                }
                return selector(state)
            })
    })

    it('starts battle on mount', () => {
        render(
            <MemoryRouter initialEntries={['/battle/1']}>
                <Routes>
                    <Route path="/battle/:stageId" element={<BattlePage />} />
                </Routes>
            </MemoryRouter>
        )

        expect(mockStartBattle).toHaveBeenCalledWith(1)
    })

    it('shows intro initially', () => {
        render(
            <MemoryRouter initialEntries={['/battle/1']}>
                <Routes>
                    <Route path="/battle/:stageId" element={<BattlePage />} />
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByTestId('battle-intro')).toBeTruthy()
        expect(screen.queryByTestId('battle-result')).toBeNull()
    })

    it('transitions to playing after intro', async () => {
        render(
            <MemoryRouter initialEntries={['/battle/1']}>
                <Routes>
                    <Route path="/battle/:stageId" element={<BattlePage />} />
                </Routes>
            </MemoryRouter>
        )

        // Simulate intro completion
        act(() => {
            screen.getByText('Skip Intro').click()
        })

        // Should show arena and controls (implied by absence of intro/result and presence of arena)
        expect(screen.queryByTestId('battle-intro')).toBeNull()
        expect(screen.getByTestId('battle-arena')).toBeTruthy()
    })
})
