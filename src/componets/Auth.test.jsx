import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import Auth from './Auth'
import { setPersistence, signInWithPopup } from 'firebase/auth'

// Mock firebase-config
vi.mock('../../firebase-config', () => {
    return {
        auth: 'mock-auth',
        provider: 'mock-provider',
    }
})

// Mock firebase/auth
vi.mock('firebase/auth', () => {
    return {
        browserLocalPersistence: 'mock-local-persistence',
        setPersistence: vi.fn(() => Promise.resolve()),
        signInWithPopup: vi.fn(),
    }
})

// Mock react-toastify
const mockToastError = vi.fn()
vi.mock('react-toastify', () => {
    return {
        toast: {
            error: (msg) => mockToastError(msg),
        },
    }
})

describe('Auth Component', () => {
    let mockSetAuth

    beforeEach(() => {
        vi.clearAllMocks()
        mockSetAuth = vi.fn()
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should render the login prompt and login button', () => {
        render(<Auth setAuth={mockSetAuth} />)
        expect(screen.getByText(/Please Add Your Account to Continue/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Login with google/i })).toBeInTheDocument()
    })

    it('should set persistence and setAuth(true) on successful login', async () => {
        signInWithPopup.mockResolvedValueOnce({
            user: { uid: 'user-123', displayName: 'Test User' },
        })

        render(<Auth setAuth={mockSetAuth} />)

        const loginBtn = screen.getByRole('button', { name: /Login with google/i })
        fireEvent.click(loginBtn)

        await waitFor(() => {
            expect(setPersistence).toHaveBeenCalledWith('mock-auth', 'mock-local-persistence')
            expect(signInWithPopup).toHaveBeenCalledWith('mock-auth', 'mock-provider')
            expect(mockSetAuth).toHaveBeenCalledWith(true)
        })
    })

    it('should setAuth(false) and show toast error if user is null', async () => {
        signInWithPopup.mockResolvedValueOnce({
            user: null,
        })

        render(<Auth setAuth={mockSetAuth} />)

        const loginBtn = screen.getByRole('button', { name: /Login with google/i })
        fireEvent.click(loginBtn)

        await waitFor(() => {
            expect(mockSetAuth).toHaveBeenCalledWith(false)
            expect(mockToastError).toHaveBeenCalledWith('Something went wrong.')
        })
    })

    it('should log error to console if login throws an error', async () => {
        const testError = new Error('Auth failed')
        signInWithPopup.mockRejectedValueOnce(testError)

        render(<Auth setAuth={mockSetAuth} />)

        const loginBtn = screen.getByRole('button', { name: /Login with google/i })
        fireEvent.click(loginBtn)

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('Error during login:', testError)
        })
    })
})
