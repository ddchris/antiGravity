
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../authStore'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ElMessage } from 'element-plus'

// Mock Firebase
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  FacebookAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn()
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn()
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock Firebase Config imports
vi.mock('../../firebase', () => ({
  auth: {},
  db: {},
  googleProvider: {},
  facebookProvider: {}
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initial state should be logged out', () => {
    const authStore = useAuthStore()
    expect(authStore.user).toBeNull()
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.isAdmin).toBe(false)
  })

  // More meaningful tests would need complex mocking of Firebase response
  // Here we just test basic state logic assuming mocks work
})
