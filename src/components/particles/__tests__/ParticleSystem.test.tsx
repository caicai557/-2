import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ParticleSystem } from '../ParticleSystem'
import type { ParticleConfig } from '../../../types/particle'

// Mock motion/react
vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, className, style, ...props }: any) => (
            <div
                className={className}
                style={style}
                data-testid="particle"
                {...props}
            >
                {children}
            </div>
        )
    }
}))

const mockConfig: ParticleConfig = {
    count: { min: 5, max: 5 }, // Fixed count for testing
    colors: ['#ff0000'],
    speed: { min: 10, max: 10 },
    size: { min: 4, max: 4 },
    gravity: 0,
    duration: 1,
    spread: 360
}

describe('ParticleSystem', () => {
    it('renders correct number of particles', () => {
        render(<ParticleSystem config={mockConfig} />)
        const particles = screen.getAllByTestId('particle')
        expect(particles).toHaveLength(5)
    })

    it('applies correct color', () => {
        render(<ParticleSystem config={mockConfig} />)
        const particles = screen.getAllByTestId('particle')
        expect(particles[0].style.backgroundColor).toBe('rgb(255, 0, 0)')
    })
})
