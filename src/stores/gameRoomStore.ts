
import { create } from 'zustand'
import type { 
  RoomSchema, 
  CreateRoomRequest, 
  CreateRandomSingleplayerRoomRequest,
  CheckBullsCowsResponse,
  CheckBullsCowsRequest 
} from '../api/types.gen'
import { gamesApiCreateRoom, gamesApiCreateRandomSingleplayerRoom } from '../api/sdk.gen'

// Game state types
interface GameGuess {
  guess: string;
  bulls: number;
  cows: number;
}

interface GameConfig {
  code_length: number;
  num_of_colors: number;
  num_of_guesses: number;
}

interface GameState {
  guesses: GameGuess[];
  current_row: number;
  gameOver: boolean;
  game_won: boolean;
  remaining_guesses: number;
  isLoading: boolean;
  secret_code: string | null;
  config: GameConfig;
  room_id: number | null;
}

interface GameStore {
  gameState: GameState;
  updateGameState: (newState: Partial<GameState>) => void;
  setLoading: (loading: boolean) => void;
  resetGameState: () => void;
  addGuess: (guess: string, result: CheckBullsCowsResponse) => void;
  setConfig: (config: Partial<GameConfig>) => void;
  setRoomId: (roomId: number | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: {
    guesses: [],
    current_row: 0,
    gameOver: false,
    game_won: false,
    remaining_guesses: 10,
    isLoading: false,
    secret_code: null,
    room_id: null,
    config: {
      code_length: 4,
      num_of_colors: 6,
      num_of_guesses: 10
    }
  },

  updateGameState: (newState) => {
    console.log("Updating game state:", newState);
    set(state => ({
      gameState: {
        ...state.gameState,
        ...newState,
        isLoading: false
      }
    }))
  },

  setLoading: (loading) => {
    set(state => ({
      gameState: { ...state.gameState, isLoading: loading }
    }))
  },

  addGuess: (guess, result) => {
    set(state => {
      const newGuess: GameGuess = {
        guess,
        bulls: result.bulls,
        cows: result.cows
      };
      
      const newGuesses = [...state.gameState.guesses, newGuess];
      const isWon = result.bulls === state.gameState.config.code_length;
      const newRemainingGuesses = state.gameState.remaining_guesses - 1;
      const isGameOver = isWon || newRemainingGuesses <= 0;

      return {
        gameState: {
          ...state.gameState,
          guesses: newGuesses,
          current_row: state.gameState.current_row + 1,
          game_won: isWon,
          gameOver: isGameOver,
          remaining_guesses: newRemainingGuesses,
          isLoading: false
        }
      }
    })
  },

  setConfig: (config) => {
    set(state => ({
      gameState: {
        ...state.gameState,
        config: { ...state.gameState.config, ...config },
        remaining_guesses: config.num_of_guesses ?? state.gameState.config.num_of_guesses
      }
    }))
  },

  setRoomId: (roomId) => {
    set(state => ({
      gameState: { ...state.gameState, room_id: roomId }
    }))
  },

  resetGameState: () => {
    set(state => ({
      gameState: {
        guesses: [],
        current_row: 0,
        gameOver: false,
        game_won: false,
        remaining_guesses: state.gameState.config.num_of_guesses,
        isLoading: false,
        secret_code: null,
        room_id: null,
        config: state.gameState.config // Preserve config on reset
      }
    }))
  }
}))

// Room store types and implementation
interface RoomState {
  currentRoom: RoomSchema | null;
  rooms: RoomSchema[];
  isLoading: boolean;
  error: string | null;
}

interface RoomStore {
  roomState: RoomState;
  setCurrentRoom: (room: RoomSchema | null) => void;
  setRooms: (rooms: RoomSchema[]) => void;
  addRoom: (room: RoomSchema) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetRoomState: () => void;
  createRoom: (roomData: CreateRoomRequest) => Promise<RoomSchema | null>;
  createQuickPlayRoom: (roomData: CreateRandomSingleplayerRoomRequest) => Promise<RoomSchema | null>;
}

export const useRoomStore = create<RoomStore>((set) => ({
  roomState: {
    currentRoom: null,
    rooms: [],
    isLoading: false,
    error: null
  },

  setCurrentRoom: (room) => {
    set(state => ({
      roomState: { ...state.roomState, currentRoom: room, error: null }
    }))
  },

  setRooms: (rooms) => {
    set(state => ({
      roomState: { ...state.roomState, rooms, error: null }
    }))
  },

  addRoom: (room) => {
    set(state => ({
      roomState: {
        ...state.roomState,
        rooms: [...state.roomState.rooms, room],
        error: null
      }
    }))
  },

  setLoading: (loading) => {
    set(state => ({
      roomState: { ...state.roomState, isLoading: loading }
    }))
  },

  setError: (error) => {
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
    set({
      roomState: {
        currentRoom: null,
        rooms: [],
        isLoading: false,
        error: null
      }
    })
  },

  createRoom: async (roomData) => {
    try {
      set(state => ({
        roomState: { ...state.roomState, isLoading: true, error: null }
      }))

      const response = await gamesApiCreateRoom({
        body: roomData
      })

      if (response.data) {
        const newRoom = response.data
        
        // Add the new room to the rooms list and set as current room
        set(state => ({
          roomState: {
            ...state.roomState,
            rooms: [...state.roomState.rooms, newRoom],
            currentRoom: newRoom,
            isLoading: false,
            error: null
          }
        }))

        return newRoom
      }
      
      return null
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create room'
      set(state => ({
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

  createQuickPlayRoom: async (roomData) => {
    try {
      set(state => ({
        roomState: { ...state.roomState, isLoading: true, error: null }
      }))

      const response = await gamesApiCreateRandomSingleplayerRoom({
        body: roomData
      })

      if (response.data) {
        const newRoom = response.data
        
        // Set as current room (don't add to rooms list since it's single player)
        set(state => ({
          roomState: {
            ...state.roomState,
            currentRoom: newRoom,
            isLoading: false,
            error: null
          }
        }))

        return newRoom
      }
      
      return null
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create quick play room'
      set(state => ({
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

// Helper types for creating rooms
export type CreateRoomPayload = CreateRoomRequest;
export type CreateQuickPlayPayload = CreateRandomSingleplayerRoomRequest;
export type CheckGamePayload = CheckBullsCowsRequest;