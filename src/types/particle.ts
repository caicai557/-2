export interface ParticleConfig {
    /** Number of particles to spawn */
    count: { min: number; max: number }

    /** Possible colors for particles */
    colors: string[]

    /** Speed in pixels per second */
    speed: { min: number; max: number }

    /** Size in pixels */
    size: { min: number; max: number }

    /** Gravity factor (positive = down, negative = up) */
    gravity: number

    /** Duration in seconds */
    duration: number

    /** Spread angle in degrees (0-360) */
    spread: number
}

export interface ParticleData {
    id: string
    x: number
    y: number
    color: string
    size: number
    velocity: { x: number; y: number }
    gravity: number
    duration: number
}
