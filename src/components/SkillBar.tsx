import { memo } from 'react'
import { motion } from 'motion/react'
import type { Skill } from '../domain/models'

interface SkillBarProps {
    skills: Skill[]
    activeSkillId?: string | null
}

export const SkillBar = memo(function SkillBar({ skills, activeSkillId }: SkillBarProps) {
    return (
        <div className="flex gap-2 p-2 bg-black/40 rounded-lg border border-white/10 backdrop-blur-sm">
            {skills.map((skill) => {
                const isActive = activeSkillId === skill.id

                return (
                    <div
                        key={skill.id}
                        className="relative group"
                    >
                        <motion.div
                            className={`
                                relative w-12 h-12 rounded-lg border-2 flex items-center justify-center overflow-hidden
                                ${isActive
                                    ? 'border-amber-300 bg-gradient-to-br from-amber-600 to-amber-800 shadow-[0_0_15px_rgba(245,159,0,0.6)]'
                                    : 'border-slate-600 bg-gradient-to-br from-slate-700 to-slate-900 hover:border-slate-400'
                                }
                                transition-all duration-200 shadow-md
                            `}
                            animate={isActive ? { scale: [1, 1.1, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Inner Glow for Active */}
                            {isActive && (
                                <div className="absolute inset-0 bg-amber-400/20 animate-pulse" />
                            )}

                            <span className={`text-sm font-wuxia font-bold text-center leading-tight px-1 z-10 ${isActive ? 'text-amber-50 drop-shadow-md' : 'text-slate-300'}`}>
                                {skill.name.slice(0, 2)}
                            </span>
                        </motion.div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/20">
                            <div className="font-bold text-yellow-400">{skill.name}</div>
                            <div className="text-slate-400">CD: {skill.cooldown}回合</div>
                        </div>
                    </div>
                )
            })}

            {skills.length === 0 && (
                <div className="text-slate-500 text-xs italic px-2 py-1">
                    无技能
                </div>
            )}
        </div>
    )
})
