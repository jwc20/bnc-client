import { create } from 'zustand'
import type {
  RoomSchema,
  CreateRoomRequest,
  CreateRandomSingleplayerRoomRequest,
  // CheckBullsCowsResponse,
  // CheckBullsCowsRequest
} from '../api/types.gen'
import {
  gamesApiCreateRoom,
  gamesApiCreateRandomSingleplayerRoom
} from '../api/sdk.gen'

interface GameGuess {
  guess: number[]
  bulls: number
  cows: number
  player?: string
  timestamp?: string
}

interface GameConfig {
  code_length: number
  num_of_colors: number
  num_of_guesses: number
  game_type: number
}

interface PlayerData {
  name: string
  guesses: GameGuess[]
  game_won: boolean
  game_over: boolean
  current_row: number
  remaining_guesses: number
}

interface GameState {
  guesses: GameGuess[]
  current_row: number
  game_over: boolean
  game_won: boolean
  remaining_guesses: number
  isLoading: boolean
  secret_code: number[] | null
  room_id: number | null
  config: GameConfig
  mode: string
  players?: string[]
  players_data?: { [key: string]: PlayerData }
  winners?: string[]
  game_started?: boolean
}

interface GameStore {
  gameState: GameState
  setGameType: (type: number) => void
  initializeGameFromRoom: (room: RoomSchema) => void
  setLoading: (loading: boolean) => void
  updateGameState: (newState: Partial<GameState>) => void
  removePlayerData: (playerId: string) => void
  createRoom: (data: CreateRoomRequest) => Promise<RoomSchema>
  createRandomSingleplayerRoom: (
      data: CreateRandomSingleplayerRoomRequest
  ) => Promise<RoomSchema>
}

const DEFAULT_CONFIG: GameConfig = {
  code_length: 4,
  num_of_colors: 6,
  num_of_guesses: 10,
  game_type: 1
}

const debugLog = (message: string, data?: unknown) => {
  if (import.meta.env.VITE_DEV) {
    console.log(message, data)
  }
}

const getGameMode = (gameType: number): string => {
  return gameType === 2 ? "MULTI_BOARD" : "SINGLE_BOARD"
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: {
    guesses: [],
    current_row: 0,
    game_over: false,
    game_won: false,
    remaining_guesses: DEFAULT_CONFIG.num_of_guesses,
    isLoading: false,
    secret_code: null,
    room_id: null,
    config: DEFAULT_CONFIG,
    mode: getGameMode(DEFAULT_CONFIG.game_type),
    players: [],
    players_data: {},
    winners: [],
    game_started: false
  },

  setLoading: loading => {
    if (typeof loading !== 'boolean') {
      console.error('Invalid loading state provided')
      return
    }

    set(state => ({
      gameState: { ...state.gameState, isLoading: loading }
    }))
  },

  updateGameState: newState => {
    if (!newState || typeof newState !== 'object') {
      console.error('Invalid state update provided')
      return
    }

    debugLog('Updating game state:', newState)
    set(state => {
      // FIX: Simplify the update logic. Trust the incoming newState.
      // The new config from the server overwrites the old one.
      const updatedConfig = {
        ...state.gameState.config,
        ...(newState.config || {}),
      }

      return {
        gameState: {
          ...state.gameState,
          ...newState,
          isLoading: false,
          config: updatedConfig,
          mode: getGameMode(updatedConfig.game_type)
        }
      }
    })
  },

  removePlayerData: (playerId: string) => {
    if (!playerId) {
      console.error('Invalid player ID provided')
      return
    }

    debugLog('Removing player data for:', playerId)
    set(state => {
      const newState = { ...state.gameState }

      // Remove player from players array
      if (newState.players) {
        newState.players = newState.players.filter(id => id !== playerId)
      }

      // Remove player data from players_data
      if (newState.players_data) {
        const { [playerId]: removed, ...remainingPlayersData } = newState.players_data
        console.log(removed)
        newState.players_data = remainingPlayersData
      }

      // Remove player's guesses from guesses array
      if (newState.guesses) {
        newState.guesses = newState.guesses.filter(guess => guess.player !== playerId)
      }

      // Remove player from winners if present
      if (newState.winners) {
        newState.winners = newState.winners.filter(id => id !== playerId)
      }

      // Update current_row based on remaining guesses
      if (newState.guesses) {
        newState.current_row = newState.guesses.length
      }

      return { gameState: newState }
    })
  },

  setGameType: (type) => {
    set((state) => ({
      gameState: {
        ...state.gameState,
        config: { ...state.gameState.config, game_type: type },
        mode: getGameMode(type)
      }
    }))
  },

  initializeGameFromRoom: (room) => {
    if (!room) {
      console.error('Invalid room data provided')
      return
    }

    // FIX: Drastically simplify initialization. The `room` object from the API
    // is the absolute source of truth for the new game's configuration.
    const config: GameConfig = {
      code_length: room.code_length ?? DEFAULT_CONFIG.code_length,
      num_of_colors: room.num_of_colors ?? DEFAULT_CONFIG.num_of_colors,
      num_of_guesses: room.num_of_guesses ?? DEFAULT_CONFIG.num_of_guesses,
      game_type: room.game_type ?? DEFAULT_CONFIG.game_type // Directly use room's game_type
    }

    const initialState = (room as unknown as Room).initial_state

    set({
      gameState: {
        guesses: initialState?.guesses || [],
        current_row: initialState?.current_row || 0,
        game_over: initialState?.game_over || false,
        game_won: initialState?.game_won || false,
        remaining_guesses:
            initialState?.remaining_guesses ?? config.num_of_guesses,
        isLoading: false,
        secret_code: room.secret_code || null,
        room_id: room.id || null,
        config,
        mode: getGameMode(config.game_type),
        players: initialState?.players || [],
        players_data: initialState?.players_data || {},
        winners: initialState?.winners || [],
        game_started: initialState?.game_started || false
      }
    })
  },

  createRoom: async (data) => {
    const room = await gamesApiCreateRoom({ body: data })
    return room
  },

  createRandomSingleplayerRoom: async (data) => {
    const room = await gamesApiCreateRandomSingleplayerRoom({ body: data })
    return room
  }
}))

interface RoomState {
  currentRoom: RoomSchema | null
  rooms: RoomSchema[]
  isLoading: boolean
  error: string | null
}

interface RoomStore {
  roomState: RoomState
  currentOperation: AbortController | null
  setCurrentRoom: (room: RoomSchema | null) => void
  setRooms: (rooms: RoomSchema[]) => void
  addRoom: (room: RoomSchema) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  resetRoomState: () => void
  createRoom: (roomData: CreateRoomRequest) => Promise<RoomSchema | null>
  createQuickPlayRoom: (
      roomData: CreateRandomSingleplayerRoomRequest
  ) => Promise<RoomSchema | null>
}

const MAX_ROOMS_IN_MEMORY = 100

export const useRoomStore = create<RoomStore>((set, get) => ({
  roomState: {
    currentRoom: null,
    rooms: [],
    isLoading: false,
    error: null
  },
  currentOperation: null,

  setCurrentRoom: room => {
    if (room) {
      useGameStore.getState().initializeGameFromRoom(room)
    }

    set(state => ({
      roomState: { ...state.roomState, currentRoom: room, error: null }
    }))
  },

  setRooms: rooms => {
    if (!Array.isArray(rooms)) {
      console.error('Invalid rooms array provided')
      return
    }

    const limitedRooms = rooms.slice(-MAX_ROOMS_IN_MEMORY)

    set(state => ({
      roomState: { ...state.roomState, rooms: limitedRooms, error: null }
    }))
  },

  addRoom: room => {
    if (!room || typeof room !== 'object') {
      console.error('Invalid room provided')
      return
    }

    set(state => {
      const newRooms = [...state.roomState.rooms, room]
      const limitedRooms = newRooms.slice(-MAX_ROOMS_IN_MEMORY)

      return {
        roomState: {
          ...state.roomState,
          rooms: limitedRooms,
          error: null
        }
      }
    })
  },

  setLoading: loading => {
    if (typeof loading !== 'boolean') {
      console.error('Invalid loading state provided')
      return
    }

    set(state => ({
      roomState: { ...state.roomState, isLoading: loading }
    }))
  },

  setError: error => {
    set(state => ({
      roomState: { ...state.roomState, error, isLoading: false }
    }))
  },

  clearError: () => {
    set(state => ({
      roomState: { ...state.roomState, error: null }
    }))
  },

  resetRoomState: () => {
    const currentOp = get().currentOperation
    if (currentOp) {
      currentOp.abort()
    }

    set({
      currentOperation: null,
      roomState: {
        currentRoom: null,
        rooms: [],
        isLoading: false,
        error: null
      }
    })
  },

  createRoom: async roomData => {
    try {
      const currentOp = get().currentOperation
      if (currentOp) {
        currentOp.abort()
      }

      const controller = new AbortController()

      set(state => ({
        currentOperation: controller,
        roomState: { ...state.roomState, isLoading: true, error: null }
      }))

      const response = await gamesApiCreateRoom({
        body: roomData
      })

      if (controller.signal.aborted) {
        return null
      }

      if (response.data) {
        const newRoom = response.data

        const gameStore = useGameStore.getState()
        gameStore.initializeGameFromRoom(newRoom)

        set(state => {
          const newRooms = [...state.roomState.rooms, newRoom]
          const limitedRooms = newRooms.slice(-MAX_ROOMS_IN_MEMORY)

          return {
            currentOperation: null,
            roomState: {
              ...state.roomState,
              rooms: limitedRooms,
              currentRoom: newRoom,
              isLoading: false,
              error: null
            }
          }
        })
        return newRoom
      }

      set(state => ({
        currentOperation: null,
        roomState: { ...state.roomState, isLoading: false }
      }))

      return null
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null
      }

      const errorMessage =
          error instanceof Error ? error.message : 'Failed to create room'

      set(state => ({
        currentOperation: null,
        roomState: {
          ...state.roomState,
          isLoading: false,
          error: errorMessage
        }
      }))

      console.error('Room creation error:', error)
      return null
    }
  },

  createQuickPlayRoom: async roomData => {
    try {
      const currentOp = get().currentOperation
      if (currentOp) {
        currentOp.abort()
      }

      const controller = new AbortController()

      set(state => ({
        currentOperation: controller,
        roomState: { ...state.roomState, isLoading: true, error: null }
      }))

      const response = await gamesApiCreateRandomSingleplayerRoom({
        body: roomData
      })

      if (controller.signal.aborted) {
        return null
      }

      if (response.data) {
        const newRoom = response.data

        const gameStore = useGameStore.getState()
        gameStore.initializeGameFromRoom(newRoom)

        set(state => ({
          currentOperation: null,
          roomState: {
            ...state.roomState,
            currentRoom: newRoom,
            isLoading: false,
            error: null
          }
        }))
        return newRoom
      }

      set(state => ({
        currentOperation: null,
        roomState: { ...state.roomState, isLoading: false }
      }))

      return null
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null
      }

      const errorMessage =
          error instanceof Error
              ? error.message
              : 'Failed to create quick play room'

      set(state => ({
        currentOperation: null,
        roomState: {
          ...state.roomState,
          isLoading: false,
          error: errorMessage
        }
      }))

      console.error('Quick play room creation error:', error)
      return null
    }
  }
}))

export type CreateRoomPayload = CreateRoomRequest
export type CreateQuickPlayPayload = CreateRandomSingleplayerRoomRequest
// export type CheckGamePayload = CheckBullsCowsRequest