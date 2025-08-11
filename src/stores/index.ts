// Re-export all game store functionality
export { useGameStore } from './gameStore'
export type {
  GameGuess,
  GameConfig,
  PlayerData,
  GameState,
  GameStore
} from './gameStore'

// Re-export all room store functionality
export { useRoomStore } from './roomStore'
export type {
  RoomState,
  RoomStore,
  CreateRoomPayload,
  CreateQuickPlayPayload
} from './roomStore'

// Re-export user store functionality
export { useUserStore } from './userStore'

// Re-export auth hooks
export {
  useAuth,
  useAuthenticatedApi,
  useAuthToken,
  useCurrentUser
} from '../hooks/useAuth'

// Re-export auth types
export type {
  ApiError,
  AuthState,
  AuthActions,
  UserStore,
  LoginCredentials,
  User
} from '../stores/authStore'
