# Real-Time Group Chat Application

Real-time group chat application using React, Firebase for store data and real-time communication. Users can authenticate with Google, create rooms, and send messages in real time.

## Features

- **User Authentication**: Users can sign in using their Google account with Firebase authentication.
- **Room Creation**: Users can create and join unique rooms for chatting, each identified by a unique room ID.
- **Real-time Messaging**: Messages are sent and received in real time using Firestore, ensuring instant communication.
- **Message Storage**: All messages are stored in Firebase Firestore for persistence and retrieval.
- **Message Deletion**: Whenever the user decides to join another room or signout, their message are removed from the chat room.

## Main Project File Structure

- `App.jsx` The main application component handling user authentication and routing to the chat room.
- `Auth.jsx`: Component for user authentication via Google.
- `Chat.jsx`: Component for rendering the chat interface, sending messages, and displaying chat history.

## Installation & Setup

### 1. Install Dependencies
Clone the repository and run:
```bash
npm install
```

### 2. Configure Firebase
To connect the application to Firebase, you need to create a project in the Firebase Console:

1. **Create a Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. **Enable Google Authentication:**
   - Go to **Build > Authentication > Sign-in method**.
   - Enable **Google** as a sign-in provider.
3. **Create Firestore Database:**
   - Go to **Build > Firestore Database** and click **Create database**.
   - Start in Test Mode or configure rules to allow read/write access to the `messages` collection.
   - The application will automatically create the `messages` collection on the first message sent.
4. **Get Firebase Web App Config:**
   - Go to **Project Settings (gear icon) > General**.
   - Under **Your apps**, register a new **Web app** (`</>`).
   - Copy the configuration object values (API Key, Project ID, etc.).

### 3. Setup Environment Variables
1. Copy the template configuration file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and paste your Firebase credentials into the corresponding environment variables:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=1:your_app_id_here
   VITE_FIREBASE_MEASUREMENT_ID=G-your_measurement_id
   ```

### 4. Run the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to access the app.

## Dependencies Used
- **React 19**: Frontend UI library.
- **Vite 8**: Build tool and dev server.
- **Tailwind CSS v4 & DaisyUI v5**: Utility-first CSS styling and components.
- **Firebase 11**: Google Authentication and Cloud Firestore.
- **React-Toastify 11**: Real-time notifications and alerts.

