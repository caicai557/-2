import { motion } from 'motion/react'
import { useEffect } from 'react'
import type { CombatantSummary } from '../domain/models'

interface BattleIntroProps {
    hero: CombatantSummary
    enemy: CombatantSummary
    onComplete: () => void
}

export function BattleIntro({ hero, enemy, onComplete }: BattleIntroProps) {
    useEffect(() => {
        const timer = setTimeout(onComplete, 2500)
        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-hidden">
            {/* VS Logo */}
            <motion.div
                className="relative z-20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.5 }}
            >
                <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-red-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] italic">
                    VS
                </div>
            </motion.div>

            {/* Left Side (Hero) Background */}
            <motion.div
                className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-blue-900/80 to-transparent z-10"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            />

            {/* Right Side (Enemy) Background */}
            <motion.div
                className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-red-900/80 to-transparent z-10"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            />

            {/* Hero Name */}
            <motion.div
                className="absolute left-10 top-1/2 -translate-y-1/2 z-20 text-white text-right"
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: -100, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                <div className="text-4xl font-bold">{hero.name}</div>
                <div className="text-blue-300">Level {hero.level}</div>
            </motion.div>

            {/* Enemy Name */}
            <motion.div
                className="absolute right-10 top-1/2 -translate-y-1/2 z-20 text-white text-left"
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 100, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                <div className="text-4xl font-bold">{enemy.name}</div>
                <div className="text-red-300">Level {enemy.level}</div>
            </motion.div>

            {/* Ready... Fight! Text */}
            <motion.div
                className="absolute bottom-20 left-0 right-0 text-center z-30"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
            >
                <motion.div
                    className="text-6xl font-black text-white tracking-widest uppercase drop-shadow-lg"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: 1, repeatDelay: 0.5 }}
                >
                    Ready... FIGHT!
                </motion.div>
            </motion.div>
        </div>
    )
}
