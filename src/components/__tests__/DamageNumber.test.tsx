import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DamageNumber } from '../DamageNumber'

// Mock motion/react
vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, className, style, ...props }: any) => (
            <div className={className} style={style} data-testid="damage-number" {...props}>
                {children}
            </div>
        )
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}))

describe('DamageNumber', () => {
    it('renders damage value correctly', () => {
        render(<DamageNumber id="1" value={100} isCritical={false} isMiss={false} position={{ x: 0, y: 0 }} timestamp={0} />)
        const element = screen.getByTestId('damage-number')
        expect(element.textContent).toBe('100')
    })

    it('renders MISS text when isMiss is true', () => {
        render(<DamageNumber id="2" value={0} isCritical={false} isMiss={true} position={{ x: 0, y: 0 }} timestamp={0} />)
        const element = screen.getByTestId('damage-number')
        expect(element.textContent).toBe('MISS')
    })

    it('applies critical style when isCritical is true', () => {
        render(<DamageNumber id="3" value={200} isCritical={true} isMiss={false} position={{ x: 0, y: 0 }} timestamp={0} />)
        const element = screen.getByTestId('damage-number')
        expect(element.className).toContain('text-yellow-400')
    })
})
