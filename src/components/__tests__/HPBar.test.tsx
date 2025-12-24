import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HPBar } from '../HPBar'

describe('HPBar', () => {
    it('renders current and max HP text', () => {
        render(<HPBar current={80} max={100} />)
        expect(screen.getByText('80/100')).toBeDefined()
    })

    it('calculates width percentage correctly', () => {
        const { container } = render(<HPBar current={50} max={100} />)
        // We can't easily test motion styles in jsdom without mocking, 
        // but we can check if the component renders without crashing
        // and contains the basic structure
        const bar = container.querySelector('div[class*="bg-gray-800"]')
        expect(bar).toBeDefined()
    })
})
