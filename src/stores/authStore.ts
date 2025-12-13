import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider, facebookProvider } from '../firebase'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<FirebaseUser | null>(null)
  const userProfile = ref<any>(null) // Extra profile data from Firestore
  const isAdmin = ref(false)
  const isInitialized = ref(false)
  // Optimistic Avatar from Cache
  const avatarUrl = ref(localStorage.getItem('user_avatar') || '')

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  // Use the reactive avatarUrl which encapsulates cache + live update
  const userAvatar = computed(() => avatarUrl.value || user.value?.photoURL || '')
  const userName = computed(() => user.value?.displayName || user.value?.email || 'User')

  // Actions
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      user.value = result.user
      avatarUrl.value = result.user.photoURL || ''
      localStorage.setItem('user_avatar', result.user.photoURL || '')

      await checkUserProfile(result.user)
    } catch (error: any) {
      console.error('Login Failed', error)
      ElMessage.error(`Login Failed: ${error.message}`)
      throw error
    }
  }

  const loginWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider)
      user.value = result.user
      avatarUrl.value = result.user.photoURL || ''
      localStorage.setItem('user_avatar', result.user.photoURL || '')

      await checkUserProfile(result.user)
    } catch (error: any) {
      console.error('Login Failed', error)
      ElMessage.error(`Login Failed: ${error.message}`)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
      userProfile.value = null
      isAdmin.value = false

      // Clear Cache
      avatarUrl.value = ''
      localStorage.removeItem('user_avatar')

    } catch (error: any) {
      ElMessage.error(`Logout Failed: ${error.message}`)
    }
  }

  // Helper: Check/Create User Profile in Firestore & Check Admin Role
  const checkUserProfile = async (firebaseUser: FirebaseUser) => {
    if (!firebaseUser) return

    const userRef = doc(db, 'users', firebaseUser.uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const data = userSnap.data()
      userProfile.value = data
      // Check Admin Role
      isAdmin.value = data.role === 'admin'
    } else {
      // Create new user document
      const newProfile = {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: 'user', // Default role
        createdAt: new Date()
      }
      await setDoc(userRef, newProfile)
      userProfile.value = newProfile
      isAdmin.value = false
    }
  }

  // Initialize Listener
  const initAuth = () => {
    onAuthStateChanged(auth, async (currentUser) => {
      user.value = currentUser
      if (currentUser) {
        // Update Cache
        const photo = currentUser.photoURL || ''
        avatarUrl.value = photo
        localStorage.setItem('user_avatar', photo)

        await checkUserProfile(currentUser)
      } else {
        userProfile.value = null
        isAdmin.value = false
        // Clear Cache only if we are sure user is logged out (which this callback confirms)
        avatarUrl.value = ''
        localStorage.removeItem('user_avatar')
      }
      isInitialized.value = true
    })
  }

  return {
    user,
    isAdmin,
    isInitialized,
    isAuthenticated,
    userAvatar,
    userName,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    initAuth
  }
})
