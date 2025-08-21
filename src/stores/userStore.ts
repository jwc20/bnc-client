import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { usersApiLogin, usersApiMe } from '../api/sdk.gen'
import type { MeResponse, ActivityResponseSchema } from '../api/types.gen'
import type {
  ApiError,
  UserStore,
  LoginCredentials,
  User
} from '../stores/authStore'

const STORAGE_KEY = 'user-storage'

const handleApiError = (error: unknown): string => {
  const apiError = error as ApiError
  return apiError?.message || apiError?.detail || 'An error occurred'
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // State
      token: null,
      user: null,
      isLoading: false,
      error: null,
      me: null,
      activities: [],

      // Basic setters
      setToken: (token: string) => set({ token }),
      setUser: (user: User) => set({ user }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
      setActivities: (activities: ActivityResponseSchema[]) =>
        set({ activities }),
      setMe: (me: MeResponse) =>
        set({
          user: {
            id: me.id ?? null,
            username: me.username,
            email: me.email
          },
          activities: me.activities ?? []
        }),

      // Auth actions
      login: async (credentials: LoginCredentials): Promise<boolean> => {
        set({ isLoading: true, error: null })

        try {
          const response = await usersApiLogin({
            body: credentials
          })

          if (response.data) {
            set({
              token: response.data.token,
              user: {
                id: 0, // Will be populated by fetchProfile
                username: response.data.username,
                email: ''
              },
              isLoading: false,
              error: null
            })

            // Fetch full profile after login
            await get().fetchProfile(response.data.token)
            return true
          } else {
            throw new Error('No response data received')
          }
        } catch (error: unknown) {
          const errorMessage = handleApiError(error) || 'Login failed'
          set({
            token: null,
            user: null,
            isLoading: false,
            error: errorMessage
          })
          return false
        }
      },

      fetchProfile: async (token: string | null): Promise<boolean> => {
        try {
          console.log('token', token)
          if (!token) {
            token = get().token
            console.log('token', token)
          }
          const response = await usersApiMe({
            headers: {
              Authorization: `Bearer ${token}`
            }
          })

          if (response.data) {
            console.log('aaaaaaaaaa', response.data)
            get().setMe(response.data)
            get().setActivities(response.data.activities)
            set({ error: null })
            return true
          } else {
            throw new Error('No profile data received')
          }
        } catch (error: unknown) {
          const errorMessage =
            handleApiError(error) || 'Failed to fetch profile'
          set({ error: errorMessage })
          return false
        }
      },

      isAuthenticated: (): boolean => {
        const { token, user } = get()
        return !!(token && user)
      },

      clearAuth: () => {
        set({
          token: null,
          user: null,
          error: null
        })
        localStorage.removeItem(STORAGE_KEY)
      }
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),

      partialize: state => ({
        token: state.token,
        user: state.user
      }),

      onRehydrateStorage: () => state => {
        if (state?.token && state?.user) {
          // Optionally refresh profile on rehydration
          state.fetchProfile(state.token).catch(() => {
            state.clearAuth()
          })
        }
      }
    }
  )
)
