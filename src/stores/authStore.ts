import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, googleProvider, facebookProvider, lineProvider } from '../firebase'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  // Optimistic User from Cache to prevent flashing
  const cachedUser = localStorage.getItem('user_cache')
  const initialUser = cachedUser ? JSON.parse(cachedUser) : null

  const user = ref<FirebaseUser | any>(initialUser)
  const userProfile = ref<any>(null) // Extra profile data from Firestore
  // Initialize isAdmin from cache if available
  const isAdmin = ref(initialUser?.role === 'admin' || false)

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
      // Cache minimal user info
      localStorage.setItem('user_cache', JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        role: 'user' // Default role for new login, will be updated by checkUserProfile
      }))

      await checkUserProfile(result.user)
    } catch (error: any) {
      console.error('Login Failed', error)
      ElMessage.error(`Login Failed: ${error.message}`)
      throw error
    }
  }

  const loginWithLine = async () => {
    try {
      const result = await signInWithPopup(auth, lineProvider)

      // Check quota for NEW users
      // 1. Check if user profile exists
      const userRef = doc(db, 'users', result.user.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        // 2. Check and Increment Quota
        const { runTransaction } = await import('firebase/firestore')
        const configRef = doc(db, 'config', 'line_login')

        try {
          await runTransaction(db, async (transaction) => {
            const configSnap = await transaction.get(configRef)

            let currentCount = 0
            if (configSnap.exists()) {
              currentCount = configSnap.data().count || 0
            }

            const MAX_USERS = 49
            if (currentCount >= MAX_USERS) {
              throw new Error('Quota Exceeded')
            }

            // Increment
            transaction.set(configRef, { count: currentCount + 1 }, { merge: true })
          })
        } catch (e: any) {
          if (e.message === 'Quota Exceeded') {
            await signOut(auth)
            user.value = null
            throw new Error('LINE 登入人數已達上限 (49人)，暫無法註冊')
          }
          throw e
        }
      }

      user.value = result.user
      avatarUrl.value = result.user.photoURL || ''
      localStorage.setItem('user_avatar', result.user.photoURL || '')
      localStorage.setItem('user_cache', JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        role: 'user'
      }))

      await checkUserProfile(result.user)
    } catch (error: any) {
      console.error('LINE Login Failed', error)
      ElMessage.error(`LINE Login Failed: ${error.message}`)
      throw error
    }
  }

  const loginWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider)
      user.value = result.user
      avatarUrl.value = result.user.photoURL || ''
      localStorage.setItem('user_avatar', result.user.photoURL || '')
      localStorage.setItem('user_cache', JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        role: 'user' // Default
      }))

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
            localStorage.setItem('user_cache', JSON.stringify({
              uid: updatedUser.uid,
              email: updatedUser.email,
              displayName: updatedUser.displayName,
              photoURL: updatedUser.photoURL,
              role: 'user'
            }))

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
      localStorage.removeItem('user_cache')

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

      // Update cache with actual role
      const currentCache = localStorage.getItem('user_cache')
      if (currentCache) {
        const cacheObj = JSON.parse(currentCache)
        cacheObj.role = data.role
        localStorage.setItem('user_cache', JSON.stringify(cacheObj))
      }
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

        // Preserve existing cache role if available, or default to null until checkUserProfile
        const existingCache = localStorage.getItem('user_cache')
        const existingRole = existingCache ? JSON.parse(existingCache).role : null

        localStorage.setItem('user_cache', JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: existingRole
        }))

        await checkUserProfile(currentUser)
      } else {
        userProfile.value = null
        isAdmin.value = false
        // Clear Cache only if we are sure user is logged out (which this callback confirms)
        avatarUrl.value = ''
        localStorage.removeItem('user_avatar')
        localStorage.removeItem('user_cache')
      }
      isInitialized.value = true
    })
  }

  const isLineLoginFull = ref(false)

  const checkLineQuota = async () => {
    try {
      const configRef = doc(db, 'config', 'line_login')
      const configSnap = await getDoc(configRef)
      if (configSnap.exists()) {
        const count = configSnap.data().count || 0
        // Max 49 users
        isLineLoginFull.value = count >= 49
      } else {
        isLineLoginFull.value = false
      }
    } catch (error) {
      console.error('Failed to check LINE quota', error)
      // Default to false if check fails, let backend reject if needed
      isLineLoginFull.value = false
    }
  }

  return {
    user,
    isAdmin,
    isInitialized,
    isAuthenticated,
    userAvatar,
    userName,
    isLineLoginFull,
    checkLineQuota,
    loginWithGoogle,
    loginWithFacebook,
    loginWithLine,
    logout,
    initAuth
  }
})
