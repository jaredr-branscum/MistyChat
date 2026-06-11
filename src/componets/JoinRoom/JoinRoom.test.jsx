import { vi, describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import JoinRoom from './JoinRoom'

// Mock sub-components to isolate the JoinRoom state router testing
vi.mock('../Chat/Chat', () => {
    return {
        default: ({ setRoomID }) => (
            <div data-testid="chat-mock">
                Chat Mock
                <button onClick={() => setRoomID(null)}>Leave Room</button>
            </div>
        ),
    }
})

vi.mock('../Chat/Join', () => {
    return {
        default: ({ setRoomID }) => (
            <div data-testid="join-mock">
                Join Mock
                <button onClick={() => setRoomID('SecretRoom')}>Join Room</button>
            </div>
        ),
    }
})

describe('JoinRoom Component', () => {
    it('should render Join component initially, and transition to Chat component when roomID is set', () => {
        const mockLogout = vi.fn()
        render(<JoinRoom uid="user-123" logout={mockLogout} />)

        // Renders Join by default
        expect(screen.getByTestId('join-mock')).toBeInTheDocument()
        expect(screen.queryByTestId('chat-mock')).not.toBeInTheDocument()

        // Click join button
        const joinBtn = screen.getByRole('button', { name: /Join Room/i })
        fireEvent.click(joinBtn)

        // Should transition to Chat
        expect(screen.getByTestId('chat-mock')).toBeInTheDocument()
        expect(screen.queryByTestId('join-mock')).not.toBeInTheDocument()

        // Click leave button
        const leaveBtn = screen.getByRole('button', { name: /Leave Room/i })
        fireEvent.click(leaveBtn)

        // Should transition back to Join
        expect(screen.getByTestId('join-mock')).toBeInTheDocument()
        expect(screen.queryByTestId('chat-mock')).not.toBeInTheDocument()
    })
})
