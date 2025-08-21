// Types are re-exported below; avoid circular self-imports. Define local interfaces only.
import type { ActivityResponseSchema as Activity } from '../api/types.gen'
import type { MeResponse } from '../api/types.gen'
import type { UserLeaderboardSchema as LeaderboardItem } from '../api/types.gen'

export interface ApiError {
  detail?: string
  message?: string
  error?: string
}

export interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  error: string | null
  activities: Activity[]
  leaderboard: LeaderboardItem[]
}

export interface AuthActions {
  setToken: (token: string) => void
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setActivities: (activities: Activity[]) => void
  setMe: (me: MeResponse) => void
  setLeaderboard: (leaderboard: LeaderboardItem[]) => void
  login: (credentials: LoginCredentials) => Promise<boolean>
  fetchProfile: (token: string) => Promise<boolean>
  fetchLeaderboard: () => Promise<boolean>
  isAuthenticated: () => boolean
  clearAuth: () => void
}

export interface UserStore extends AuthState, AuthActions {}

// Re-export API types for convenience
export type {
  UserLogin as LoginCredentials,
  UserSchema as User,
  ActivityResponseSchema as Activity,
  MeResponse as MeResponse,
  UserLeaderboardSchema as LeaderboardItem
} from '../api/types.gen'
