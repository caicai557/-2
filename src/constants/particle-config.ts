import type { ParticleConfig } from '../types/particle'

export const PARTICLE_CONFIGS: Record<string, ParticleConfig> = {
    slash: {
        count: { min: 8, max: 12 },
        colors: ['#facc15', '#fbbf24', '#ffffff'], // Yellows + White
        speed: { min: 100, max: 200 },
        size: { min: 3, max: 6 },
        gravity: 2,
        duration: 0.5,
        spread: 60 // Narrow spread for directional slash
    },
    hit: {
        count: { min: 10, max: 15 },
        colors: ['#ef4444', '#dc2626', '#7f1d1d'], // Reds
        speed: { min: 50, max: 150 },
        size: { min: 4, max: 8 },
        gravity: 3, // Heavy drops
        duration: 0.6,
        spread: 360 // All directions
    },
    magic: {
        count: { min: 15, max: 20 },
        colors: ['#3b82f6', '#60a5fa', '#93c5fd'], // Blues
        speed: { min: 20, max: 80 },
        size: { min: 2, max: 5 },
        gravity: -0.5, // Float up slightly
        duration: 0.8,
        spread: 360
    }
}
