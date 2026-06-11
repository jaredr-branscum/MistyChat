import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

vi.mock('firebase/firestore', () => {
    return {
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
        onSnapshot: vi.fn(() => vi.fn()), // returns unsubscribe function
        addDoc: vi.fn(),
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
})
