import React, { useState, useEffect, useCallback, useRef } from 'react';

import { useRoomWebSocket } from '../hooks/useRoomWebSocket';



// Test Component
const TestWebSocket: React.FC = () => {
    const [roomId, setRoomId] = useState('test123');
    const [moveInput, setMoveInput] = useState('');
    const [messages, setMessages] = useState<string[]>([]);

    const {
        connectionStatus,
        gameState,
        lastMessage,
        error,
        isConnected,
        connect,
        disconnect,
        makeMove,
        sendMessage
    } = useRoomWebSocket(roomId, false); // Manual connect for testing

    // Log messages
    useEffect(() => {
        if (lastMessage) {
            const timestamp = new Date().toLocaleTimeString();
            setMessages(prev => [...prev, `[${timestamp}] ${JSON.stringify(lastMessage)}`]);
        }
    }, [lastMessage]);

    const handleConnect = () => {
        connect();
    };

    const handleDisconnect = () => {
        disconnect();
    };

    const handleMakeMove = () => {
        if (moveInput.trim()) {
            const success = makeMove({
                move: moveInput,
                timestamp: Date.now(),
                player: 'test-player'
            });

            if (success) {
                setMoveInput('');
            }
        }
    };

    const handleSendCustom = () => {
        sendMessage('custom_event', {
            data: 'test data',
            timestamp: Date.now()
        });
    };

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return '#10b981';
            case 'connecting': return '#f59e0b';
            case 'disconnected': return '#6b7280';
            case 'error': return '#ef4444';
            default: return '#6b7280';
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '20px', color: '#1f2937' }}>WebSocket Test Component</h1>

            {/* Connection Controls */}
            <div style={{
                backgroundColor: '#f3f4f6',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                        Room ID:
                    </label>
                    <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        disabled={isConnected}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            marginRight: '8px',
                            width: '200px'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        onClick={handleConnect}
                        disabled={isConnected}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: isConnected ? '#d1d5db' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isConnected ? 'not-allowed' : 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Connect
                    </button>

                    <button
                        onClick={handleDisconnect}
                        disabled={!isConnected}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: !isConnected ? '#d1d5db' : '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: !isConnected ? 'not-allowed' : 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Disconnect
                    </button>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginLeft: '16px'
                    }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor()
                        }} />
                        <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>
                            {connectionStatus}
                        </span>
                    </div>
                </div>

                {error && (
                    <div style={{
                        marginTop: '12px',
                        padding: '8px 12px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        borderRadius: '4px',
                        fontSize: '14px'
                    }}>
                        Error: {error}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{
                backgroundColor: '#f3f4f6',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h3 style={{ marginBottom: '12px', color: '#1f2937' }}>Actions</h3>

                <div style={{ marginBottom: '12px' }}>
                    <input
                        type="text"
                        value={moveInput}
                        onChange={(e) => setMoveInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleMakeMove()}
                        placeholder="Enter move data..."
                        disabled={!isConnected}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            marginRight: '8px',
                            width: '250px'
                        }}
                    />
                    <button
                        onClick={handleMakeMove}
                        disabled={!isConnected}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: !isConnected ? '#d1d5db' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: !isConnected ? 'not-allowed' : 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Make Move
                    </button>
                </div>

                <button
                    onClick={handleSendCustom}
                    disabled={!isConnected}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: !isConnected ? '#d1d5db' : '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: !isConnected ? 'not-allowed' : 'pointer',
                        fontWeight: '500'
                    }}
                >
                    Send Custom Event
                </button>
            </div>

            {/* Game State */}
            <div style={{
                backgroundColor: '#f3f4f6',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h3 style={{ marginBottom: '12px', color: '#1f2937' }}>Game State</h3>
                <pre style={{
                    backgroundColor: '#1f2937',
                    color: '#10b981',
                    padding: '12px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '14px',
                    minHeight: '100px'
                }}>
                    {gameState ? JSON.stringify(gameState, null, 2) : 'No game state yet...'}
                </pre>
            </div>

            {/* Message Log */}
            <div style={{
                backgroundColor: '#f3f4f6',
                padding: '16px',
                borderRadius: '8px'
            }}>
                <h3 style={{ marginBottom: '12px', color: '#1f2937' }}>Message Log</h3>
                <div style={{
                    backgroundColor: '#1f2937',
                    color: '#d1d5db',
                    padding: '12px',
                    borderRadius: '4px',
                    height: '200px',
                    overflow: 'auto',
                    fontSize: '13px',
                    fontFamily: 'monospace'
                }}>
                    {messages.length > 0 ? (
                        messages.map((msg, idx) => (
                            <div key={idx} style={{ marginBottom: '4px' }}>{msg}</div>
                        ))
                    ) : (
                        <div style={{ color: '#6b7280' }}>No messages yet...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export { TestWebSocket }