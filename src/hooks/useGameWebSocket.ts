// hooks/useGameWebSocket.js
import { useCallback, useEffect } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { useGameStore } from '../stores/gameStore'

export const useGameWebSocket = (roomId) => {
  const { updateGameState, setLoading } = useGameStore()

  const socketUrl = roomId ? `ws://0.0.0.0:8000/ws/game/${roomId}/` : null

  const {
    sendMessage,
    lastMessage,
    readyState,
    getWebSocket
  } = useWebSocket(socketUrl, {
    onOpen: () => {
      console.log('WebSocket connected')
    },
    onClose: () => {
      console.log('WebSocket disconnected')
    },
    onError: (event) => {
      console.error('WebSocket error:', event)
    },
    shouldReconnect: (closeEvent) => {
      return closeEvent.code !== 1000
    },
    reconnectAttempts: 5,
    reconnectInterval: 3000,
  })

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data)
        if (data.type === 'update') {
          updateGameState(data.state)
        }
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    }
  }, [lastMessage, updateGameState])

  const sendGameMessage = useCallback((type, payload) => {
    if (readyState === ReadyState.OPEN) {
      sendMessage(JSON.stringify({ type, payload }))
    }
  }, [sendMessage, readyState])

  const submitGuess = useCallback((guess) => {
    setLoading(true)
    sendGameMessage('make_move', { guess, action: 'submit_guess' })
  }, [sendGameMessage, setLoading])

  const resetGame = useCallback(() => {
    sendGameMessage('make_move', { action: 'reset_game' })
  }, [sendGameMessage])

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState]

  return {
    submitGuess,
    resetGame,
    isConnected: readyState === ReadyState.OPEN,
    isConnecting: readyState === ReadyState.CONNECTING,
    connectionStatus,
    readyState
  }
}