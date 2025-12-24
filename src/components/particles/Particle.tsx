import { motion } from 'motion/react'
import type { ParticleData } from '../../types/particle'

interface ParticleProps extends ParticleData { }

export function Particle({ x, y, color, size, velocity, gravity, duration }: ParticleProps) {
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                backgroundColor: color,
                width: size,
                height: size,
                left: 0,
                top: 0,
            }}
            initial={{
                x,
                y,
                opacity: 1,
                scale: 1
            }}
            animate={{
                x: x + velocity.x * duration,
                y: y + velocity.y * duration + gravity * 100, // Simple gravity approximation
                opacity: 0,
                scale: 0
            }}
            transition={{
                duration: duration,
                ease: 'easeOut'
            }}
        />
    )
}
