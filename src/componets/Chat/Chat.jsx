import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    where,
    doc,
    writeBatch,
    getDocs,
} from 'firebase/firestore'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { auth, database } from '../../../firebase-config'
import PropTypes from 'prop-types'

export default function Chat({ roomID, uid, logout, setRoomID }) {
    const [newMessage, setNewMessage] = useState('') // State for the new message input
    const [messages, setMessages] = useState([]) // State to hold chat messages
    const messagesEndRef = useRef(null) // Ref to scroll to the end of the messages
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!roomID) return
        setLoading(true) // Set loading to true when roomID changes

        // Query to fetch messages for the specific chat room, ordered by creation time
        const messageQuery = query(collection(database, 'messages'), where('room', '==', roomID), orderBy('createdAt'))

        // Subscribe to the snapshot of messages
        const getData = onSnapshot(messageQuery, (snapshotData) => {
            let messages = []
            snapshotData.forEach((data) => {
                // Add each message to the messages array
                messages.push({ ...data.data(), id: data.id })
            })
            setMessages(messages) // Update the messages state
            setLoading(false)
        })

        return () => getData() // Cleanup function to unsubscribe from the listener
    }, [roomID]) // Effect runs whenever roomID changes

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom() // Automatically scroll to the bottom whenever messages change
    }, [messages])

    const handleLogout = async () => {
        await deleteUserMessages()
        await logout()
    }

    const joinAnotherRoom = () => {
        setRoomID(null)
        toast.success('Current room was logout')
        deleteUserMessages()
    }

    const handleSendMessage = async (e) => {
        e.preventDefault() // Prevent default form submission

        if (newMessage === '') return // Do not send empty messages

        try {
            await addDoc(collection(database, 'messages'), {
                room: roomID,
                chat: newMessage,
                createdAt: serverTimestamp(),
                user: auth.currentUser.displayName,
                roomCreator: auth.currentUser.email,
                photoURL: auth.currentUser.photoURL,
                uid: auth.currentUser.uid,
            })
        } catch (error) {
            console.log('Error sending message: ' + error)
        } finally {
            setNewMessage('')
        } // Clear the message input after sending
    }

    const deleteUserMessages = async () => {
        if (!roomID || !uid) return

        try {
            const messagesToDeleteQuery = query(
                collection(database, 'messages'),
                where('room', '==', roomID),
                where('uid', '==', uid),
            )

            const messagesToDeleteSnapshot = await getDocs(messagesToDeleteQuery)
            const batch = writeBatch(database)

            messagesToDeleteSnapshot.forEach((docSnap) => {
                batch.delete(doc(database, 'messages', docSnap.id))
            })

            await batch.commit()
            toast.success('Your messages were deleted.')
        } catch (error) {
            console.error('Error deleting messages:', error)
            toast.error('Failed to delete your messages.')
        }
    }

    return (
        <div className="h-screen flex flex-col justify-center px-2">
            <div className="divider lg:w-2/5 w-full mx-auto">{roomID}</div>
            <div className="lg:w-2/5 w-full bg-gray-50 border p-4 rounded-lg mx-auto py-5 lg:h-3/5 overflow-y-scroll">
                {/* Scrollable chat message container */}
                {loading ? (
                    <div className="text-center">Loading messages...</div>
                ) : messages.length !== 0 ? (
                    messages.map((msg) => (
                        <div key={msg.id}>
                            {/* Unique key for each message */}
                            <div className={msg.uid === uid ? 'chat chat-end' : 'chat chat-start'}>
                                <div className="chat-image avatar">
                                    <div className="w-10 rounded-full">
                                        <img alt="User Avatar" src={msg.photoURL} />
                                    </div>
                                </div>
                                <div className="chat-header">
                                    {msg.user}
                                    {/* Display user's name */}
                                    <time className="text-xs opacity-50">
                                        {msg.createdAt
                                            ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString()
                                            : ''}
                                    </time>
                                    {/* Format and display message timestamp */}
                                </div>
                                <div className="chat-bubble">{msg.chat}</div>
                                {/* Display message content */}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center border p-3 bg-green-100">
                        <h1>
                            This room has no messages; you can join any of your friends without any limits by using the
                            room name (<span className="font-bold text-yellow-600">{roomID}</span> ) you created.
                            <br />
                        </h1>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="text-center p-2 bg-gray-300 lg:w-2/5 w-full mx-auto">
                {/* Message input form */}
                <form onSubmit={handleSendMessage} className="grid gap-2 grid-cols-5">
                    <input
                        placeholder="Your messages..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        type="text"
                        className="input col-span-4 input-bordered w-full"
                    />
                    <button
                        type="submit"
                        className="bg-green-500 btn flex items-center col-span-1 text-white hover:bg-green-600"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M22 2L2 8.66667L11.5833 12.4167M22 2L15.3333 22L11.5833 12.4167M22 2L11.5833 12.4167"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </form>
                <button
                    className="btn bg-red-500 hover:bg-red-900 text-sm text-white btn-sm my-2 rounded-md"
                    onClick={handleLogout}
                >
                    Logout now
                    <svg fill="none" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
                        <g stroke="#ffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                            <path d="m7.02331 5.5c-2.42505 1.61238-4.02331 4.36954-4.02331 7.5 0 4.9706 4.02944 9 9 9 4.9706 0 9-4.0294 9-9 0-3.13046-1.5983-5.88762-4.0233-7.5" />
                            <path d="m12 2v8" />
                        </g>
                    </svg>
                </button>
                <button
                    className="btn bg-slate-700 hover:bg-slate-900 text-sm text-white btn-sm my-2 rounded-md"
                    onClick={joinAnotherRoom}
                >
                    Join another room
                    <svg fill="none" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
                        <g stroke="#ffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                            <path d="m8 12h8" />
                            <path d="m12 16v-8" />
                            <path d="m9 22h6c5 0 7-2 7-7v-6c0-5-2-7-7-7h-6c-5 0-7 2-7 7v6c0 5 2 7 7 7z" />
                        </g>
                    </svg>
                </button>
            </div>
        </div>
    )
}

Chat.propTypes = {
    roomID: PropTypes.string,
    uid: PropTypes.string,
    logout: PropTypes.func.isRequired,
    setRoomID: PropTypes.func.isRequired,
}
