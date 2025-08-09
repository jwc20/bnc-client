import React, { useState, useEffect, useCallback, useRef } from 'react'

interface WebSocketMessage {
  type: string
  state?: GameState
  payload?: any
}

interface GameState {
  moves: any[]
  [key: string]: any
}

export const useWebSocketStore= (roomId: string, autoConnect = true) => {
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected')
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)
  const MAX_RECONNECT_ATTEMPTS = 5
  const RECONNECT_DELAY = 3000

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected')
      return
    }

    try {
      setConnectionStatus('connecting')
      setError(null)

      // Construct WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = '127.0.0.1:8000'
      const wsUrl = `${protocol}//${host}/ws/game/${roomId}/`

      console.log('Connecting to WebSocket:', wsUrl)

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setConnectionStatus('connected')
        reconnectAttemptsRef.current = 0
        setError(null)
      }

      ws.onmessage = event => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data)
          console.log('Received message:', data)
          setLastMessage(data)

          if (data.type === 'update' && data.state) {
            setGameState(data.state)
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
          setError('Failed to parse server message')
        }
      }

      ws.onerror = event => {
        console.error('WebSocket error:', event)
        setError('WebSocket connection error')
        setConnectionStatus('error')
      }

      ws.onclose = event => {
        console.log('WebSocket closed:', event.code, event.reason)
        setConnectionStatus('disconnected')
        wsRef.current = null

        // Auto-reconnect logic
        if (
          autoConnect &&
          reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
        ) {
          reconnectAttemptsRef.current++
          console.log(
            `Reconnecting... Attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, RECONNECT_DELAY)
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setError('Max reconnection attempts reached')
        }
      }
    } catch (err) {
      console.error('Error creating WebSocket:', err)
      setError('Failed to create WebSocket connection')
      setConnectionStatus('error')
    }
  }, [roomId, autoConnect])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
    }

    setConnectionStatus('disconnected')
    reconnectAttemptsRef.current = 0
  }, [])

  const sendMessage = useCallback((type: string, payload?: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, payload })
      console.log('Sending message:', message)
      wsRef.current.send(message)
      return true
    } else {
      console.error('WebSocket not connected')
      setError('Cannot send message: WebSocket not connected')
      return false
    }
  }, [])

  const makeMove = useCallback(
    (moveData: any) => {
      return sendMessage('make_move', moveData)
    },
    [sendMessage]
  )

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [roomId]) // Only re-run if roomId changes

  return {
    // State
    connectionStatus,
    gameState,
    lastMessage,
    error,
    isConnected: connectionStatus === 'connected',

    // Actions
    connect,
    disconnect,
    sendMessage,
    makeMove
  }
}
