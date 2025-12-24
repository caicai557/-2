import { motion } from 'motion/react'
import { BATTLE_TIMING } from '../constants/battle-config'

export interface HPBarProps {
    current: number
    max: number
}

export function HPBar({ current, max }: HPBarProps) {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100))

    // Determine color based on health percentage
    let color = 'bg-green-500'
    if (percentage <= 30) {
        color = 'bg-red-500'
    } else if (percentage <= 60) {
        color = 'bg-yellow-500'
    }

    return (
        <div className="relative w-full">
            {/* Metallic Container */}
            <div className="h-6 w-full overflow-hidden rounded-full border-2 border-slate-600 bg-slate-900 shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-500 to-slate-900" />

                {/* Delayed White Bar (Damage Taken) */}
                <motion.div
                    className="absolute h-full w-full bg-white origin-left"
                    initial={false}
                    animate={{ scaleX: percentage / 100 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                />

                {/* Main Health Bar */}
                <motion.div
                    className={`relative h-full ${color} origin-left shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2)]`}
                    initial={false}
                    animate={{ scaleX: percentage / 100 }}
                    transition={{ type: 'spring', ...BATTLE_TIMING.HP_BAR_SPRING }}
                    style={{ width: '100%' }}
                >
                    {/* Glossy Highlight */}
                    <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/40 to-transparent" />
                </motion.div>
            </div>

            {/* Text Overlay (Outside or floating) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-mono tracking-wider">
                    {Math.round(current)}/{max}
                </span>
            </div>
        </div>
    )
}
