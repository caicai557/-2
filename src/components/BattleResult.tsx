import { memo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { BattleResultData } from '../types/battle-ui'

interface BattleResultProps {
    result: BattleResultData | null
}

export const BattleResult = memo(function BattleResult({ result }: BattleResultProps) {
    if (!result) return null

    const isVictory = result.winner === 'hero'

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                role="dialog"
                aria-modal="true"
                aria-labelledby="result-title"
                aria-describedby="result-rewards"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className={`
                        relative w-80 rounded-xl p-6 text-center shadow-2xl border-4
                        ${isVictory ? 'bg-amber-50 border-yellow-400' : 'bg-slate-100 border-slate-500'}
                    `}
                    initial={{ scale: 0.5, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                >
                    {/* Header / Title */}
                    <motion.h2
                        id="result-title"
                        className={`text-3xl font-black mb-6 ${isVictory ? 'text-yellow-600' : 'text-slate-600'}`}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {isVictory ? '大获全胜' : '遗憾落败'}
                    </motion.h2>

                    {/* Avatar Placeholder */}
                    <div className="mx-auto w-24 h-24 mb-6 rounded-full bg-slate-300 border-4 border-white shadow-md overflow-hidden">
                        {/* In real app, show winner avatar */}
                        <div className={`w-full h-full ${isVictory ? 'bg-yellow-200' : 'bg-slate-400'}`} />
                    </div>

                    {/* Rewards Section */}
                    <div id="result-rewards" className="space-y-3 mb-8">
                        <div className="flex items-center justify-between bg-white/50 p-2 rounded-lg">
                            <span className="text-slate-600 font-bold">经验 (EXP)</span>
                            <span className="text-blue-600 font-black">+{result.rewards.exp}</span>
                        </div>

                        {isVictory && (
                            <>
                                <div className="flex items-center justify-between bg-white/50 p-2 rounded-lg">
                                    <span className="text-slate-600 font-bold">金币 (Gold)</span>
                                    <span className="text-yellow-600 font-black">+{result.rewards.gold}</span>
                                </div>

                                {result.rewards.items && result.rewards.items.length > 0 && (
                                    <div className="mt-2 text-left">
                                        <div className="text-xs text-slate-500 mb-1">获得物品:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {result.rewards.items.map((item, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded border border-purple-200">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Action Button */}
                    <motion.button
                        className={`
                            w-full py-3 rounded-lg font-bold text-white shadow-lg
                            ${isVictory
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
                                : 'bg-slate-500 hover:bg-slate-600'}
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={result.onClose}
                    >
                        返回大厅
                    </motion.button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
})
