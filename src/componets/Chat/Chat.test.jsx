import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import React from 'react'
import Chat from './Chat'

// Mock firebase-config
vi.mock('../../../firebase-config', () => {
    return {
        auth: {
            currentUser: {
                displayName: 'Test User',
                email: 'test@example.com',
                photoURL: 'http://photo.url',
                uid: 'test-uid',
            },
        },
        database: {},
    }
})

// Setup global mock functions
const mockDelete = vi.fn()
const mockCommit = vi.fn()
const mockWriteBatch = vi.fn(() => ({
    delete: mockDelete,
    commit: mockCommit,
}))

const mockGetDocs = vi.fn(() =>
    Promise.resolve({
        forEach: (cb) => cb({ id: 'msg-1' }),
    })
)

let snapshotCallbacks = []
vi.mock('firebase/firestore', () => {
    return {
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
        onSnapshot: vi.fn((q, cb) => {
            snapshotCallbacks.push(cb)
            return vi.fn() // returns unsubscribe function
        }),
        addDoc: vi.fn(() => Promise.resolve()),
        serverTimestamp: vi.fn(),
        doc: vi.fn(),
        writeBatch: () => mockWriteBatch(),
        getDocs: () => mockGetDocs(),
    }
})

const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
vi.mock('react-toastify', () => {
    return {
        toast: {
            success: (msg) => mockToastSuccess(msg),
            error: (msg) => mockToastError(msg),
        },
    }
})

describe('Chat Component - Prompted Deletion', () => {
    let mockLogout
    let mockSetRoomID

    beforeEach(() => {
        vi.clearAllMocks()
        snapshotCallbacks = []
        mockLogout = vi.fn()
        mockSetRoomID = vi.fn()
        // Mock default window.confirm
        vi.spyOn(window, 'confirm').mockImplementation(() => true)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should show confirm prompt on logout, delete messages if confirmed, and call logout', async () => {
        window.confirm.mockReturnValue(true)

        render(
            <Chat
                roomID="test-room"
                uid="test-uid"
                logout={mockLogout}
                setRoomID={mockSetRoomID}
            />
        )

        const logoutBtn = screen.getByRole('button', { name: /logout now/i })
        fireEvent.click(logoutBtn)

        expect(window.confirm).toHaveBeenCalledWith(
            'Would you like to delete all of your messages from this chatroom before leaving?'
        )

        await waitFor(() => {
            expect(mockGetDocs).toHaveBeenCalled()
            expect(mockDelete).toHaveBeenCalledWith(undefined) // doc() is mocked to return undefined
            expect(mockCommit).toHaveBeenCalled()
            expect(mockLogout).toHaveBeenCalled()
        })
    })

    it('should show confirm prompt on logout, skip deleting messages if canceled, and call logout', async () => {
        window.confirm.mockReturnValue(false)

        render(
            <Chat
                roomID="test-room"
                uid="test-uid"
                logout={mockLogout}
                setRoomID={mockSetRoomID}
            />
        )

        const logoutBtn = screen.getByRole('button', { name: /logout now/i })
        fireEvent.click(logoutBtn)

        expect(window.confirm).toHaveBeenCalled()

        await waitFor(() => {
            expect(mockGetDocs).not.toHaveBeenCalled()
            expect(mockLogout).toHaveBeenCalled()
        })
    })

    it('should default to deleting messages on logout if confirm dialog throws an error, and call logout', async () => {
        window.confirm.mockImplementation(() => {
            throw new Error('Confirm error')
        })

        render(
            <Chat
                roomID="test-room"
                uid="test-uid"
                logout={mockLogout}
                setRoomID={mockSetRoomID}
            />
        )

        const logoutBtn = screen.getByRole('button', { name: /logout now/i })
        fireEvent.click(logoutBtn)

        await waitFor(() => {
            expect(mockGetDocs).toHaveBeenCalled()
            expect(mockLogout).toHaveBeenCalled()
        })
    })

    it('should show confirm prompt on joinAnotherRoom, delete messages if confirmed, and update roomID', async () => {
        window.confirm.mockReturnValue(true)

        render(
            <Chat
                roomID="test-room"
                uid="test-uid"
                logout={mockLogout}
                setRoomID={mockSetRoomID}
            />
        )

        const joinBtn = screen.getByRole('button', { name: /join another room/i })
        fireEvent.click(joinBtn)

        expect(window.confirm).toHaveBeenCalled()

        await waitFor(() => {
            expect(mockGetDocs).toHaveBeenCalled()
            expect(mockSetRoomID).toHaveBeenCalledWith(null)
        })
    })

    it('should show confirm prompt on joinAnotherRoom, skip deleting messages if canceled, and update roomID', async () => {
        window.confirm.mockReturnValue(false)

        render(
            <Chat
                roomID="test-room"
                uid="test-uid"
                logout={mockLogout}
                setRoomID={mockSetRoomID}
            />
        )

        const joinBtn = screen.getByRole('button', { name: /join another room/i })
        fireEvent.click(joinBtn)

        expect(window.confirm).toHaveBeenCalled()

        await waitFor(() => {
            expect(mockGetDocs).not.toHaveBeenCalled()
            expect(mockSetRoomID).toHaveBeenCalledWith(null)
        })
    })

    it('should show toast error and log error if deleteUserMessages fails', async () => {
        const testError = new Error('Firestore delete error')
        mockGetDocs.mockRejectedValueOnce(testError)
        vi.spyOn(console, 'error').mockImplementation(() => {})

        render(
            <Chat
                roomID="test-room"
                uid="test-uid"
                logout={mockLogout}
                setRoomID={mockSetRoomID}
            />
        )

        const logoutBtn = screen.getByRole('button', { name: /logout now/i })
        fireEvent.click(logoutBtn)

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith('Error deleting messages:', testError)
            expect(mockToastError).toHaveBeenCalledWith('Failed to delete your messages.')
        })
    })

    it('should show loading, then render messages list correctly', async () => {
        render(
            <Chat
                roomID="test-room"
                uid="test-uid"
                logout={mockLogout}
                setRoomID={mockSetRoomID}
            />
        )

        // Loading is true initially
        expect(screen.getByText(/Loading messages\.\.\./i)).toBeInTheDocument()

        // Trigger onSnapshot callback with messages
        const mockSnapshot = [
            {
                id: 'msg-1',
                data: () => ({
                    room: 'test-room',
                    chat: 'Hello from current user',
                    createdAt: { seconds: 1623360000 },
                    user: 'Test User',
                    photoURL: 'http://photo.url',
                    uid: 'test-uid',
                }),
            },
            {
                id: 'msg-2',
                data: () => ({
                    room: 'test-room',
                    chat: 'Hello from another user',
                    createdAt: null, // Test fallback null time
                    user: 'Other User',
                    photoURL: 'http://other.url',
                    uid: 'other-uid',
                }),
            },
        ]

        act(() => {
            snapshotCallbacks[0](mockSnapshot)
        })

        // Loading should be false, and messages rendered
        await waitFor(() => {
            expect(screen.queryByText(/Loading messages\.\.\./i)).not.toBeInTheDocument()
            expect(screen.getByText('Hello from current user')).toBeInTheDocument()
            expect(screen.getByText('Hello from another user')).toBeInTheDocument()
            expect(screen.getByText('Test User')).toBeInTheDocument()
            expect(screen.getByText('Other User')).toBeInTheDocument()
        })
    })

    it('should render helper message if there are no messages in the room', async () => {
        render(
            <Chat
                roomID="test-room"
                uid="test-uid"
                logout={mockLogout}
                setRoomID={mockSetRoomID}
            />
        )

        // Trigger onSnapshot callback with empty list
        act(() => {
            snapshotCallbacks[0]([])
        })

        await waitFor(() => {
            expect(screen.getByText(/This room has no messages/i)).toBeInTheDocument()
        })
    })

    it('should call addDoc on form submit, and handle errors', async () => {
        const { addDoc } = await import('firebase/firestore')
        const addDocMock = vi.mocked(addDoc)

        vi.spyOn(console, 'log').mockImplementation(() => {})

        render(
            <Chat
                roomID="test-room"
                uid="test-uid"
                logout={mockLogout}
                setRoomID={mockSetRoomID}
            />
        )

        // Trigger onSnapshot to clear loading
        act(() => {
            snapshotCallbacks[0]([])
        })

        const input = screen.getByPlaceholderText(/Your messages\.\.\./i)
        fireEvent.change(input, { target: { value: 'New message' } })

        const form = input.closest('form')
        fireEvent.submit(form)

        expect(addDocMock).toHaveBeenCalledWith(undefined, {
            room: 'test-room',
            chat: 'New message',
            createdAt: undefined,
            user: 'Test User',
            roomCreator: 'test@example.com',
            photoURL: 'http://photo.url',
            uid: 'test-uid',
        })

        // Verify input is cleared
        await waitFor(() => {
            expect(input.value).toBe('')
        })

        // Case: Send empty message (should do nothing)
        addDocMock.mockClear()
        fireEvent.change(input, { target: { value: '' } })
        fireEvent.submit(form)
        expect(addDocMock).not.toHaveBeenCalled()

        // Case: addDoc throws error
        addDocMock.mockRejectedValueOnce(new Error('Firestore write failed'))
        fireEvent.change(input, { target: { value: 'Err msg' } })
        fireEvent.submit(form)

        await waitFor(() => {
            expect(console.log).toHaveBeenCalledWith('Error sending message: Error: Firestore write failed')
        })
    })
})
