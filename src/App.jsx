import { signOut } from 'firebase/auth'
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { auth } from '../firebase-config'
import Auth from './componets/Auth'
import JoinRoom from './componets/JoinRoom/JoinRoom'

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    // Store user's unique ID
    const [uid, setUid] = useState(null)

    // Monitor changes in user authentication status
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in, update states
                setIsAuthenticated(true)
                setUid(user.uid)
                toast.success('Logged In successfully')
            } else {
                // User is signed out, reset states
                setIsAuthenticated(false)
                setUid(null)
            }
        })

        // Stop observing authentication status when component unmounts
        return () => unsubscribe()
    }, [])

    const logout = async () => {
        try {
            await signOut(auth)
            console.log('User logged out successfully')
            toast.warning('Logged out successfully')
            setIsAuthenticated(false)
            setUid(null) // Clear stored user ID
        } catch (error) {
            console.error('Error signing out: ', error)
        }
    }

    return (
        <div>
            <ToastContainer></ToastContainer>
            {isAuthenticated ? (
                // If authenticated, show chat room component
                <JoinRoom uid={uid} logout={logout} />
            ) : (
                // If not authenticated, show login component
                <Auth setAuth={setIsAuthenticated} />
            )}
        </div>
    )
}

export default App
