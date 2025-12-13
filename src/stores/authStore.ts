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

      // Handle account linking when user already exists with different provider
      if (error.code === 'auth/account-exists-with-different-credential') {
        try {
          const { linkWithCredential } = await import('firebase/auth')
          const email = error.customData?.email

          if (!email) {
            ElMessage.error('無法取得帳號資訊')
            throw error
          }

          // Ask user to link accounts
          const { ElMessageBox } = await import('element-plus')
          await ElMessageBox.confirm(
            `此 Email (${email}) 已使用 Google 登入。是否連結 Facebook 帳號？`,
            '帳號連結',
            {
              confirmButtonText: '連結',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )

          // Sign in with Google first
          ElMessage.info('請使用 Google 重新登入')
          const googleResult = await signInWithPopup(auth, googleProvider)

          // Link Facebook credential - use OAuthProvider for Firebase v9+
          const { OAuthProvider } = await import('firebase/auth')
          const credential = OAuthProvider.credentialFromError(error)

          if (!credential) {
            ElMessage.error('無法取得 Facebook 憑證')
            throw new Error('No credential available')
          }

          await linkWithCredential(googleResult.user, credential)

          // Try to get the latest user data with linked providers
          await googleResult.user.reload()
          const updatedUser = auth.currentUser

          if (updatedUser) {
            user.value = updatedUser
            // Use the photoURL from the updated user
            const photoURL = updatedUser.photoURL || ''
            avatarUrl.value = photoURL
            localStorage.setItem('user_avatar', photoURL)

            await checkUserProfile(updatedUser)
          }
          ElMessage.success('Facebook 已連結！')

        } catch (linkError: any) {
          console.error('Linking error details:', linkError)
          console.error('Error code:', linkError.code)
          console.error('Error message:', linkError.message)

          if (linkError !== 'cancel') {
            const errorMsg = linkError.code ? `連結失敗: ${linkError.code}` : '連結失敗'
            ElMessage.error(errorMsg)
          }
          throw linkError
        }
      } else {
        ElMessage.error(`Login Failed: ${error.message}`)
        throw error
      }
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
