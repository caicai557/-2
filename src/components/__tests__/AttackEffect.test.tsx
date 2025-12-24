import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AttackEffect } from '../AttackEffect'

// Mock ParticleSystem to avoid rendering actual particles in this test
vi.mock('../particles/ParticleSystem', () => ({
    ParticleSystem: ({ config }: any) => (
        <div data-testid="particle-system" data-config={JSON.stringify(config)} />
    )
}))

// Mock motion/react
vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, className, style, ...props }: any) => (
            <div className={className} style={style} data-testid="main-effect" {...props}>
                {children}
            </div>
        )
    }
}))

describe('AttackEffect', () => {
    it('renders main effect and particle system', () => {
        render(<AttackEffect id="1" type="slash" position={{ x: 100, y: 100 }} timestamp={0} />)

        expect(screen.getByTestId('main-effect')).toBeDefined()
        expect(screen.getByTestId('particle-system')).toBeDefined()
    })

    it('passes correct config to particle system for slash', () => {
        render(<AttackEffect id="1" type="slash" position={{ x: 100, y: 100 }} timestamp={0} />)

        const system = screen.getByTestId('particle-system')
        const config = JSON.parse(system.getAttribute('data-config') || '{}')

        // Check if it's the slash config (yellow colors)
        expect(config.colors).toContain('#facc15')
    })

    it('passes correct config to particle system for hit', () => {
        render(<AttackEffect id="2" type="hit" position={{ x: 100, y: 100 }} timestamp={0} />)

        const system = screen.getByTestId('particle-system')
        const config = JSON.parse(system.getAttribute('data-config') || '{}')

        // Check if it's the hit config (red colors)
        expect(config.colors).toContain('#ef4444')
    })
})
