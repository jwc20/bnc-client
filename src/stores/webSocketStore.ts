import { create } from 'zustand'

export const useWebSocketStore = create((set, get) => ({
  ws: null,
  isConnected: false,
  gameState: {
    guesses: [],
    currentRow: 0,
    gameOver: false,
    gameWon: false,
    remainingGuesses: 10,
    error: null,
    isLoading: false,
    secretCode: null
  },

  connect: roomId => {
    const ws = new WebSocket(`ws://localhost:8000/ws/game/${roomId}/`)

    ws.onopen = () => {
      console.log('WebSocket connected')
      set({ isConnected: true })
    }

    ws.onmessage = event => {
      const data = JSON.parse(event.data)
      if (data.type === 'update') {
        get().updateGameState(data.state)
      }
    }

    ws.onerror = error => {
      console.error('WebSocket error:', error)
      set(state => ({
        gameState: { ...state.gameState, error: 'Connection error' }
      }))
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      set({ isConnected: false })
    }

    set({ ws })
  },

  disconnect: () => {
    const { ws } = get()
    if (ws) {
      ws.close()
      set({ ws: null, isConnected: false })
    }
  },

  sendMessage: (type, payload) => {
    const { ws, isConnected } = get()
    if (ws && isConnected) {
      ws.send(JSON.stringify({ type, payload }))
    }
  },

  submitGuess: guess => {
    set(state => ({
      gameState: { ...state.gameState, isLoading: true, error: null }
    }))
    get().sendMessage('make_move', { guess, action: 'submit_guess' })
  },

  resetGame: () => {
    get().sendMessage('make_move', { action: 'reset_game' })
  },

  updateGameState: newState => {
    set(state => ({
      gameState: {
        ...state.gameState,
        ...newState,
        isLoading: false
      }
    }))
  },

  clearError: () => {
    set(state => ({
      gameState: { ...state.gameState, error: null }
    }))
  }
}))
