import { ReadyState } from 'react-use-websocket';
import { SingleBoard } from '../components/game/type/SingleBoard.tsx';
import { ColorLegend } from '../components/game/board/ColorLegend.tsx';
import { useGameStore } from '../stores';
import { useGameWebSocket } from '../hooks/useGameWebSocket';
import { InputCode } from '../components/game/board/InputCode.tsx';

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

type CoopGamePageProps = {
    roomId: number
}

export const CoopGamePage = ({ roomId }: CoopGamePageProps) => {
    const { gameState } = useGameStore()
    const {
        submitGuess,
        resetGame,
        isConnected,
        isConnecting,
        readyState,
        connectionStatus
    } = useGameWebSocket(roomId)

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
    const handleSubmitCode = (codeStr: string) => {
        if (gameState.isLoading || !isConnected) return;
        const digits = codeStr.split('').map(Number);
        if (digits.some((d: number) => d < 1 || d > gameState.config.num_of_colors)) {
            alert('Invalid input. Use digits 1-' + gameState.config.num_of_colors + ' only.');
            return;
        }
        submitGuess(codeStr);
    };
    return (
        <div>
            <div className="room-header">
                <h1 className="room-name">Room: {roomId}</h1>
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
                    <SingleBoard colors={COLORS} gameState={gameState} length={gameState.config.code_length} numOfGuesses={gameState.config.num_of_guesses} />
                </div>
                {!gameState.game_over ? (
                    <div className="input-section">
                        <InputCode
                            codeLength={gameState.config.code_length}
                            numOfColors={gameState.config.num_of_colors}
                            colorsArr={COLORS}
                            loading={gameState.isLoading || !isConnected}
                            onSubmit={handleSubmitCode}
                        />
                        <div className="remaining-guesses">
                            Remaining guesses: {gameState.remaining_guesses}
                        </div>
                    </div>
                ) : (
                    <div className="game-over-section">
                        <div className="game-over-text">game over</div>
                        {gameState.game_won ? (
                            <div className="win-message">you won</div>
                        ) : (
                            <div className="lose-message">you lost</div>
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
    .play-again-button {
        margin-top: 12px;
        padding: 8px 16px;
        cursor: pointer;
    }
`;