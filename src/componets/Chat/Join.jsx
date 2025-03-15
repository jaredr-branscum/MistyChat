import { useRef } from 'react'
import { auth } from '../../../firebase-config'
import PropTypes from 'prop-types'

export default function Join({ setRoomID, logout }) {
    const getRoomID = useRef(null)

    const handleRoomBtn = () => {
        setRoomID(getRoomID.current.value)
    }
    const name = auth.currentUser.displayName
    const email = auth.currentUser.email
    return (
        <div className="h-screen px-3 lg:w-3/12 mx-auto text-center grid grid-cols-1 items-center justify-center">
            <div className="">
                <h1 className="text-2xl">Hello! {name}</h1>
                <div className="divider">{email}</div>
                <input
                    ref={getRoomID}
                    placeholder="Type room name..."
                    className="input input-md my-2 input-bordered w-full"
                    type="text"
                />{' '}
                <br />
                <div className="flex items-center justify-center gap-1 mt-2">
                    <button className="btn hover:bg-red-700 bg-red-500 btn-md text-white" onClick={logout}>
                        <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                            <g stroke="#ffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                                <path d="m7.02331 5.5c-2.42505 1.61238-4.02331 4.36954-4.02331 7.5 0 4.9706 4.02944 9 9 9 4.9706 0 9-4.0294 9-9 0-3.13046-1.5983-5.88762-4.0233-7.5" />
                                <path d="m12 2v8" />
                            </g>
                        </svg>{' '}
                        Logout
                    </button>

                    <button className="btn bg-green-500 hover:bg-green-600 text-white btn-md" onClick={handleRoomBtn}>
                        Join Room{' '}
                        <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                            <g stroke="#ffff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                                <path d="m8 12h8" />
                                <path d="m12 16v-8" />
                                <path d="m9 22h6c5 0 7-2 7-7v-6c0-5-2-7-7-7h-6c-5 0-7 2-7 7v6c0 5 2 7 7 7z" />
                            </g>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

Join.propTypes = {
    setRoomID: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
}
