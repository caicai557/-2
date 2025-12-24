import { CombatantCard } from './CombatantCard'
import type { CombatantSummary } from '../domain/models'
import type { AnimationPhase } from '../types/battle-ui'

interface BattleArenaProps {
    hero: CombatantSummary
    enemy: CombatantSummary
    heroHp: number
    enemyHp: number
    animationPhase?: AnimationPhase
    activeSide?: 'hero' | 'enemy'
}

export function BattleArena({
    hero,
    enemy,
    heroHp,
    enemyHp,
    animationPhase = 'idle',
    activeSide
}: BattleArenaProps) {

    // Determine animation phase for each side
    const heroPhase = activeSide === 'hero' ? animationPhase :
        (activeSide === 'enemy' && animationPhase === 'hit') ? 'hit' : 'idle'

    const enemyPhase = activeSide === 'enemy' ? animationPhase :
        (activeSide === 'hero' && animationPhase === 'hit') ? 'hit' : 'idle'

    return (
        <div className="relative w-full max-w-4xl mx-auto p-2 sm:p-4">
            {/* Background / Arena Container */}
            <div className="grid grid-cols-2 gap-2 sm:gap-8 md:gap-16 items-center justify-center min-h-[200px] sm:min-h-[300px]">

                {/* Left Side: Hero */}
                <div className="relative z-10">
                    <CombatantCard
                        side="hero"
                        combatant={hero}
                        hp={heroHp}
                        animationPhase={heroPhase}
                    />
                </div>

                {/* VS Indicator (All screens) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 flex flex-col items-center justify-center opacity-20">
                    <span className="text-3xl sm:text-6xl font-black italic text-white">VS</span>
                </div>

                {/* Right Side: Enemy */}
                <div className="relative z-10">
                    <CombatantCard
                        side="enemy"
                        combatant={enemy}
                        hp={enemyHp}
                        animationPhase={enemyPhase}
                    />
                </div>
            </div>
        </div>
    )
}
