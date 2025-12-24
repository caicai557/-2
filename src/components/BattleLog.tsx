import { memo, useEffect, useRef } from 'react'
import type { TurnLogEntry } from '../domain/models'

interface BattleLogProps {
    turns: TurnLogEntry[]
    currentTurnIndex: number
}

export const BattleLog = memo(function BattleLog({ turns, currentTurnIndex }: BattleLogProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when new turns are added or current turn changes
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [turns.length, currentTurnIndex])

    // Only show turns up to current index
    const visibleTurns = turns.slice(0, currentTurnIndex + 1)

    return (
        <div
            ref={scrollRef}
            className="h-48 overflow-y-auto rounded-lg border-4 border-amber-900/30 bg-[#f0e6d2] p-4 space-y-2 font-mono text-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] relative"
        >
            {visibleTurns.length === 0 && (
                <div className="text-amber-900/50 italic text-center py-4 font-wuxia text-lg">
                    战斗即将开始...
                </div>
            )}

            {visibleTurns.map((turn, index) => {
                const isCurrent = index === currentTurnIndex
                const isHero = turn.actor === 'hero'

                return (
                    <div
                        key={`${turn.turn}-${index}`}
                        className={`
                            p-2 rounded transition-colors border-b border-amber-900/10
                            ${isCurrent ? 'bg-amber-900/10' : 'opacity-80'}
                            ${turn.critical ? 'border-l-4 border-l-red-600 bg-red-50' : ''}
                        `}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-amber-800/60 text-xs">[{turn.turn}]</span>
                            <span className={`font-bold ${isHero ? 'text-sky-700' : 'text-red-700'}`}>
                                {isHero ? '你' : '对手'}
                            </span>
                            <span className="text-amber-900">
                                {turn.description}
                            </span>
                        </div>

                        {turn.hit && (
                            <div className="pl-8 text-xs">
                                <span className={turn.critical ? 'text-red-600 font-bold text-sm' : 'text-amber-800/70'}>
                                    {turn.critical ? '暴击! ' : ''}
                                    造成 {turn.damage} 点伤害
                                </span>
                            </div>
                        )}

                        {!turn.hit && (
                            <div className="pl-8 text-xs text-slate-500">
                                攻击未命中
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
})
