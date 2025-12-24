import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'

import { useGameStore } from '../state/gameStore'
import { useBattlePlayback } from '../hooks/useBattlePlayback'
import { useBattleAnimation } from '../hooks/useBattleAnimation'
import { BattleArena } from '../components/BattleArena'
import { DamageNumber } from '../components/DamageNumber'
import { AttackEffect } from '../components/AttackEffect'
import { BattleLog } from '../components/BattleLog'
import { SkillBar } from '../components/SkillBar'
import { BattleIntro } from '../components/BattleIntro'
import { BattleResult } from '../components/BattleResult'

export default function BattlePage() {
    const { stageId } = useParams<{ stageId: string }>()
    const navigate = useNavigate()

    const startBattle = useGameStore(state => state.startBattle)
    const activeBattle = useGameStore(state => state.activeBattle)

    // Initialize battle on mount
    useEffect(() => {
        if (stageId) {
            try {
                startBattle(Number(stageId))
            } catch (error) {
                console.error('Failed to start battle:', error)
                navigate('/play')
            }
        }
    }, [stageId, startBattle, navigate])

    // Hook up playback controls
    const {
        currentTurnIndex,
        heroHp,
        enemyHp,
        isPlaying,
        phase,
        play,
        pause,
        skip,
        startPlayback
    } = useBattlePlayback(activeBattle)

    // Animation system
    const { damageNumbers, attackEffects, animationPhase, activeSide } = useBattleAnimation(activeBattle, currentTurnIndex, isPlaying)

    if (!activeBattle) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-slate-400">正在初始化战场...</div>
            </div>
        )
    }

    const currentTurn = activeBattle.turns[currentTurnIndex]

    return (
        <motion.div
            className="space-y-6 relative h-screen overflow-hidden bg-slate-900 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/assets/battle-bg-dojo.png')" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Damage Numbers & Effects Overlay */}
            <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                <AnimatePresence>
                    {damageNumbers.map(dn => (
                        <DamageNumber key={dn.id} {...dn} />
                    ))}
                </AnimatePresence>
                <AnimatePresence>
                    {attackEffects.map(ae => (
                        <AttackEffect key={ae.id} {...ae} />
                    ))}
                </AnimatePresence>
            </div>

            {/* VS Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-10">
                <span className="font-wuxia text-[20rem] text-black font-bold tracking-tighter select-none">VS</span>
            </div>

            {/* Phase Overlays */}
            <AnimatePresence>
                {phase === 'intro' && (
                    <motion.div
                        key="intro"
                        className="absolute inset-0 z-50"
                        exit={{ opacity: 0 }}
                    >
                        <BattleIntro
                            hero={activeBattle.hero}
                            enemy={activeBattle.enemy}
                            onComplete={startPlayback}
                        />
                    </motion.div>
                )}

                {phase === 'finished' && (
                    <BattleResult
                        result={{
                            winner: activeBattle.outcome,
                            rewards: { exp: 100, gold: 50, items: ['Small Potion'] }, // Mock rewards
                            onClose: () => navigate('/play')
                        }}
                    />
                )}
            </AnimatePresence>

            <header className="flex items-center justify-between border-b border-white/5 p-2 sm:p-4 bg-black/40 backdrop-blur z-30 relative shadow-md">
                {/* Retreat Button - Wooden Sign Style */}
                <button
                    onClick={() => navigate('/play')}
                    className="relative group px-4 py-1"
                >
                    <div className="absolute inset-0 bg-amber-900 rounded border-2 border-amber-700 shadow-md transform -skew-x-6 group-hover:bg-amber-800 transition-colors" />
                    <div className="absolute inset-0 border border-amber-500/30 rounded transform -skew-x-6" />
                    <span className="relative z-10 text-xs sm:text-sm font-wuxia text-amber-100 flex items-center gap-1 drop-shadow-md">
                        <span>🔙</span> 撤退
                    </span>
                </button>

                {/* Turn Counter Scroll */}
                <div className="relative px-10 py-2">
                    {/* Scroll Body */}
                    <div className="absolute inset-0 bg-[#f0e6d2] rounded-sm transform shadow-lg border-y-4 border-amber-900/80" />
                    {/* Scroll Ends */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-[120%] bg-amber-900 rounded-l-md shadow-md" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-[120%] bg-amber-900 rounded-r-md shadow-md" />

                    <h2 className="relative font-wuxia text-xl sm:text-2xl text-red-900 font-bold tracking-widest z-10">
                        第 {currentTurn?.turn || 1} 回合
                    </h2>
                </div>

                <div className="w-12 sm:w-16" /> {/* Spacer */}
            </header>

            <div className="p-2 sm:p-4 h-[calc(100vh-60px)] sm:h-[calc(100vh-80px)] flex flex-col">
                <BattleArena
                    hero={activeBattle.hero}
                    enemy={activeBattle.enemy}
                    heroHp={heroHp}
                    enemyHp={enemyHp}
                    activeSide={activeSide}
                    animationPhase={animationPhase}
                />

                {/* Battle Controls & Log */}
                <div className="mt-auto space-y-2 sm:space-y-4 z-30 relative">
                    {/* Control Bar */}
                    <div className="flex justify-center gap-4 items-center">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/20" />
                        <div className="flex gap-2 sm:gap-4">
                            <button
                                onClick={isPlaying ? pause : play}
                                className="px-4 py-1 bg-slate-800/80 hover:bg-slate-700 rounded border border-slate-600 text-xs sm:text-sm text-slate-300 transition-colors"
                                disabled={phase !== 'playing'}
                            >
                                {isPlaying ? '⏸ 暂停' : '▶ 继续'}
                            </button>
                            <button
                                onClick={skip}
                                className="px-4 py-1 bg-slate-800/80 hover:bg-slate-700 rounded border border-slate-600 text-xs sm:text-sm text-slate-300 transition-colors"
                            >
                                ⏭ 跳过
                            </button>
                        </div>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/20" />
                    </div>

                    {/* Skill Bar - Floating Dock */}
                    <div className="hidden sm:flex justify-center relative">
                        {/* Dock Background */}
                        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                        <div className="relative p-2 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm">
                            <SkillBar
                                skills={activeBattle.hero.skills}
                                activeSkillId={currentTurn?.actor === 'hero' ? currentTurn.skillId : null}
                            />
                        </div>
                    </div>

                    <div className="h-24 sm:h-32">
                        <BattleLog
                            turns={activeBattle.turns}
                            currentTurnIndex={currentTurnIndex}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
