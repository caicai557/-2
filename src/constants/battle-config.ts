/**
 * Battle Animation Timing Constants
 * All durations are in milliseconds unless otherwise specified.
 */

export const BATTLE_TIMING = {
    // Turn Sequence
    TURN_DELAY: 2000,      // Total duration of a turn at 1x speed
    ATTACK_DELAY: 300,     // Time before attack animation starts
    HIT_DELAY: 800,        // Time when damage/hit occurs after attack start
    RECOVERY_DELAY: 1500,  // Time when actor returns to idle

    // Animation Durations
    DAMAGE_FLOAT_DURATION: 1.2, // Seconds (for Framer Motion)
    HP_BAR_SPRING: {
        stiffness: 120,
        damping: 20
    },

    // Stagger Delays
    DAMAGE_STAGGER: 0.1,

    // Scale Factors
    CRIT_SCALE: 1.5,
    NORMAL_SCALE: 1.0,
} as const

/**
 * Calculates the actual duration based on playback speed
 */
export function getTurnDuration(speed: 1 | 2 | 4): number {
    return BATTLE_TIMING.TURN_DELAY / speed
}
