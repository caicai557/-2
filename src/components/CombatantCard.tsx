import { motion } from 'motion/react'
import { HPBar } from './HPBar'
import type { CombatantSummary } from '../domain/models'
import type { AnimationPhase } from '../types/battle-ui'

interface CombatantCardProps {
    side: 'hero' | 'enemy'
    combatant: CombatantSummary
    hp: number
    animationPhase?: AnimationPhase
}

export function CombatantCard({ side, combatant, hp, animationPhase = 'idle' }: CombatantCardProps) {
    const isHero = side === 'hero'

    // Animation variants
    const variants = {
        idle: {
            x: 0,
            scale: 1,
            transition: {
                repeat: Infinity,
                repeatType: "reverse" as const,
                duration: 1.5
            }
        },
        glow: {
            scale: 1.05,
            filter: "brightness(1.2)",
            transition: { duration: 0.3 }
        },
        attack: {
            x: isHero ? 50 : -50,
            scale: 1.1,
            transition: { duration: 0.2, ease: "backIn" as const }
        },
        hit: {
            x: [0, -10, 10, -5, 5, 0],
            filter: "brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)", // Red flash
            transition: { duration: 0.4 }
        },
        settle: {
            x: 0,
            scale: 1,
            filter: "brightness(1)",
            transition: { duration: 0.3 }
        }
    }

    // Determine current variant based on phase and active turn
    // Note: This logic will need to be driven by the parent component
    // For now, we just use the passed phase if it applies to this character

    return (
        <div className={`relative flex flex-col gap-2 p-6 ${isHero ? 'items-start' : 'items-end'}`}>
            {/* Wooden Frame Background */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    borderImage: "url('/assets/ui-frame-wood.png') 30 fill / 30px stretch",
                    filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                }}
            />

            <div className="relative z-10 flex w-full items-center justify-between gap-2 px-2">
                <h3 className={`font-bold text-lg font-wuxia tracking-wide ${isHero ? 'text-sky-200 drop-shadow-md' : 'text-red-200 drop-shadow-md'}`}>
                    {combatant.name}
                </h3>
                <span className="inline-block rounded bg-black/50 px-2 py-0.5 text-xs text-amber-400 border border-amber-500/30 font-mono">
                    Lv.{combatant.level}
                </span>
            </div>

            <div className="relative z-10 w-full py-2 flex justify-center">
                <motion.div
                    className={`h-24 w-24 rounded-xl border-4 shadow-[0_0_15px_rgba(0,0,0,0.6)] ${isHero ? 'border-sky-300 bg-sky-900' : 'border-red-300 bg-red-900'} flex items-center justify-center text-5xl overflow-hidden relative ring-2 ring-black/50`}
                    variants={variants}
                    animate={animationPhase}
                    initial="idle"
                >
                    {/* Metallic Shine on Border */}
                    <div className="absolute inset-0 border-2 border-white/30 rounded-lg pointer-events-none" />

                    {/* Inner Shadow */}
                    <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none" />

                    <span className="drop-shadow-lg filter contrast-125">
                        {isHero ? '🐧' : '👹'}
                    </span>
                </motion.div>
            </div>

            <div className="relative z-10 w-full space-y-1 px-2">
                <HPBar current={hp} max={combatant.maxHp} />
            </div>
        </div>
    )
}
