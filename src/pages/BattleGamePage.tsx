import { ReadyState } from 'react-use-websocket';
import { BattleBoard } from '../components/game/type/BattleBoard.tsx';
import { ColorLegend } from '../components/game/board/ColorLegend.tsx';
import { useGameStore } from '../stores/gameRoomStore';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import { MultiplayerInputCode } from '../components/game/board/MultiplayerInputCode';
import { useAuth } from '../auths/AuthContext'

const COLORS = [
    { value: 'red', label: 'Red', color: '#ff4444' },
    { value: 'blue', label: 'Blue', color: '#4444ff' },
    { value: 'green', label: 'Green', color: '#44ff44' },
    { value: 'yellow', label: 'Yellow', color: '#ffff44' },
    { value: 'purple', label: 'Purple', color: '#ff44ff' },
    { value: 'orange', label: 'Orange', color: '#ff8844' },
    { value: 'pink', label: 'Pink', color: '#ff88cc' },
    { value: 'cyan', label: 'Cyan', color: '#44ffff' },
    { value: 'indigo', label: 'Indigo', color: '#4444aa' },
    { value: 'teal', label: 'Teal', color: '#44aa88' },
    { value: 'maroon', label: 'Maroon', color: '#aa4444' },
    { value: 'navy', label: 'Navy', color: '#444488' },
    { value: 'olive', label: 'Olive', color: '#888844' },
    { value: 'coral', label: 'Coral', color: '#ff6644' },
    { value: 'violet', label: 'Violet', color: '#aa44ff' },
    { value: 'turquoise', label: 'Turquoise', color: '#44ddaa' },
    { value: 'gold', label: 'Gold', color: '#ffcc44' },
    { value: 'crimson', label: 'Crimson', color: '#cc4444' },
    { value: 'salmon', label: 'Salmon', color: '#ff8866' },
    { value: 'brown', label: 'Brown', color: '#aa6644' },
    { value: 'silver', label: 'Silver', color: '#aaaaaa' },
    { value: 'magenta', label: 'Magenta', color: '#ff4488' },
    { value: 'aqua', label: 'Aqua', color: '#44aaff' },
    { value: 'tan', label: 'Tan', color: '#cc9966' },
    { value: 'lavender', label: 'Lavender', color: '#aa88ff' }
];

export const BattleGamePage = ({ roomId }) => {
    const { token: authToken } = useAuth()
    const currentPlayerToken = authToken && authToken.substring(0, 8);
    const { gameState } = useGameStore();

    const {
        submitGuess,
        resetGame,
        isConnected,
        isConnecting,
        readyState,
        connectionStatus
    } = useGameWebSocket(roomId);

    // Check if game should end
    const isGameEnded = () => {
        // Game ends if someone won
        if (gameState.game_won) {
            return true;
        }

        // Game ends if all players have used all their guesses
        const playerGuessCounts = {};
        gameState.guesses.forEach(guess => {
            playerGuessCounts[guess.player] = (playerGuessCounts[guess.player] || 0) + 1;
        });

        return gameState.players?.every(player =>
            (playerGuessCounts[player] || 0) >= gameState.config.num_of_guesses
        );
    };

    if (!gameState.config || !gameState.config.code_length || !gameState.config.num_of_colors) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div style={{ fontSize: '20px', color: '#666' }}>
                    Loading game configuration...
                </div>
            </div>
        );
    }

    if (readyState === ReadyState.UNINSTANTIATED) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div style={{ fontSize: '20px', color: '#666' }}>Invalid room ID</div>
            </div>
        );
    }

    if (isConnecting) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div style={{ fontSize: '20px', color: '#666' }}>
                    Connecting to game server... ({connectionStatus})
                </div>
            </div>
        );
    }

    if (readyState === ReadyState.CLOSED) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                gap: '20px'
            }}>
                <div style={{ fontSize: '20px', color: 'red' }}>
                    Connection lost. Attempting to reconnect...
                </div>
                <div style={{ fontSize: '0.5rem', color: '#666' }}>
                    Status: {connectionStatus}
                </div>
            </div>
        );
    }

    const currentPlayerState = gameState.players_data?.[currentPlayerToken];
    const gameEnded = isGameEnded();
    const currentPlayerGuesses = gameState.guesses.filter(guess => guess.player === currentPlayerToken);

    const handleSubmitCode = (codeStr) => {
        if (gameState.isLoading || !isConnected || gameEnded) return;
        const digits = codeStr.split('').map(Number);
        if (digits.some(d => d < 1 || d > gameState.config.num_of_colors)) {
            alert('Invalid input. Use digits 1-' + gameState.config.num_of_colors + ' only.');
            return;
        }
        submitGuess(codeStr);
    };

    const currentPlayerReachedMax = currentPlayerGuesses.length >= gameState.config.num_of_guesses;

    return (
        <div>
            <div className="room-header">
                <h1 className="room-name">Battle Room: {roomId}</h1>
                <div className="players-count">
                    Players: {gameState.players?.length || 0}
                </div>
            </div>
            <div style={{
                position: 'inherit',
                padding: '8px 12px',
                backgroundColor: isConnected ? '#4CAF50' : '#f44336',
                color: 'white',
                fontSize: '0.4rem',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40%',
                margin: '0 auto',
                textAlign: 'center'
            }}>
                {connectionStatus}
            </div>
            <div className='board-layout'>
                <div className="board-container">
                    <ColorLegend colors={COLORS} gameState={gameState} />
                    <BattleBoard
                        roomId={roomId}
                        colors={COLORS}
                        gameState={gameState}
                        currentPlayerToken={currentPlayerToken}
                        length={gameState.config.code_length}
                        numOfGuesses={gameState.config.num_of_guesses}
                        gameType={gameState.config.game_type}
                    />
                </div>
                {!gameEnded && !currentPlayerReachedMax ? (
                    <div className="input-section">
                        <MultiplayerInputCode
                            codeLength={gameState.config.code_length}
                            numOfColors={gameState.config.num_of_colors}
                            colorsArr={COLORS}
                            loading={gameState.isLoading || !isConnected}
                            onSubmit={handleSubmitCode}
                            gameType={gameState.config.game_type}
                            gameState={gameState}
                            numOfGuesses={gameState.config.num_of_guesses}
                        />
                        <div className="remaining-guesses">
                            Your remaining guesses: {gameState.config.num_of_guesses - currentPlayerGuesses.length}
                        </div>
                    </div>
                ) : (
                    <div className="game-over-section">
                        {gameEnded && (
                            <>
                                <div className="game-over-text">Game Finished!</div>
                                {gameState.winners?.length > 0 ? (
                                    <div className="winners-list">
                                        Winners: {gameState.winners.join(', ')}
                                    </div>
                                ) : (
                                    <div className="no-winners">No winners this round</div>
                                )}
                                {gameState.secret_code && (
                                    <div style={{ marginTop: '8px', fontSize: '0.5rem', color: '#666' }}>
                                        Secret code was: {gameState.secret_code}
                                    </div>
                                )}
                                <button
                                    onClick={resetGame}
                                    disabled={!isConnected}
                                    className="play-again-button"
                                >
                                    Play Again
                                </button>
                            </>
                        )}
                        {currentPlayerReachedMax && !gameEnded && (
                            <>
                                <div className="game-over-text">You're finished!</div>
                                {gameState.game_won && currentPlayerGuesses.some(g => g.bulls === gameState.config.code_length) ? (
                                    <div className="win-message">You found the code!</div>
                                ) : (
                                    <div className="lose-message">Out of guesses</div>
                                )}
                                <div style={{ marginTop: '12px', fontSize: '0.5rem', color: '#666' }}>
                                    Waiting for other players...
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
            <style>{style}</style>
        </div>
    );
};

const style = `
    .room-header {
        text-align: center;
        padding: 10px 0;
        margin-bottom: 10px;
        border-bottom: 1px solid #ccc;
    }
    .room-name {
        margin: 0;
        color: black;
        font-size: 1.2rem;
        font-weight: 600;
        letter-spacing: 0.5px;
    }
    .players-count {
        margin-top: 5px;
        font-size: 0.8rem;
        color: #666;
    }
    .board-layout {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .board-container {
        gap: 32px;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        margin-top: 40px;
    }
    .input-section {
        margin-top: 1.3rem;
    }
    .remaining-guesses {
        margin-top: 1.3rem;
        text-align: center;
        font-size: 0.5rem;
        color: #666;
    }
    .game-over-section {
        margin-top: 24px;
        text-align: center;
    }
    .game-over-text {
        font-style: italic;
        font-size: 18px;
        margin-bottom: 8px;
    }
    .win-message {
        color: green;
        font-weight: bold;
    }
    .lose-message {
        color: red;
    }
    .winners-list {
        color: green;
        font-weight: bold;
        margin-top: 8px;
    }
    .no-winners {
        color: #666;
        margin-top: 8px;
    }
    .play-again-button {
        margin-top: 12px;
        padding: 8px 16px;
        cursor: pointer;
    }
`;