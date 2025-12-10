import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// TODO: Replace with your actual Firebase project configuration
// You can get this from the Firebase Console -> Project Settings
const firebaseConfig = {
  apiKey: "AIzaSyBvaz-n8YVA8mMtvvqEyJz8noJXUE5amwI",
  authDomain: "chatroomdemo-123.firebaseapp.com",
  projectId: "chatroomdemo-123",
  storageBucket: "chatroomdemo-123.firebasestorage.app",
  messagingSenderId: "1056814699810",
  appId: "1:1056814699810:web:dc1c507c4cff7f53e4417b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db }
