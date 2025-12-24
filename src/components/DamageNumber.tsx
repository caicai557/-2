import { motion } from 'motion/react'
import type { DamageNumberData } from '../types/battle-ui'
import { BATTLE_TIMING } from '../constants/battle-config'

// We extend the data interface with any component-specific props if needed
// For now, we just destructure the data directly
type DamageNumberProps = DamageNumberData

export function DamageNumber({ value, isCritical, isMiss, position }: DamageNumberProps) {
    const content = isMiss ? '闪避' : isCritical ? `暴击 ${value}` : value

    return (
        <motion.div
            className={`absolute font-bold pointer-events-none select-none whitespace-nowrap ${isMiss ? 'text-sky-400 text-2xl font-wuxia drop-shadow-md' :
                isCritical ? 'text-amber-400 text-4xl font-wuxia drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] stroke-black stroke-2' :
                    'text-white text-2xl font-sans drop-shadow-md'
                }`}
            style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 50,
                textShadow: isCritical ? '2px 2px 0 #000, -1px -1px 0 #000' : 'none'
            }}
            initial={{ y: 0, opacity: 0, scale: isCritical ? 0.5 : 0.8, rotate: isCritical ? -10 : 0 }}
            animate={{
                y: -80,
                opacity: [0, 1, 1, 0],
                scale: isCritical ? [0.5, 1.5, 1.2] : 1,
                rotate: isCritical ? [-10, 0, 5, 0] : 0
            }}
            exit={{ opacity: 0 }}
            transition={{
                duration: BATTLE_TIMING.DAMAGE_FLOAT_DURATION,
                ease: 'easeOut',
                times: [0, 0.1, 0.8, 1]
            }}
        >
            {content}
        </motion.div>
    )
}
