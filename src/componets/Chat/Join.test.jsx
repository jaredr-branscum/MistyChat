import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import Join from './Join'

// Mock firebase-config
vi.mock('../../../firebase-config', () => {
    return {
        auth: {
            currentUser: {
                displayName: 'Test User',
                email: 'test@example.com',
            },
        },
    }
})

describe('Join Component', () => {
    let mockSetRoomID
    let mockLogout

    beforeEach(() => {
        vi.clearAllMocks()
        mockSetRoomID = vi.fn()
        mockLogout = vi.fn()
    })

    it('should render user displayName and email', () => {
        render(<Join setRoomID={mockSetRoomID} logout={mockLogout} />)
        expect(screen.getByText(/Hello! Test User/i)).toBeInTheDocument()
        expect(screen.getByText(/test@example.com/i)).toBeInTheDocument()
    })

    it('should call setRoomID with input value when clicking Join Room button', () => {
        render(<Join setRoomID={mockSetRoomID} logout={mockLogout} />)

        const input = screen.getByPlaceholderText(/Type room name\.\.\./i)
        fireEvent.change(input, { target: { value: 'SecretRoom' } })

        const joinBtn = screen.getByRole('button', { name: /Join Room/i })
        fireEvent.click(joinBtn)

        expect(mockSetRoomID).toHaveBeenCalledWith('SecretRoom')
    })

    it('should call logout when clicking Logout button', () => {
        render(<Join setRoomID={mockSetRoomID} logout={mockLogout} />)

        const logoutBtn = screen.getByRole('button', { name: /Logout/i })
        fireEvent.click(logoutBtn)

        expect(mockLogout).toHaveBeenCalled()
    })
})
