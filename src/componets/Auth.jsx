import { browserLocalPersistence, setPersistence, signInWithPopup } from 'firebase/auth'
import { toast } from 'react-toastify'
import { auth, provider } from '../../firebase-config'
import PropTypes from 'prop-types'
import React from 'react'

export default function Auth({ setAuth }) {
    const handleLogin = async () => {
        try {
            // Set session persistence to keep the user logged in after page reloads
            await setPersistence(auth, browserLocalPersistence)

            const result = await signInWithPopup(auth, provider)

            if (result.user) {
                setAuth(true)
            } else {
                setAuth(false)
                toast.error('Something went wrong.')
            }
        } catch (error) {
            console.error('Error during login:', error)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background blur effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="text-center max-w-2xl w-full mb-12">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-indigo-300 text-xs font-semibold mb-6">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                    Now powered by React 19 & Tailwind v4
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent mb-4">
                    MistyChat
                </h1>
                <p className="text-slate-300 text-lg md:text-xl max-w-md mx-auto leading-relaxed">
                    Secure, real-time group chatrooms. Connect instantly, chat privately, and keep your footprint clean.
                </p>
            </div>

            {/* Features Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
                <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl text-left hover:border-slate-600 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path>
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-100">Instant Rooms</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Enter any unique room name to connect. Share the name with friends to chat instantly without limits.</p>
                </div>

                <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl text-left hover:border-slate-600 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-100">Secure Google Auth</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Log in quickly and securely with your Google account. Your session persistence keeps you logged in securely.</p>
                </div>

                <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl text-left hover:border-slate-600 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-100">Flexible Privacy</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Choose to wipe your entire chat history when leaving a room or logging out, keeping your conversations private.</p>
                </div>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-slate-800/30 backdrop-blur-lg border border-slate-700/40 p-8 rounded-3xl text-center shadow-xl">
                <h2 className="text-xl font-bold mb-2">Get Started</h2>
                <p className="text-slate-400 text-sm mb-6">Sign in with your Google account to create or join a chatroom.</p>
                {/* Button to initiate Google login */}
                <button
                    onClick={handleLogin}
                    className="btn w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3.5 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 border-none shadow-md shadow-white/5"
                >
                    <svg
                        enableBackground="new 0 0 48 48"
                        height="24"
                        viewBox="0 0 48 48"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="m43.611 20.083h-1.611v-.083h-18v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657c-3.572-3.329-8.35-5.382-13.618-5.382-11.045 0-20 8.955-20 20s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                            fill="#ffc107"
                        />
                        <path
                            d="m6.306 14.691 6.571 4.819c1.778-4.402 6.084-7.51 11.123-7.51 3.059 0 5.842 1.154 7.961 3.039l5.657-5.657c-3.572-3.329-8.35-5.382-13.618-5.382-7.682 0-14.344 4.337-17.694 10.691z"
                            fill="#ff3d00"
                        />
                        <path
                            d="m24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238c-2.008 1.521-4.504 2.43-7.219 2.43-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025c3.31 6.477 10.032 10.921 17.805 10.921z"
                            fill="#4caf50"
                        />
                        <path
                            d="m43.611 20.083h-1.611v-.083h-18v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238c-.438.398 6.591-4.807 6.591-14.807 0-1.341-.138-2.65-.389-3.917z"
                            fill="#1976d2"
                        />
                    </svg>{' '}
                    Sign in with Google
                </button>
            </div>
        </div>
    )
}

Auth.propTypes = {
    setAuth: PropTypes.func.isRequired,
}
