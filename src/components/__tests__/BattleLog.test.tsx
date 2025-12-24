import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BattleLog } from '../BattleLog'
import type { TurnLogEntry } from '../../domain/models'

const mockTurns: TurnLogEntry[] = [
    {
        turn: 1,
        actor: 'hero',
        skillId: '1',
        skillName: 'Attack',
        hit: true,
        critical: false,
        damage: 10,
        remainingHp: 90,
        description: 'Hero attacks Enemy'
    },
    {
        turn: 2,
        actor: 'enemy',
        skillId: '2',
        skillName: 'Strike',
        hit: true,
        critical: true,
        damage: 20,
        remainingHp: 80,
        description: 'Enemy strikes Hero'
    }
]

describe('BattleLog', () => {
    it('renders turns correctly', () => {
        render(<BattleLog turns={mockTurns} currentTurnIndex={1} />)
        expect(screen.getByText('Hero attacks Enemy')).toBeDefined()
        expect(screen.getByText('Enemy strikes Hero')).toBeDefined()
    })

    it('renders only visible turns based on currentTurnIndex', () => {
        render(<BattleLog turns={mockTurns} currentTurnIndex={0} />)
        expect(screen.getByText('Hero attacks Enemy')).toBeDefined()
        expect(screen.queryByText('Enemy strikes Hero')).toBeNull()
    })

    it('renders empty state when no turns', () => {
        render(<BattleLog turns={[]} currentTurnIndex={-1} />)
        expect(screen.getByText('战斗即将开始...')).toBeDefined()
    })
})
