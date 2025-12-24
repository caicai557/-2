/**
 * Battle UI State and Type Definitions
 * 
 * This file contains type definitions for the battle UI system,
 * separate from domain logic to maintain clean separation of concerns.
 */

export interface BattleUIState {
    /** Current turn index being displayed (0-indexed) */
    currentTurnIndex: number

    /** Whether the battle is auto-playing */
    isPlaying: boolean

    /** Playback speed multiplier */
    speed: 1 | 2 | 4
}

export interface DamageNumberData {
    /** Unique identifier for this damage number instance */
    id: string

    /** Damage value to display */
    value: number

    /** Whether this was a critical hit */
    isCritical: boolean

    /** Whether this was a miss */
    isMiss: boolean

    /** Position on screen (can be pixel numbers or CSS percentages) */
    position: { x: number | string; y: number | string }

    /** Timestamp when created (for cleanup) */
    timestamp: number
}

export interface AttackEffectData {
    id: string
    type: 'slash' | 'hit' | 'magic'
    position: { x: number | string; y: number | string }
    timestamp: number
}

/** Animation phases during a battle turn */
export type AnimationPhase =
    | 'idle'     // No action happening
    | 'glow'     // Attacker glowing (ready to attack)
    | 'attack'   // Attacker moving forward
    | 'hit'      // Defender taking damage
    | 'settle'   // Returning to idle state

export interface BattleResultData {
    winner: 'hero' | 'enemy'
    rewards: {
        exp: number
        gold: number
        items?: string[]
    }
    onClose: () => void
}

export type BattlePhase = 'intro' | 'playing' | 'finished'
