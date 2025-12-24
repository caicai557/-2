import { motion } from 'motion/react'
import type { AttackEffectData } from '../types/battle-ui'
import { ParticleSystem } from './particles/ParticleSystem'
import { PARTICLE_CONFIGS } from '../constants/particle-config'

type AttackEffectProps = AttackEffectData

export function AttackEffect({ type, position }: AttackEffectProps) {
    const variants = {
        slash: {
            scale: [0.5, 1.5, 1],
            rotate: [0, 45, 90],
            opacity: [0, 1, 0],
            backgroundColor: '#facc15'
        },
        hit: {
            scale: [0.2, 1.2, 0],
            opacity: [0, 1, 0],
            backgroundColor: '#ef4444'
        },
        magic: {
            scale: [0, 2, 0],
            rotate: [0, 180, 360],
            opacity: [0, 0.8, 0],
            backgroundColor: '#3b82f6'
        }
    }

    return (
        <div
            className="absolute pointer-events-none z-40"
            style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -50%)'
            }}
        >
            {/* Main Visual Effect */}
            <motion.div
                className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full mix-blend-screen"
                initial={{ opacity: 0 }}
                animate={variants[type]}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            />

            {/* Particle System */}
            <ParticleSystem config={PARTICLE_CONFIGS[type]} />
        </div>
    )
}
