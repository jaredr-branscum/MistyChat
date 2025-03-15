# Real-Time Group Chat Application

Real-time group chat application using React, Firebase for store data and real-time communication. Users can authenticate with Google, create rooms, and send messages in real time.

## Features

- **User Authentication**: Users can sign in using their Google account with Firebase authentication.
- **Room Creation**: Users can create and join unique rooms for chatting, each identified by a unique room ID.
- **Real-time Messaging**: Messages are sent and received in real time using Firestore, ensuring instant communication.
- **Message Storage**: All messages are stored in Firebase Firestore for persistence and retrieval.
- **Message Deletion**: Whenever the user decides to join another room or signout, their message are removed from the chat room. Messages are deleted client-side, handling the logic on the server-side is on the TODO.

## Main Project File Structure

- `App.jsx` The main application component handling user authentication and routing to the chat room.
- `Auth.jsx`: Component for user authentication via Google.
- `Chat.jsx`: Component for rendering the chat interface, sending messages, and displaying chat history.

## Installation

1. **Install dependencies:**:

    ```bash
    npm install

    ```

2. **Run Project**:

    ```bash
    npm run dev
    ```

## Firebase Configuration:

- **Firebase Setup**: Make sure to set up your Firebase project and update your Firebase configuration in `firebase-config.js` to connect your app to Firebase services. Or configure the values in your .env.local file.

4. **Access the application:** Open http://localhost:5173 in your browser.

## Dependencies Used

- **react**: JavaScript library for building user interfaces.
- **firebase**: For user authentication and data storage.
- **tailwindcss**: For make fontend part.
