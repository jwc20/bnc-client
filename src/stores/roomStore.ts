import { create } from 'zustand'
import type {
  RoomSchema,
  CreateRoomRequest,
  CreateRandomSingleplayerRoomRequest
} from '../api/types.gen'
import {
  gamesApiCreateRoom,
  gamesApiCreateRandomSingleplayerRoom
} from '../api/sdk.gen'
import { useGameStore } from './gameStore'

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

// Export types for use in other files
export type { RoomState, RoomStore }

// Re-export payload types for convenience
export type CreateRoomPayload = CreateRoomRequest
export type CreateQuickPlayPayload = CreateRandomSingleplayerRoomRequest
