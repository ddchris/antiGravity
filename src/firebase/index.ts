import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// TODO: User needs to replace these with their own Firebase config keys
const firebaseConfig = {
  apiKey: "AIzaSyBvaz-n8YVA8mMtvvqEyJz8noJXUE5amwI",
  authDomain: "chatroomdemo-123.firebaseapp.com",
  projectId: "chatroomdemo-123",
  storageBucket: "chatroomdemo-123.firebasestorage.app",
  messagingSenderId: "1056814699810",
  appId: "1:1056814699810:web:dc1c507c4cff7f53e4417b"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Services
const auth = getAuth(app)
const db = getFirestore(app)

// Providers
const googleProvider = new GoogleAuthProvider()
const facebookProvider = new FacebookAuthProvider()
// Firebase's FacebookAuthProvider requests 'email' by default
// We need to explicitly control scopes to avoid permission errors in development
facebookProvider.setCustomParameters({
  display: 'popup',
  auth_type: 'reauthenticate'
})

// LINE Provider (OIDC)
import { OAuthProvider } from 'firebase/auth'
const lineProvider = new OAuthProvider('oidc.line') // Ensure this matches your Firebase Console provider ID
lineProvider.setCustomParameters({
  // prompt: 'consent' // Force consent prompt if needed
})

export { auth, db, googleProvider, facebookProvider, lineProvider }
