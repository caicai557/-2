import { useMemo } from 'react'
import { Particle } from './Particle'
import type { ParticleConfig, ParticleData } from '../../types/particle'

interface ParticleSystemProps {
    config: ParticleConfig
}

export function ParticleSystem({ config }: ParticleSystemProps) {
    const particles = useMemo(() => {
        const count = Math.floor(Math.random() * (config.count.max - config.count.min + 1)) + config.count.min
        const items: ParticleData[] = []

        for (let i = 0; i < count; i++) {
            const angle = (Math.random() * config.spread * Math.PI) / 180
            const speed = Math.random() * (config.speed.max - config.speed.min) + config.speed.min
            const size = Math.random() * (config.size.max - config.size.min) + config.size.min
            const color = config.colors[Math.floor(Math.random() * config.colors.length)]

            // Calculate velocity vector
            const vx = Math.cos(angle) * speed
            const vy = Math.sin(angle) * speed

            items.push({
                id: `p-${i}-${Date.now()}`,
                x: 0,
                y: 0,
                color,
                size,
                velocity: { x: vx, y: vy },
                gravity: config.gravity,
                duration: config.duration
            })
        }
        return items
    }, [config])

    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            {particles.map(p => (
                <Particle key={p.id} {...p} />
            ))}
        </div>
    )
}
