import {ReadyState} from 'react-use-websocket';
import {InputCode} from '../board/InputCode.tsx';
import {useGameWebSocket} from '../../hooks/useGameWebSocket';
import {useGameStore} from '../../stores/gameStore';
import {GameRow} from '../board/GameRow.tsx';
import {GameFeedBackPegs} from "../board/GameFeedBackPegs.tsx";

const COLORS = [
    {value: 'red', label: 'Red', color: '#ff4444'},
    {value: 'blue', label: 'Blue', color: '#4444ff'},
    {value: 'green', label: 'Green', color: '#44ff44'},
    {value: 'yellow', label: 'Yellow', color: '#ffff44'},
    {value: 'purple', label: 'Purple', color: '#ff44ff'},
    {value: 'orange', label: 'Orange', color: '#ff8844'}
];


export const SingleBoard = ({roomId}) => {
    const {gameState} = useGameStore()
    const {
        submitGuess,
        resetGame,
        isConnected,
        isConnecting,
        connectionStatus,
        readyState
    } = useGameWebSocket(roomId)

    const convertGuessToRow = (guess) => {
        return guess.split('').map(digit => COLORS[parseInt(digit) - 1]);
    };

    const gameRows = gameState.guesses.reduce((acc, guess, index) => {
        acc[index] = convertGuessToRow(guess.guess);
        return acc;
    }, {});

    const feedbackState = gameState.guesses.reduce((acc, guess, index) => {
        acc[index] = {bulls: guess.bulls, cows: guess.cows};
        return acc;
    }, {});

    const handleSubmitCode = (codeStr) => {
        if (gameState.isLoading || !isConnected) return;

        const digits = codeStr.split('').map(Number);
        if (digits.some(d => d < 1 || d > COLORS.length)) {
            alert('Invalid input. Use digits 1-6 only.');
            return;
        }

        submitGuess(codeStr);
    };

    // Show connection status
    if (readyState === ReadyState.UNINSTANTIATED) {
        return (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
                <div style={{fontSize: '20px', color: '#666'}}>Invalid room ID</div>
            </div>
        );
    }

    if (isConnecting) {
        return (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
                <div style={{fontSize: '20px', color: '#666'}}>
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
                <div style={{fontSize: '20px', color: 'red'}}>
                    Connection lost. Attempting to reconnect...
                </div>
                <div style={{fontSize: '14px', color: '#666'}}>
                    Status: {connectionStatus}
                </div>
            </div>
        );
    }

    return (
        <div className="game-board-container">
            <div style={{
                position: 'inherit',
                top: '10px',
                right: 0,
                padding: '8px 12px',
                backgroundColor: isConnected ? '#4CAF50' : '#f44336',
                color: 'white',
                fontSize: '0.4rem'
            }}>
                {connectionStatus}
            </div>

            <div className="game-board">

                <div className="game-rows-container">
                    {Array.from({length: 10}).map((_, i) => {
                        const rowIndex = 9 - i;
                        const row = gameRows[rowIndex];
                        const isCurrentRow = rowIndex === gameState.current_row;
                        const isActiveRow = rowIndex <= gameState.current_row;

                        return (
                            <div
                                key={rowIndex}
                                className={`game-board-row ${isActiveRow ? 'active' : 'inactive'}`}
                            >
                                <div className={`row-number ${isCurrentRow ? 'current' : ''}`}>
                                    {rowIndex + 1}
                                </div>
                                <GameRow row={row}/>
                                <div className="feedback-section">
                                    <GameFeedBackPegs
                                        bulls={feedbackState[rowIndex]?.bulls}
                                        cows={feedbackState[rowIndex]?.cows}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {!gameState.game_over ? (
                <div className="input-section">
                    <InputCode
                        length={4}
                        label="Enter code (1-6)"
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
                        <div style={{marginTop: '8px', fontSize: '14px', color: '#666'}}>
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

            <style>{styles}</style>
        </div>
    );
};


const styles = `
    .game-board-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 40px;
    }

    .game-board {
        border: 2px solid #000;
        width: 500px;
        padding: 24px;
    }

    .game-rows-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    .game-board-row {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .game-board-row.active {
        opacity: 1;
    }

    .game-board-row.inactive {
        opacity: 0.6;
    }

    .row-number {
        width: 32px;
        height: 32px;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 18px;
        border: 2px solid #000;
        border-radius: 4px;
    }

    .row-number.current {
        background: #90EE90;
    }

    .game-row {
        display: flex;
        gap: 12px;
    }

    .game-color-peg {
        width: 36px;
        height: 36px;
        border: 2px solid #000;
        border-radius: 50%;
    }

    .feedback-section {
        margin-left: 16px;
    }

    .feedback-pegs-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .feedback-row {
        display: flex;
        gap: 4px;
    }

    .feedback-peg {
        width: 12px;
        height: 12px;
        border: 1px solid #000;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial;
        font-weight: bold;
        font-size: 13px;
    }

    .feedback-peg.black {
        background: #000;
    }

    .feedback-peg.white {
        background: #fff;
    }

    .feedback-peg.empty {
        background: #fafafa;
        color: black;
        font-size: 14px;
    }

    .input-section {
        margin-top: 24px;
    }

    .remaining-guesses {
        margin-top: 8px;
        text-align: center;
        font-size: 14px;
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

    .error-section {
        margin-top: 16px;
        color: red;
        text-align: center;
    }

    .error-close-button {
        margin-left: 8px;
        padding: 4px 8px;
        cursor: pointer;
    }

    .code-input {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
    }

    .code-label {
        font-size: 18px;
        font-weight: 600;
        color: #333;
    }
`;