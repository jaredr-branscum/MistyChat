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
        let shouldDelete = true
        try {
            shouldDelete = window.confirm(
                'Would you like to delete all of your messages from this chatroom before leaving?'
            )
        } catch (error) {
            console.error('Error showing confirm dialog, defaulting to delete:', error)
        }

        if (shouldDelete) {
            await deleteUserMessages()
        }
        await logout()
    }

    const joinAnotherRoom = async () => {
        let shouldDelete = true
        try {
            shouldDelete = window.confirm(
                'Would you like to delete all of your messages from this chatroom before leaving?'
            )
        } catch (error) {
            console.error('Error showing confirm dialog, defaulting to delete:', error)
        }

        if (shouldDelete) {
            await deleteUserMessages()
        }
        setRoomID(null)
        toast.success('Current room was logout')
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
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white flex flex-col justify-center px-4 py-6 relative overflow-hidden">
            {/* Background blur effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 px-6 py-3 rounded-2xl lg:w-2/5 w-full mx-auto text-center mb-4 font-bold text-xl text-slate-100 flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
                Room: {roomID}
            </div>

            <div className="lg:w-2/5 w-full bg-slate-800/20 backdrop-blur-md border border-slate-700/40 p-5 rounded-3xl mx-auto lg:h-[55vh] h-[50vh] overflow-y-auto mb-4 flex flex-col gap-4 shadow-xl">
                {/* Scrollable chat message container */}
                {loading ? (
                    <div className="text-center text-slate-400 flex flex-col items-center justify-center h-full gap-2">
                        <span className="loading loading-spinner loading-md text-indigo-400"></span>
                        <span>Loading messages...</span>
                    </div>
                ) : messages.length !== 0 ? (
                    messages.map((msg) => (
                        <div key={msg.id}>
                            {/* Unique key for each message */}
                            <div className={msg.uid === uid ? 'chat chat-end' : 'chat chat-start'}>
                                <div className="chat-image avatar">
                                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-indigo-500/20">
                                        <img alt="User Avatar" src={msg.photoURL} />
                                    </div>
                                </div>
                                <div className="chat-header text-slate-300 text-xs flex items-center gap-1.5 mb-1">
                                    <span className="font-semibold">{msg.user}</span>
                                    <time className="text-[10px] text-slate-500 font-normal">
                                        {msg.createdAt
                                            ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : ''}
                                    </time>
                                </div>
                                <div className={`chat-bubble max-w-[85%] text-sm px-4 py-2.5 rounded-2xl ${msg.uid === uid ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-700 text-slate-100 rounded-tl-none'}`}>
                                    {msg.chat}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center border border-indigo-500/20 p-6 rounded-2xl bg-indigo-500/5 text-slate-300 flex flex-col items-center justify-center h-full">
                        <svg className="w-12 h-12 text-indigo-400/80 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"></path>
                        </svg>
                        <h1 className="font-semibold text-lg text-slate-200 mb-1">Welcome to {roomID}</h1>
                        <p className="text-sm text-slate-400 max-w-xs leading-relaxed">This room has no messages yet. Start the conversation by sending a message below! Once you leave, your footprint will be deleted.</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-slate-800/30 backdrop-blur-lg border border-slate-700/40 lg:w-2/5 w-full mx-auto rounded-3xl shadow-xl flex flex-col gap-4">
                {/* Message input form */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        placeholder="Your messages..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        type="text"
                        className="bg-slate-900/60 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none flex-1 transition-colors shadow-inner"
                    />
                    <button
                        type="submit"
                        className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-5 flex items-center justify-center transition-all hover:scale-105 active:scale-95 border-none shadow-md shadow-indigo-500/10 cursor-pointer"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M22 2L2 8.66667L11.5833 12.4167M22 2L15.3333 22L11.5833 12.4167M22 2L11.5833 12.4167"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </form>

                <div className="flex gap-3">
                    <button
                        className="btn bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm flex-1 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        onClick={joinAnotherRoom}
                    >
                        <svg fill="none" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                            <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                                <path d="m8 12h8" />
                                <path d="m12 16v-8" />
                                <path d="m9 22h6c5 0 7-2 7-7v-6c0-5-2-7-7-7h-6c-5 0-7 2-7 7v6c0 5 2 7 7 7z" />
                            </g>
                        </svg>
                        Join another room
                    </button>

                    <button
                        className="btn bg-red-950/40 hover:bg-red-900/40 border border-red-900/50 text-red-300 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm flex-1 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        onClick={handleLogout}
                    >
                        <svg fill="none" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                            <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                                <path d="m7.02331 5.5c-2.42505 1.61238-4.02331 4.36954-4.02331 7.5 0 4.9706 4.02944 9 9 9 4.9706 0 9-4.0294 9-9 0-3.13046-1.5983-5.88762-4.0233-7.5" />
                                <path d="m12 2v8" />
                            </g>
                        </svg>
                        Logout now
                    </button>
                </div>
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
