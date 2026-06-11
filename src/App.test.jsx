import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import App from './App'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase-config'

// Setup Firebase auth mocks
let authStateCallback
const mockUnsubscribe = vi.fn()

vi.mock('../firebase-config', () => {
    return {
        auth: {
            onAuthStateChanged: vi.fn((cb) => {
                authStateCallback = cb
                return mockUnsubscribe
            }),
        },
    }
})

vi.mock('firebase/auth', () => {
    return {
        signOut: vi.fn(() => Promise.resolve()),
    }
})

// Mock sub-components
vi.mock('./componets/Auth', () => {
    return {
        default: ({ setAuth }) => (
            <div data-testid="auth-component">
                Auth Mock
                <button onClick={() => setAuth(true)}>Trigger SetAuth</button>
            </div>
        ),
    }
})

vi.mock('./componets/JoinRoom/JoinRoom', () => {
    return {
        default: ({ uid, logout }) => (
            <div data-testid="join-room-component">
                Join Room Mock (UID: {uid})
                <button onClick={logout}>Trigger Logout</button>
            </div>
        ),
    }
})

// Mock react-toastify
const mockToastSuccess = vi.fn()
const mockToastWarning = vi.fn()
vi.mock('react-toastify', () => {
    return {
        toast: {
            success: (msg) => mockToastSuccess(msg),
            warning: (msg) => mockToastWarning(msg),
        },
        ToastContainer: () => <div data-testid="toast-container" />,
    }
})

describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'log').mockImplementation(() => {})
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should configure auth state listener on mount and unsubscribe on unmount', () => {
        const { unmount } = render(<App />)

        expect(auth.onAuthStateChanged).toHaveBeenCalled()

        unmount()
        expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('should render Auth component when user is not authenticated', () => {
        render(<App />)

        // Trigger onAuthStateChanged callback with null user
        authStateCallback(null)

        expect(screen.getByTestId('auth-component')).toBeInTheDocument()
        expect(screen.queryByTestId('join-room-component')).not.toBeInTheDocument()
    })

    it('should render JoinRoom component and show success toast when user is authenticated', async () => {
        render(<App />)

        // Trigger onAuthStateChanged callback with active user
        authStateCallback({ uid: 'authenticated-user-789' })

        const joinRoom = await screen.findByTestId('join-room-component')
        expect(joinRoom).toBeInTheDocument()
        expect(screen.getByText(/UID: authenticated-user-789/i)).toBeInTheDocument()
        expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument()
        expect(mockToastSuccess).toHaveBeenCalledWith('Logged In successfully')
    })

    it('should call signOut and update state correctly on logout success', async () => {
        render(<App />)

        // Log in first
        authStateCallback({ uid: 'authenticated-user-789' })

        const logoutBtn = await screen.findByRole('button', { name: /Trigger Logout/i })
        fireEvent.click(logoutBtn)

        await waitFor(() => {
            expect(signOut).toHaveBeenCalledWith(auth)
            expect(mockToastWarning).toHaveBeenCalledWith('Logged out successfully')
            expect(screen.getByTestId('auth-component')).toBeInTheDocument()
            expect(screen.queryByTestId('join-room-component')).not.toBeInTheDocument()
        })
    })

    it('should log console error on logout failure', async () => {
        const testError = new Error('SignOut failed')
        signOut.mockRejectedValueOnce(testError)

        render(<App />)

        // Log in first
        authStateCallback({ uid: 'authenticated-user-789' })

        const logoutBtn = await screen.findByRole('button', { name: /Trigger Logout/i })
        fireEvent.click(logoutBtn)

        await waitFor(() => {
            expect(signOut).toHaveBeenCalledWith(auth)
            expect(console.error).toHaveBeenCalledWith('Error signing out: ', testError)
        })
    })
})
