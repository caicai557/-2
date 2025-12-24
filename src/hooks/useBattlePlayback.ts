import { useMemo, useState, useEffect } from 'react'
import type { BattleRecord } from '../domain/models'
import type { BattlePhase } from '../types/battle-ui'

export interface BattlePlaybackControls {
    currentTurnIndex: number
    heroHp: number
    enemyHp: number
    isPlaying: boolean
    speed: 1 | 2 | 4
    phase: BattlePhase
    play: () => void
    pause: () => void
    skip: () => void
    setSpeed: (speed: 1 | 2 | 4) => void
    startPlayback: () => void
}

/**
 * Calculate HP at a specific turn index by replaying battle history
 */
function calculateHpAtTurn(battleRecord: BattleRecord, turnIndex: number) {
    let heroHp = battleRecord.hero.maxHp
    let enemyHp = battleRecord.enemy.maxHp

    // Replay turns up to current turn index
    for (let i = 0; i <= turnIndex && i < battleRecord.turns.length; i++) {
        const turn = battleRecord.turns[i]

        // Update HP based on who was attacked
        if (turn.hit) {
            if (turn.actor === 'hero') {
                // Hero attacked enemy
                enemyHp = turn.remainingHp
            } else {
                // Enemy attacked hero
                heroHp = turn.remainingHp
            }
        }
    }

    return { heroHp, enemyHp }
}

/**
 * Hook for controlling battle playback animation
 * 
 * Manages turn-by-turn replay of a battle record with play/pause/skip controls
 * and calculates current HP values based on battle history.
 */
export function useBattlePlayback(battleRecord: BattleRecord | null): BattlePlaybackControls {
    const [currentTurnIndex, setCurrentTurnIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [speed, setSpeed] = useState<1 | 2 | 4>(1)
    const [phase, setPhase] = useState<BattlePhase>('intro')

    // Calculate current HP values based on turn history
    const { heroHp, enemyHp } = useMemo(() => {
        if (!battleRecord) return { heroHp: 0, enemyHp: 0 }
        return calculateHpAtTurn(battleRecord, currentTurnIndex)
    }, [battleRecord, currentTurnIndex])

    // Auto-advance turns when playing
    useEffect(() => {
        if (!isPlaying || !battleRecord || phase !== 'playing') return

        const turnDuration = 2000 / speed // Base 2 seconds per turn, adjusted by speed

        const interval = setInterval(() => {
            setCurrentTurnIndex((prev) => {
                // Stop playback at the end
                if (prev >= battleRecord.turns.length - 1) {
                    setIsPlaying(false)
                    setPhase('finished')
                    return prev
                }
                return prev + 1
            })
        }, turnDuration)

        return () => clearInterval(interval)
    }, [isPlaying, speed, battleRecord, phase])

    // Reset playback when battle changes
    useEffect(() => {
        if (battleRecord) {
            setCurrentTurnIndex(0)
            setIsPlaying(false)
            setPhase('intro')
        }
    }, [battleRecord])

    return {
        currentTurnIndex,
        heroHp,
        enemyHp,
        isPlaying,
        speed,
        phase,
        play: () => setIsPlaying(true),
        pause: () => setIsPlaying(false),
        skip: () => {
            setIsPlaying(false)
            if (battleRecord) {
                setCurrentTurnIndex(battleRecord.turns.length - 1)
                setPhase('finished')
            }
        },
        setSpeed,
        startPlayback: () => {
            setPhase('playing')
            setIsPlaying(true)
        }
    }
}
