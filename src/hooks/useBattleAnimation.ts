import { useState, useEffect, useCallback } from 'react'
import type { BattleRecord } from '../domain/models'
import type { DamageNumberData } from '../types/battle-ui'
import { BATTLE_TIMING } from '../constants/battle-config'

export function useBattleAnimation(
    battleRecord: BattleRecord | null,
    currentTurnIndex: number,
    isPlaying: boolean
) {
    const [damageNumbers, setDamageNumbers] = useState<DamageNumberData[]>([])
    const [attackEffects, setAttackEffects] = useState<import('../types/battle-ui').AttackEffectData[]>([])
    const [animationPhase, setAnimationPhase] = useState<import('../types/battle-ui').AnimationPhase>('idle')
    const [activeSide, setActiveSide] = useState<'hero' | 'enemy' | undefined>(undefined)

    // Clear animations when battle changes or resets
    useEffect(() => {
        if (currentTurnIndex === 0) {
            setDamageNumbers([])
            setAttackEffects([])
            setAnimationPhase('idle')
            setActiveSide(undefined)
        }
    }, [battleRecord, currentTurnIndex])

    // Spawn animations when turn changes
    useEffect(() => {
        if (!battleRecord || !isPlaying) return

        const turn = battleRecord.turns[currentTurnIndex]
        if (!turn) return

        const isHeroActor = turn.actor === 'hero'
        setActiveSide(isHeroActor ? 'hero' : 'enemy')

        // Sequence: Attack -> Hit (spawn numbers) -> Idle
        setAnimationPhase('attack')

        const hitDelay = BATTLE_TIMING.HIT_DELAY
        const recoveryDelay = BATTLE_TIMING.RECOVERY_DELAY

        const hitTimer = setTimeout(() => {
            setAnimationPhase('hit')

            // Use relative positions for responsive layout
            // Enemy is on the right (75% from left), Hero is on the left (25% from left)
            const targetPosition = isHeroActor
                ? { x: '75%', y: '30%' } // Enemy position (right side)
                : { x: '25%', y: '30%' } // Hero position (left side)

            // Spawn Attack Effect
            if (turn.hit) {
                const effectType = turn.critical ? 'slash' : 'hit'
                const newEffect: import('../types/battle-ui').AttackEffectData = {
                    id: `eff-${turn.turn}-${Date.now()}`,
                    type: effectType,
                    position: targetPosition,
                    timestamp: Date.now()
                }

                setAttackEffects(prev => [...prev, newEffect])

                setTimeout(() => {
                    setAttackEffects(prev => prev.filter(e => e.id !== newEffect.id))
                }, 600) // Keep effect duration hardcoded or add to constants if needed
            }

            // Spawn Damage Number
            if (turn.hit) {
                const newDamageNumber: DamageNumberData = {
                    id: `dmg-${turn.turn}-${Date.now()}`,
                    value: turn.damage,
                    isCritical: turn.critical,
                    isMiss: false,
                    position: targetPosition,
                    timestamp: Date.now()
                }

                setDamageNumbers(prev => [...prev, newDamageNumber])

                setTimeout(() => {
                    setDamageNumbers(prev => prev.filter(dn => dn.id !== newDamageNumber.id))
                }, BATTLE_TIMING.DAMAGE_FLOAT_DURATION * 1000)
            } else {
                const newDamageNumber: DamageNumberData = {
                    id: `miss-${turn.turn}-${Date.now()}`,
                    value: 0,
                    isCritical: false,
                    isMiss: true,
                    position: targetPosition,
                    timestamp: Date.now()
                }

                setDamageNumbers(prev => [...prev, newDamageNumber])

                setTimeout(() => {
                    setDamageNumbers(prev => prev.filter(dn => dn.id !== newDamageNumber.id))
                }, BATTLE_TIMING.DAMAGE_FLOAT_DURATION * 1000)
            }
        }, hitDelay)

        const idleTimer = setTimeout(() => {
            setAnimationPhase('idle')
        }, recoveryDelay)

        return () => {
            clearTimeout(hitTimer)
            clearTimeout(idleTimer)
        }

    }, [battleRecord, currentTurnIndex, isPlaying])

    return {
        damageNumbers,
        attackEffects,
        animationPhase,
        activeSide
    }
}
