import React, { useRef } from 'react'
import { auth } from '../../../firebase-config'
import PropTypes from 'prop-types'

export default function Join({ setRoomID, logout }) {
    const getRoomID = useRef(null)

    const handleRoomBtn = () => {
        setRoomID(getRoomID.current.value)
    }
    const name = auth.currentUser.displayName
    const email = auth.currentUser.email
    const photoURL = auth.currentUser.photoURL

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
            {/* Background blur effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="w-full max-w-md bg-slate-800/30 backdrop-blur-lg border border-slate-700/40 p-8 rounded-3xl shadow-2xl text-center">
                {/* User Info Section */}
                <div className="flex flex-col items-center mb-6">
                    {photoURL ? (
                        <div className="avatar mb-4">
                            <div className="w-20 h-20 rounded-full ring-2 ring-indigo-500 ring-offset-base-100 ring-offset-2 overflow-hidden shadow-lg">
                                <img src={photoURL} alt="User Avatar" />
                            </div>
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 mb-4 shadow-lg">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"></path>
                            </svg>
                        </div>
                    )}
                    <h1 className="text-2xl font-bold tracking-tight mb-1">Hello! {name}</h1>
                    <span className="text-slate-400 text-sm">{email}</span>
                </div>

                <div className="h-px bg-slate-700/50 w-full my-6"></div>

                {/* Input and Join Actions */}
                <div className="space-y-4">
                    <div className="text-left">
                        <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block mb-2">Room Code / Name</label>
                        <input
                            ref={getRoomID}
                            placeholder="Type room name..."
                            className="bg-slate-900/60 border border-slate-700 focus:border-indigo-500 rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none w-full transition-colors shadow-inner"
                            type="text"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            className="btn bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold py-3 px-6 rounded-2xl flex-1 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            onClick={logout}
                        >
                            <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                                <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                                    <path d="m7.02331 5.5c-2.42505 1.61238-4.02331 4.36954-4.02331 7.5 0 4.9706 4.02944 9 9 9 4.9706 0 9-4.0294 9-9 0-3.13046-1.5983-5.88762-4.0233-7.5" />
                                    <path d="m12 2v8" />
                                </g>
                            </svg>
                            Logout
                        </button>

                        <button
                            className="btn bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-2xl flex-1 flex items-center justify-center gap-2 border-none shadow-md shadow-indigo-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            onClick={handleRoomBtn}
                        >
                            Join Room
                            <svg fill="none" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
                                <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                                    <path d="m8 12h8" />
                                    <path d="m12 16v-8" />
                                    <path d="m9 22h6c5 0 7-2 7-7v-6c0-5-2-7-7-7h-6c-5 0-7 2-7 7v6c0 5 2 7 7 7z" />
                                </g>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

Join.propTypes = {
    setRoomID: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
}
